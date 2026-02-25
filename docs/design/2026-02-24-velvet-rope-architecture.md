# Velvet Rope — 架构设计

**日期**：2026-02-24

## 技术选型

- **Manifest V3**：Chrome 现代扩展标准，使用 Service Worker 替代持久后台页
- **chrome.storage.local**：持久化规则与访问日志
- **chrome.storage.session**：会话级标签页注册表（浏览器关闭自动清除）
- **chrome.webNavigation API**：监听导航事件，实现精准计次与拦截
- **原生 JS + CSS**：无框架依赖，保持轻量

## 模块划分

```
background/service-worker.js   # 核心逻辑（唯一后台进程）
popup/popup.{html,js,css}      # 快速操作弹窗
pages/blocked.{html,js,css}    # 拦截页（质数挑战门）
pages/options.{html,js,css}    # 规则管理设置页
icons/                          # 16/48/128px PNG 图标
```

## 数据模型

### chrome.storage.local
```json
{
  "rules": [
    {
      "id": "abc123",
      "pattern": "zhihu.com",
      "dailyLimit": 5,
      "enabled": true,
      "primeDigits": 2
    }
  ],
  "visitLog": {
    "2026-02-24": {
      "zhihu.com": { "count": 3, "extraUnlocks": 1 }
    }
  },
  "settings": {
    "primeDigits": 2
  }
}
```

### chrome.storage.session（内存级，关闭浏览器清空）
```json
{
  "tabRegistry": {
    "42": { "countedDomain": "zhihu.com" }
  }
}
```

## 核心流程

### 导航拦截
1. `chrome.webNavigation.onCommitted` 触发
2. 仅处理 frameId=0（主框架），跳过非 http/https URL
3. 提取 hostname，遍历规则匹配
4. 查询 tabRegistry：若本 tab 已计次同域名且非 reload → 跳过
5. 查询今日计数：count >= dailyLimit + extraUnlocks → 重定向拦截页
6. 否则：count++，更新 tabRegistry

### 质数挑战解锁
1. 拦截页前端：sieve 生成 9999 以内所有质数，按位数过滤
2. 随机挑选两个指定位数质数 P1、P2，展示乘积
3. 用户填写两个因子，验证：`isPrime(v1) && isPrime(v2) && v1*v2 === product`
4. 正确后发送 `GRANT_EXTRA_UNLOCK` 消息给 Service Worker
5. SW：extraUnlocks++，返回成功
6. 前端：延迟 1.2s 后 `location.href = returnUrl`

## 域名匹配规则

```javascript
function matchesPattern(hostname, pattern) {
  const h = hostname.toLowerCase().replace(/^www\./, '');
  const p = pattern.toLowerCase().replace(/^www\./, '');
  return h === p || h.endsWith('.' + p);
}
```

## 计次逻辑关键点

| 场景 | 结果 |
|------|------|
| 新 Tab 打开受限域名 | 计一次 |
| 刷新（transitionType === 'reload'） | 计一次 |
| 同 Tab 内同域名页面跳转 | 不计 |
| 同 Tab 内跳转到另一受限域名 | 为新域名计一次 |
| 点击拦截页返回原 URL | 不额外计（已授予 extraUnlock） |

## 日志清理

- 每 24 小时通过 `chrome.alarms` 触发清理
- 保留最近 7 天访问日志，超出删除
