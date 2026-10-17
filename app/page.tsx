import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <p className="text-sm text-neutral-500">Arsvine site system</p>
      <h1 className="text-4xl font-semibold">Arsvine 文档</h1>
      <p className="text-lg text-neutral-700">
        面向访客的使用说明、面向 Agent 的稳定契约，以及需要登录的维护者文档。
      </p>
      <ul className="flex flex-col gap-3 text-lg">
        <li>
          <Link href="/guide">用户指南</Link>
        </li>
        <li>
          <Link href="/reference">Reference（AI / 契约）</Link>
        </li>
        <li>
          <Link href="/internal">内部架构（需 owner 授权）</Link>
        </li>
      </ul>
    </main>
  );
}
