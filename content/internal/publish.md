# 发布顺序

1. Console 以 OIDC access token 调用 API。浏览器不持有该 token。
2. API 写入 Core。`content:publish` 才允许发布。
3. API 用 `CONTENT_PUBLISH_TOKEN` 把不可变对象交给 Content。
4. Content 校验后切换 `realm-content/current.json`。
5. API 用带时间戳的 HMAC 调用 Realm `/api/internal/revalidate`。
6. Realm 下一轮读取 Content origin。

Ripple 发布只写 `ripple/` 前缀，并在校验失败时保持旧指针。
