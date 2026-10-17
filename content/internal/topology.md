# 运行拓扑

Realm、Ripple、Console、Auth、API、Content 各自一个 Vercel 项目。当前生产在 Vercel；Realm `server.js`、Platform Compose、Ripple Node API 保留自托管入口。

浏览器只直接打开展示站、Console、CDN 和状态页。Realm 在服务端读取 Content。Ripple 的 `/api/music` 读取 CDN 上的 `ripple/catalog/current.json`。

Auth 是唯一身份源。API 校验 Auth JWT。Content 的公开响应会去掉受保护正文。
