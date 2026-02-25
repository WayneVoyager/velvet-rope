<p align="center">
  <img src="docs/assets/banner.png" alt="Velvet Rope" width="800"/>
</p>

<p align="center">
  <strong>一款克制冲动浏览的 Chrome 扩展</strong><br>
  <sub>用每日访问次数限制 + 质数挑战门，为你的注意力拉起一道丝绒绳。</sub>
</p>

<p align="center">
  简体中文 | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=flat-square" alt="Manifest V3"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License"/>
  <img src="https://img.shields.io/badge/Language-中文%20%2F%20English-c9a84c?style=flat-square" alt="i18n"/>
  <img src="https://img.shields.io/badge/Theme-Dark%20%2F%20Light-8585a8?style=flat-square" alt="Theme"/>
  <img src="https://img.shields.io/badge/Dependencies-Zero-56cfaa?style=flat-square" alt="Zero Dependencies"/>
</p>

---

## 为什么做这个

你可能也有过这样的经历：打开浏览器想查个东西，回过神来发现已经在知乎、B站、微博上漫游了四十分钟。

问题不在于"访问"本身——你确实需要用这些网站。问题在于**频率失控**。

Velvet Rope 不会完全封禁任何网站。它只做一件事：**给每个网站设定每天的访问次数上限**。达到上限后，你需要解一道质数分解题才能继续——不是为了真正阻止你，而是在冲动和行动之间插入一段**有意的停顿**。

> 就像夜店门口的丝绒绳：它拦截的是冲动，不是意志。

<p align="center">
  <img src="docs/assets/how-it-works.png" alt="工作原理" width="720"/>
</p>

## 核心功能

### 访问次数限制

为任意域名设置每日访问上限。设置 `zhihu.com` 后，`www.zhihu.com`、`zhuanlan.zhihu.com/p/xxx` 等所有子域名和路径均自动匹配。

### 智能计次

以**标签页**为粒度计次，而非简单地统计页面加载。同一个标签页内浏览同域名下的多个页面只算一次，避免无意义的计数膨胀。刷新页面会重新计次。

### 质数挑战门

超限后不是简单地弹一个"已屏蔽"提示。Velvet Rope 会展示两个质数的乘积，要求你反向分解出这两个质因子。

- 默认 2 位数质数（心算约需 30-60 秒）
- 可配置 1-4 位数，从简单到极限
- 答对获得 +1 次额外访问机会

这个设计的核心思路：**不是要彻底阻止你，而是制造足够的摩擦力让你思考"我真的需要现在打开这个页面吗"**。

### 一键快速添加

点击工具栏图标，自动识别当前网站域名，设置访问上限，一步完成。

### 双语 & 双主题

- 中文 / English 完整支持
- 深色 / 日光 两套主题，在设置页即时切换

## 安装

```bash
git clone https://github.com/WayneVoyager/velvet-rope.git
```

1. 打开 Chrome，地址栏输入 `chrome://extensions/`
2. 右上角开启「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择克隆下来的项目目录

## 使用

| 操作 | 方式 |
|------|------|
| 添加规则 | 点击工具栏图标 → 设置每日限额 → 完成 |
| 查看今日状态 | 点击工具栏图标，查看所有规则的当日用量 |
| 管理规则 | 点击弹窗右上角齿轮图标，进入设置页 |
| 超限后继续访问 | 在拦截页解答质数挑战题 |
| 切换语言/主题 | 设置页 → 全局设置 → 语言 / 主题 |

## 项目结构

```
velvet-rope/
├── manifest.json              # Chrome MV3 清单
├── background/
│   └── service-worker.js      # 核心逻辑：拦截、计次、消息处理
├── popup/
│   └── popup.html / js / css  # 快速操作弹窗
├── pages/
│   ├── blocked.html / js / css  # 拦截页（质数挑战门）
│   └── options.html / js / css  # 规则管理 & 设置
├── shared/
│   ├── i18n.js                # 中英文字符串表
│   └── prefs.js               # 偏好加载器
├── icons/                     # 16/48/128px 图标
└── docs/                      # 设计文档 & 资源
```

## 设计理念

**命名**：Velvet Rope（丝绒绳）—— 高档场所入口的门禁绳。它的存在不是为了制造对抗，而是暗示一种秩序：访问是一种特权，而非随时可取的消耗品。

**视觉**：拟物与扁平的混合。深色模式下，近黑底色搭配哑光金点缀，冷灰文字层次分明。日光模式下，冷白底色衬托深海军蓝门柱和金色绳索。拦截页的绳索门柱是唯一的拟物元素，提醒你——这里有一道门。

**交互哲学**：不追求严格封禁（用户随时可以卸载插件），而是制造恰到好处的认知摩擦。质数挑战不是惩罚，是一个让你重新获得对注意力控制权的仪式。

## 技术细节

- **Manifest V3**：使用 Service Worker 替代持久后台页，符合 Chrome 最新标准
- **零依赖**：纯原生 JavaScript + CSS，无框架，整个扩展体积 < 50KB
- **chrome.webNavigation API**：精准监听导航事件
- **chrome.storage.local**：持久化规则与访问日志
- **chrome.storage.session**：会话级标签页注册表，浏览器关闭自动清理
- **自动清理**：每 24 小时通过 `chrome.alarms` 清理超过 7 天的历史日志

## 许可证

[MIT](LICENSE)

---

<p align="center">
  <sub>Velvet Rope — 用一道绳子，找回你的时间。</sub>
</p>
