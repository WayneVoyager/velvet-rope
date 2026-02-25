// Velvet Rope — Popup Logic
(function () {
  'use strict';

  function normalizeHostname(h) {
    return h.toLowerCase().replace(/^www\./, '');
  }

  function matchesPattern(hostname, pattern) {
    var h = normalizeHostname(hostname);
    var p = normalizeHostname(pattern);
    return h === p || h.endsWith('.' + p);
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  var elCurrentDomain = document.getElementById('currentDomain');
  var elStateHasRule  = document.getElementById('stateHasRule');
  var elStateNoRule   = document.getElementById('stateNoRule');
  var elStateExtPage  = document.getElementById('stateExtensionPage');
  var elStatBar       = document.getElementById('statBar');
  var elStatText      = document.getElementById('statText');
  var elRuleToggle    = document.getElementById('ruleToggle');
  var elToggleLabel   = document.getElementById('toggleLabel');
  var elRemoveRuleBtn = document.getElementById('removeRuleBtn');
  var elQuickLimit    = document.getElementById('quickLimit');
  var elQuickAddBtn   = document.getElementById('quickAddBtn');
  var elRulesList     = document.getElementById('rulesList');
  var elEmptyRules    = document.getElementById('emptyRules');
  var elOpenOptions   = document.getElementById('openOptions');

  var currentHostname = '';
  var allRules = [];
  var todayStats = {};
  var matchedRule = null;

  function sendMsg(type, extra) {
    var payload = { type: type };
    if (extra) Object.assign(payload, extra);
    return chrome.runtime.sendMessage(payload);
  }

  function renderCurrentPage(tab) {
    var url;
    try { url = new URL(tab.url); } catch (e) { url = null; }

    if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:')) {
      currentHostname = '';
      elCurrentDomain.textContent = T('extPageMsg');
      return;
    }

    currentHostname = url.hostname;
    elCurrentDomain.textContent = normalizeHostname(currentHostname);

    matchedRule = null;
    for (var i = 0; i < allRules.length; i++) {
      if (matchesPattern(currentHostname, allRules[i].pattern)) {
        matchedRule = allRules[i];
        break;
      }
    }

    if (matchedRule) {
      renderHasRule();
    } else {
      elStateNoRule.classList.remove('hidden');
    }
  }

  function renderHasRule() {
    elStateHasRule.classList.remove('hidden');
    var stats = todayStats[matchedRule.pattern] || { count: 0, extraUnlocks: 0 };
    var total = matchedRule.dailyLimit + (stats.extraUnlocks || 0);
    var ratio = total > 0 ? Math.min(stats.count / total, 1) : 1;
    elStatBar.style.width = (ratio * 100) + '%';
    elStatText.textContent = T('todayStat', stats.count, total);
    elRuleToggle.checked = matchedRule.enabled;
    elToggleLabel.textContent = T(matchedRule.enabled ? 'enabled' : 'disabled');
  }

  function renderRulesList() {
    while (elRulesList.firstChild) elRulesList.removeChild(elRulesList.firstChild);
    elRulesList.appendChild(elEmptyRules);

    if (allRules.length === 0) {
      elEmptyRules.classList.remove('hidden');
      // re-apply i18n inside the empty state spans
      window.VR.applyI18n();
      return;
    }
    elEmptyRules.classList.add('hidden');

    allRules.forEach(function (rule) {
      var stats = todayStats[rule.pattern] || { count: 0, extraUnlocks: 0 };
      var total = rule.dailyLimit + (stats.extraUnlocks || 0);
      var atLimit = stats.count >= total;

      var dotClass = 'rule-row-dot ';
      if (!rule.enabled) dotClass += 'disabled-dot';
      else if (atLimit) dotClass += 'at-limit';
      else dotClass += 'active';

      var row = document.createElement('div');
      row.className = 'rule-row' + (!rule.enabled ? ' disabled' : '');

      var dot = document.createElement('div');
      dot.className = dotClass;

      var domainEl = document.createElement('div');
      domainEl.className = 'rule-row-domain';
      domainEl.title = rule.pattern;
      domainEl.textContent = rule.pattern;

      var countEl = document.createElement('div');
      countEl.className = 'rule-row-count';
      countEl.textContent = stats.count + '/' + total;

      row.appendChild(dot);
      row.appendChild(domainEl);
      row.appendChild(countEl);
      elRulesList.appendChild(row);
    });
  }

  function handleToggleRule() {
    if (!matchedRule) return;
    matchedRule.enabled = elRuleToggle.checked;
    elToggleLabel.textContent = T(matchedRule.enabled ? 'enabled' : 'disabled');
    var updated = allRules.map(function (r) { return r.id === matchedRule.id ? matchedRule : r; });
    sendMsg('SAVE_RULES', { rules: updated }).then(function () {
      allRules = updated;
      renderRulesList();
    });
  }

  function handleRemoveRule() {
    if (!matchedRule) return;
    var updated = allRules.filter(function (r) { return r.id !== matchedRule.id; });
    sendMsg('SAVE_RULES', { rules: updated }).then(function () {
      allRules = updated;
      matchedRule = null;
      elStateHasRule.classList.add('hidden');
      elStateNoRule.classList.remove('hidden');
      renderRulesList();
    });
  }

  function handleQuickAdd() {
    var limit = parseInt(elQuickLimit.value, 10);
    if (!currentHostname || isNaN(limit) || limit < 1) return;
    var pattern = normalizeHostname(currentHostname);
    var newRule = { id: generateId(), pattern: pattern, dailyLimit: limit, enabled: true, primeDigits: 2 };
    allRules = allRules.concat([newRule]);
    sendMsg('SAVE_RULES', { rules: allRules }).then(function () {
      matchedRule = newRule;
      elStateNoRule.classList.add('hidden');
      renderHasRule();
      renderRulesList();
    });
  }

  elRuleToggle.addEventListener('change', handleToggleRule);
  elRemoveRuleBtn.addEventListener('click', handleRemoveRule);
  elQuickAddBtn.addEventListener('click', handleQuickAdd);
  elQuickLimit.addEventListener('keydown', function (e) { if (e.key === 'Enter') handleQuickAdd(); });
  elOpenOptions.addEventListener('click', function () {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  // Boot
  window.VR.loadPrefs().then(function () {
    window.VR.applyI18n();

    Promise.all([
      chrome.tabs.query({ active: true, currentWindow: true }),
      sendMsg('GET_RULES'),
      sendMsg('GET_ALL_TODAY_STATS')
    ]).then(function (results) {
      var tab = results[0][0];
      allRules = Array.isArray(results[1]) ? results[1] : [];
      todayStats = results[2] || {};
      renderCurrentPage(tab);
      renderRulesList();
    });
  });

})();
