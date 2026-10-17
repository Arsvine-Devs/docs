# 数据存储

- Realm Neon：匿名访客计数。
- Platform Neon：Auth 身份/会话，以及 Core 写作与发布状态。具体 database 与 branch 仍以控制面为准。
- Upstash：Console 会话与限流，Realm 分布式限流。不可用时退回进程内状态，多实例不再全局一致。
- COS 私有桶：Realm Catalog 与 Content 对象。
- COS 公有路径经 EdgeOne：`cdn.arsvine.com`。
- DNSPod 管理 `arsvine.com` 记录。证书在 Vercel 或 EdgeOne 侧签发。

废弃环境键：`GITHUB_*`、`REVALIDATE_SECRET`、`NEXT_PUBLIC_CDN_BASE`。现行刷新密钥是 `REVALIDATE_WEBHOOK_SECRET`。
