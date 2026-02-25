# Velvet Rope — 实现说明

**日期**：2026-02-24  
**版本**：1.0.0

## 安装方式

1. 打开 Chrome，地址栏输入 `chrome://extensions/`
2. 右上角开启「开发者模式」
3. 点击「加载已解压的扩展程序」，选择 `/data/dev/chrome_better/` 目录
4. 插件图标出现在工具栏

## 关键实现决策

### 为何不用 declarativeNetRequest 拦截
`declarativeNetRequest` 是 MV3 推荐的请求拦截方式，但它只能基于静态规则拦截，无法动态读取访问计数并条件性放行。本项目必须使用 `webNavigation` + `tabs.update` 的重定向方式。

### tabRegistry 存在 session storage 而非 local
标签页注册表（记录每个 tab 当前已计次的域名）是会话级数据，用户关闭浏览器后所有 tab 消失，不需要持久化。`chrome.storage.session` 是语义最正确的选择，且自动清理无需手动维护。

### 质数验证用 Miller-Rabin 还是试除法
4 位数以内质数最大 9999，试除法验证 9999 最多除到 sqrt(9999)≈100，仅需 50 次奇数除法。完全不需要 Miller-Rabin，简单试除已足够。

### 质数挑战的防作弊考量
用户可以用计算器暴力分解乘积，这是可以接受的。挑战机制的目的是制造摩擦（时间成本），而非真正防止访问。对于 2 位数质数，心算因式分解需要 30-60 秒思考时间，足以打断冲动。

## 文件说明

| 文件 | 职责 |
|------|------|
| `background/service-worker.js` | 导航监听、计次、拦截、消息处理、日志清理 |
| `popup/popup.{html,js,css}` | 快速查看/添加规则弹窗（300px 宽）|
| `pages/blocked.{html,js,css}` | 全屏拦截页，含质数挑战交互 |
| `pages/options.{html,js,css}` | 规则 CRUD、全局设置、今日统计 |
| `icons/*.png` | 16/48/128px 图标（Python 生成）|

## 消息协议

Service Worker 通过 `chrome.runtime.onMessage` 响应以下消息类型：

| type | 参数 | 返回 |
|------|------|------|
| `GET_RULES` | — | Rule[] |
| `SAVE_RULES` | `{ rules }` | `{ success }` |
| `GET_SETTINGS` | — | Settings |
| `SAVE_SETTINGS` | `{ settings }` | `{ success }` |
| `GET_DOMAIN_STATS` | `{ domain }` | `{ count, extraUnlocks }` |
| `GET_ALL_TODAY_STATS` | — | `{ [domain]: stats }` |
| `GRANT_EXTRA_UNLOCK` | `{ domain }` | `{ success, extraUnlocks }` |

## 已知局限

- 用户卸载插件可绕过所有限制（设计上接受）
- 私人模式（Incognito）默认不启用（需用户手动在扩展设置中授权）
- 不支持跨设备同步（chrome.storage.local 为本地存储）
