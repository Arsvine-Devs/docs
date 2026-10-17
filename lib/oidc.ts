import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { siteConfig } from '@arsvine/site-config';

export const STATE_COOKIE = 'docs_oidc_state';
export const SESSION_COOKIE = 'docs_session';

type OidcState = {
  state: string;
  nonce: string;
  codeVerifier: string;
  returnTo: string;
  expiresAt: number;
};

export type DocsSession = {
  role: 'owner' | 'editor';
  email: string;
  expiresAt: number;
};

function env(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function base64Url(value: Uint8Array | Buffer) {
  return Buffer.from(value).toString('base64url');
}

function sign(value: string) {
  const secret = env('DOCS_SESSION_SECRET');
  if (!secret) return null;
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function seal(payload: unknown) {
  const body = base64Url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const signature = sign(body);
  if (!signature) throw new Error('DOCS_SESSION_SECRET is not configured.');
  return `${body}.${signature}`;
}

function open<T>(value: string | undefined): T | null {
  if (!value) return null;
  const [body, signature] = value.split('.');
  if (!body || !signature) return null;
  const signatureValue = sign(body);
  if (!signatureValue) return null;
  const expected = Buffer.from(signatureValue);
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export function docsAuthConfigured() {
  return Boolean(env('DOCS_OIDC_CLIENT_ID') && env('DOCS_OIDC_CLIENT_SECRET') && env('DOCS_SESSION_SECRET'));
}

export function normalizeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith('/internal') || value.startsWith('//')) return '/internal';
  return value;
}

export function buildAuthorizationRequest(returnTo: string) {
  const clientId = env('DOCS_OIDC_CLIENT_ID');
  if (!clientId || !docsAuthConfigured()) throw new Error('Docs OIDC client is not configured.');
  const state: OidcState = {
    state: base64Url(randomBytes(24)),
    nonce: base64Url(randomBytes(24)),
    codeVerifier: base64Url(randomBytes(32)),
    returnTo: normalizeReturnTo(returnTo),
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  const challenge = base64Url(createHash('sha256').update(state.codeVerifier).digest());
  const url = new URL(siteConfig.console.oidc.authorizationUrl);
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: siteConfig.docs.oidc.redirectUri,
    response_type: 'code',
    scope: siteConfig.docs.oidc.scope,
    resource: siteConfig.docs.oidc.resource,
    state: state.state,
    nonce: state.nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }).toString();
  return { sealed: seal(state), authorizationUrl: url.toString() };
}

export function readState(value: string | undefined) {
  const state = open<OidcState>(value);
  if (!state || state.expiresAt <= Date.now()) return null;
  return state;
}

export function readSession(value: string | undefined) {
  const session = open<DocsSession>(value);
  if (!session || session.expiresAt <= Date.now()) return null;
  if (session.role !== 'owner' && session.role !== 'editor') return null;
  return session;
}

export function canReadInternal(session: DocsSession | null) {
  return session?.role === 'owner';
}

export async function exchangeAuthorizationCode(code: string, state: OidcState) {
  const clientId = env('DOCS_OIDC_CLIENT_ID');
  const clientSecret = env('DOCS_OIDC_CLIENT_SECRET');
  if (!clientId || !clientSecret) throw new Error('Docs OIDC client is not configured.');
  const credentials = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
  const response = await fetch(siteConfig.console.oidc.tokenUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: siteConfig.docs.oidc.redirectUri,
      code_verifier: state.codeVerifier,
    }),
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  });
  const body = (await response.json().catch(() => null)) as {
    access_token?: string;
    id_token?: string;
    expires_in?: number;
    error_description?: string;
  } | null;
  if (!response.ok || !body?.access_token || !body.id_token) {
    throw new Error(body?.error_description ?? 'OIDC token exchange failed.');
  }
  const jwks = createRemoteJWKSet(new URL(siteConfig.auth.jwksUrl));
  const verified = await jwtVerify(body.id_token, jwks, {
    issuer: siteConfig.auth.issuer,
    audience: clientId,
  });
  if (verified.payload.nonce !== state.nonce) throw new Error('OIDC nonce validation failed.');
  const userInfoResponse = await fetch(siteConfig.console.oidc.userinfoUrl, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${body.access_token}` },
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  });
  const userInfo = (await userInfoResponse.json().catch(() => null)) as Record<string, unknown> | null;
  if (!userInfoResponse.ok || !userInfo) throw new Error('OIDC userinfo request failed.');
  const claims = { ...verified.payload, ...userInfo };
  const roleValue = claims.role;
  const role = roleValue === 'owner' || roleValue === 'editor' ? roleValue : undefined;
  const email = typeof claims.email === 'string' ? claims.email : '';
  if (!role || !email) throw new Error('OIDC identity claims are incomplete.');
  const session: DocsSession = {
    role,
    email,
    expiresAt: Date.now() + Math.max(60, body.expires_in ?? 3600) * 1000,
  };
  return { sealed: seal(session), session };
}
