// Velvet Rope — Service Worker
// Handles visit counting, domain matching, tab tracking, and blocking logic.

const KEY_RULES = 'rules';
const KEY_VISIT_LOG = 'visitLog';
const KEY_SETTINGS = 'settings';
const KEY_TAB_REGISTRY = 'tabRegistry';

// ─────────────────────────────────────────────
// Date / Storage helpers
// ─────────────────────────────────────────────

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function getRules() {
  const { rules } = await chrome.storage.local.get(KEY_RULES);
  return rules || [];
}

async function getSettings() {
  const { settings } = await chrome.storage.local.get(KEY_SETTINGS);
  return Object.assign({ primeDigits: 2, language: 'en', theme: 'dark' }, settings || {});
}

async function getVisitLog() {
  const { visitLog } = await chrome.storage.local.get(KEY_VISIT_LOG);
  return visitLog || {};
}

async function saveVisitLog(log) {
  await chrome.storage.local.set({ [KEY_VISIT_LOG]: log });
}

async function getTabRegistry() {
  try {
    const { tabRegistry } = await chrome.storage.session.get(KEY_TAB_REGISTRY);
    return tabRegistry || {};
  } catch {
    // Fallback: storage.session not available in older contexts
    return {};
  }
}

async function saveTabRegistry(registry) {
  try {
    await chrome.storage.session.set({ [KEY_TAB_REGISTRY]: registry });
  } catch {
    // noop
  }
}

// ─────────────────────────────────────────────
// Domain matching
// ─────────────────────────────────────────────

function normalizeHostname(h) {
  return h.toLowerCase().replace(/^www\./, '');
}

function matchesPattern(hostname, pattern) {
  const h = normalizeHostname(hostname);
  const p = normalizeHostname(pattern);
  return h === p || h.endsWith('.' + p);
}

function findMatchingRule(hostname, rules) {
  for (const rule of rules) {
    if (rule.enabled && matchesPattern(hostname, rule.pattern)) return rule;
  }
  return null;
}

// ─────────────────────────────────────────────
// Visit log helpers
// ─────────────────────────────────────────────

async function getDomainData(domain) {
  const log = await getVisitLog();
  const today = getTodayKey();
  if (!log[today]) log[today] = {};
  if (!log[today][domain]) log[today][domain] = { count: 0, extraUnlocks: 0 };
  return { log, today, data: log[today][domain] };
}

// ─────────────────────────────────────────────
// Core navigation handler
// ─────────────────────────────────────────────

async function handleNavigation(details) {
  if (details.frameId !== 0) return;
  if (!details.url.startsWith('http://') && !details.url.startsWith('https://')) return;

  let url;
  try { url = new URL(details.url); } catch { return; }

  const rules = await getRules();
  const matched = findMatchingRule(url.hostname, rules);
  if (!matched) return;

  const tabRegistry = await getTabRegistry();
  const tabData = tabRegistry[details.tabId];
  const isReload = details.transitionType === 'reload';
  const alreadyCounted = tabData && tabData.countedDomain === matched.pattern;

  if (alreadyCounted && !isReload) return;

  const { log, today, data } = await getDomainData(matched.pattern);
  const totalAllowed = matched.dailyLimit + data.extraUnlocks;

  if (data.count >= totalAllowed) {
    const blockedUrl = chrome.runtime.getURL(
      `pages/blocked.html?domain=${encodeURIComponent(matched.pattern)}&returnUrl=${encodeURIComponent(details.url)}&limit=${matched.dailyLimit}&count=${data.count}`
    );
    chrome.tabs.update(details.tabId, { url: blockedUrl });
    return;
  }

  data.count++;
  await saveVisitLog(log);

  tabRegistry[details.tabId] = { countedDomain: matched.pattern };
  await saveTabRegistry(tabRegistry);
}

// ─────────────────────────────────────────────
// Event listeners
// ─────────────────────────────────────────────

chrome.webNavigation.onCommitted.addListener(handleNavigation);

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const tabRegistry = await getTabRegistry();
  delete tabRegistry[tabId];
  await saveTabRegistry(tabRegistry);
});

// ─────────────────────────────────────────────
// Message handler
// ─────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'GRANT_EXTRA_UNLOCK':
      grantExtraUnlock(message.domain).then(sendResponse);
      return true;
    case 'GET_DOMAIN_STATS':
      getDomainStats(message.domain).then(sendResponse);
      return true;
    case 'GET_ALL_TODAY_STATS':
      getAllTodayStats().then(sendResponse);
      return true;
    case 'GET_RULES':
      getRules().then(sendResponse);
      return true;
    case 'SAVE_RULES':
      saveRules(message.rules).then(sendResponse);
      return true;
    case 'GET_SETTINGS':
      getSettings().then(sendResponse);
      return true;
    case 'SAVE_SETTINGS':
      saveSettings(message.settings).then(sendResponse);
      return true;
  }
});

async function grantExtraUnlock(domain) {
  const { log, today, data } = await getDomainData(domain);
  data.extraUnlocks++;
  await saveVisitLog(log);
  return { success: true, extraUnlocks: data.extraUnlocks };
}

async function getDomainStats(domain) {
  const { data } = await getDomainData(domain);
  return data;
}

async function getAllTodayStats() {
  const log = await getVisitLog();
  return log[getTodayKey()] || {};
}

async function saveRules(rules) {
  await chrome.storage.local.set({ [KEY_RULES]: rules });
  return { success: true };
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ [KEY_SETTINGS]: settings });
  return { success: true };
}

// ─────────────────────────────────────────────
// Daily log cleanup (keep 7 days)
// ─────────────────────────────────────────────

async function cleanupOldLogs() {
  const log = await getVisitLog();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  for (const dateKey of Object.keys(log)) {
    const [y, m, d] = dateKey.split('-').map(Number);
    if (new Date(y, m - 1, d) < cutoff) delete log[dateKey];
  }
  await saveVisitLog(log);
}

chrome.alarms.create('dailyCleanup', { periodInMinutes: 60 * 24 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyCleanup') cleanupOldLogs();
});
