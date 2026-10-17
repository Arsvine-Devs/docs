import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { exchangeAuthorizationCode, readState, SESSION_COOKIE, STATE_COOKIE } from '@/lib/oidc';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const stateValue = url.searchParams.get('state');
  const jar = await cookies();
  const stored = readState(jar.get(STATE_COOKIE)?.value);
  if (!code || !stored || stored.state !== stateValue) {
    return NextResponse.redirect(new URL('/?auth=invalid', url.origin));
  }
  try {
    const { sealed, session } = await exchangeAuthorizationCode(code, stored);
    if (session.role !== 'owner') {
      return NextResponse.redirect(new URL('/?auth=forbidden', url.origin));
    }
    const response = NextResponse.redirect(new URL(stored.returnTo, url.origin));
    response.cookies.set(SESSION_COOKIE, sealed, {
      httpOnly: true,
      sameSite: 'lax',
      secure: url.protocol === 'https:',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch {
    return NextResponse.redirect(new URL('/?auth=failed', url.origin));
  }
}
