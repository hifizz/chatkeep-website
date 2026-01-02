## 1. 实现
- [x] 1.1 为 `/api/auth` 与 `/api/rpc` 增加允许来源配置并开启 credentials。
- [x] 1.2 确认 `/api/rpc/me` 会话响应结构满足扩展需求。
- [x] 1.3 新增 `/logout` 页面：调用 signOut 后重定向。
- [x] 1.4 文档化环境变量（基础域名与允许来源）。

## 2. 验证
- [ ] 2.1 本地环境验证（`http://localhost:3030`、`http://localhost:3000` 与 `http://localhost:3040`）。
- [ ] 2.2 dev/prod 域名验证（扩展发起会话查询成功）。
