# Arsvine 文档站

Arsvine 站点体系的文档应用，目标域名 `https://docs.arsvine.com`。

English: documentation site for visitors, agents, and authorized maintainers. It replaces the old Rspress guide.

| 读者 | 路径 |
| --- | --- |
| 访客 | `/guide` |
| Agent / 契约 | `/reference`、`/llms.txt` |
| 维护者 | `/internal`（Auth owner） |

## 本地

Node 24，pnpm 12.14。

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

内部文档在未配置 `DOCS_OIDC_CLIENT_ID`、`DOCS_OIDC_CLIENT_SECRET`、`DOCS_SESSION_SECRET` 时只显示未开放说明，不输出正文。

本仓库默认分支 `master`。开发用 `dev/<topic>`。绑定域名和部署需要单独授权。
