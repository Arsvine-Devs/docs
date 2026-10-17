# 故障边界

- Content 不可用：Realm 博客/推文走 Content client 错误边界，旧 pointer 仍可读。
- Revalidate 失败：发布可能已经完成，需要单独重试 HMAC。
- Catalog 不可用：资产 API 返回 502，页面使用既定 fallback。
- Upstash 不可用：限流退回单进程。
- Realm `/api/health` 在生产可能被 Bot Protection 返回 429。Status 应探测允许的路径。
- 本文档站 `/health/ready` 在 OIDC 环境变量缺失时返回 `not_ready`。
