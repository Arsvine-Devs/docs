import { listInternalDocs } from '@/lib/internal-docs';
import { currentInternalSession } from '@/lib/session';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await currentInternalSession();
  if (!session) return children;
  const pages = listInternalDocs();
  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-6 py-10 md:grid-cols-[16rem_1fr]">
      <aside className="flex flex-col gap-2 text-sm">
        <p className="font-medium">内部文档</p>
        {pages.map((page) => (
          <Link key={page.slug.join('/') || 'index'} href={page.slug.length ? `/internal/${page.slug.join('/')}` : '/internal'}>
            {page.title}
          </Link>
        ))}
      </aside>
      <article className="prose max-w-none">{children}</article>
    </div>
  );
}
