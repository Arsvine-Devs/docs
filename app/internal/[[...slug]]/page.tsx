import { readInternalDoc } from '@/lib/internal-docs';
import { buildAuthorizationRequest, docsAuthConfigured, STATE_COOKIE } from '@/lib/oidc';
import { currentInternalSession } from '@/lib/session';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export const dynamic = 'force-dynamic';

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const session = await currentInternalSession();
  const { slug } = await props.params;
  const returnTo = slug?.length ? `/internal/${slug.join('/')}` : '/internal';
  if (!session) {
    if (!docsAuthConfigured()) {
      return (
        <main className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-2xl font-semibold">内部文档未开放</h1>
          <p className="mt-3">
            需要配置 <code>DOCS_OIDC_CLIENT_ID</code>、<code>DOCS_OIDC_CLIENT_SECRET</code> 与{' '}
            <code>DOCS_SESSION_SECRET</code> 后，通过 Auth 的 owner 身份访问。正文不会下发。
          </p>
        </main>
      );
    }
    const request = buildAuthorizationRequest(returnTo);
    const jar = await cookies();
    jar.set(STATE_COOKIE, request.sealed, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 600,
    });
    redirect(request.authorizationUrl);
  }
  const doc = readInternalDoc(slug);
  if (!doc) notFound();
  return (
    <>
      <ReactMarkdown>{doc.body}</ReactMarkdown>
    </>
  );
}
