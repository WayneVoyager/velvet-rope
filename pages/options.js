// Velvet Rope — Options Page Logic
(function () {
  'use strict';

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function sendMsg(type, extra) {
    var payload = { type: type };
    if (extra) Object.assign(payload, extra);
    return chrome.runtime.sendMessage(payload);
  }

  // DOM
  var elAddBtn         = document.getElementById('addRuleBtn');
  var elFormCard       = document.getElementById('formCard');
  var elFormTitle      = document.getElementById('formTitle');
  var elFieldPattern   = document.getElementById('fieldPattern');
  var elFieldLimit     = document.getElementById('fieldLimit');
  var elFieldPrDigits  = document.getElementById('fieldPrimeDigits');
  var elSaveRuleBtn    = document.getElementById('saveRuleBtn');
  var elCancelFormBtn  = document.getElementById('cancelFormBtn');
  var elFormError      = document.getElementById('formError');
  var elRulesContainer = document.getElementById('rulesContainer');
  var elEmptyPage      = document.getElementById('emptyPage');
  var elStatsBar       = document.getElementById('statsBar');
  var elGlobalPrDigits = document.getElementById('globalPrimeDigits');
  var elGlobalLanguage = document.getElementById('globalLanguage');
  var elGlobalTheme    = document.getElementById('globalTheme');
  var elResetTodayBtn  = document.getElementById('resetTodayBtn');
  var elToast          = document.getElementById('toast');

  var allRules = [];
  var todayStats = {};
  var editingRuleId = null;
  var toastTimer = null;
  var currentSettings = { primeDigits: 2, language: 'en', theme: 'dark' };

  // ── Toast ──
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    elToast.textContent = msg;
    elToast.classList.remove('hidden');
    toastTimer = setTimeout(function () { elToast.classList.add('hidden'); }, 2200);
  }

  // ── Stats bar ──
  function renderStatsBar() {
    elStatsBar.innerHTML = '';
    allRules.forEach(function (rule) {
      var stats = todayStats[rule.pattern] || { count: 0, extraUnlocks: 0 };
      var total = rule.dailyLimit + (stats.extraUnlocks || 0);
      var atLimit = stats.count >= total;

      var chip = document.createElement('div');
      chip.className = 'stat-chip';

      var dotClass = 'stat-chip-dot ';
      if (!rule.enabled) dotClass += 'disabled-dot';
      else if (atLimit) dotClass += 'at-limit';
      else dotClass += 'active';

      chip.innerHTML =
        '<div class="' + dotClass + '"></div>' +
        '<span class="stat-chip-domain">' + rule.pattern + '</span>' +
        '<span>' + stats.count + '/' + total + '</span>';

      elStatsBar.appendChild(chip);
    });
  }

  // ── Rule Cards ──
  function renderRuleCards() {
    while (elRulesContainer.firstChild) {
      elRulesContainer.removeChild(elRulesContainer.firstChild);
    }
    elRulesContainer.appendChild(elEmptyPage);

    if (allRules.length === 0) {
      elEmptyPage.classList.remove('hidden');
      window.VR.applyI18n();
      return;
    }
    elEmptyPage.classList.add('hidden');

    allRules.forEach(function (rule) {
      var stats = todayStats[rule.pattern] || { count: 0, extraUnlocks: 0 };
      var total = rule.dailyLimit + (stats.extraUnlocks || 0);
      var ratio = total > 0 ? Math.min(stats.count / total, 1) : 1;
      var atLimit = stats.count >= total;

      var statusClass = !rule.enabled ? 'disabled-dot' : (atLimit ? 'at-limit' : 'active');

      var card = document.createElement('div');
      card.className = 'rule-card' + (!rule.enabled ? ' disabled' : '');
      card.dataset.id = rule.id;

      card.innerHTML =
        '<div class="rule-card-main">' +
          '<div class="rule-card-status ' + statusClass + '"></div>' +
          '<div class="rule-card-pattern" title="' + rule.pattern + '">' + rule.pattern + '</div>' +
          '<div class="rule-card-meta">' +
            '<span class="rule-card-count">' + T('todayStat', stats.count, total) + '</span>' +
            '<span style="font-size:10px;color:var(--text-3)">' + T('digitChallenge', rule.primeDigits || 2) + '</span>' +
          '</div>' +
          '<div class="rule-card-actions">' +
            '<button class="card-action-btn edit-btn" title="Edit">' +
              '<svg viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</button>' +
            '<button class="card-action-btn delete-btn" title="Delete">' +
              '<svg viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M5.5 7v4M8.5 7v4M3.5 4l.5 7.5a.5.5 0 00.5.5h5a.5.5 0 00.5-.5L10.5 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="rule-card-progress">' +
          '<div class="rule-card-progress-fill" style="width:' + (ratio * 100) + '%"></div>' +
        '</div>';

      card.querySelector('.edit-btn').addEventListener('click', function () { openEditForm(rule); });
      card.querySelector('.delete-btn').addEventListener('click', function () { deleteRule(rule.id); });

      elRulesContainer.appendChild(card);
    });
  }

  // ── Form ──
  function openAddForm() {
    editingRuleId = null;
    elFormTitle.textContent = T('newRule');
    elFieldPattern.value = '';
    elFieldLimit.value = '5';
    elFieldPrDigits.value = currentSettings.primeDigits || 2;
    elFormError.classList.add('hidden');
    elFormCard.classList.remove('hidden');
    elFieldPattern.focus();
  }

  function openEditForm(rule) {
    editingRuleId = rule.id;
    elFormTitle.textContent = T('editRule');
    elFieldPattern.value = rule.pattern;
    elFieldLimit.value = rule.dailyLimit;
    elFieldPrDigits.value = rule.primeDigits || 2;
    elFormError.classList.add('hidden');
    elFormCard.classList.remove('hidden');
    elFieldPattern.focus();
  }

  function closeForm() {
    editingRuleId = null;
    elFormCard.classList.add('hidden');
  }

  function saveRule() {
    var pattern = elFieldPattern.value.trim().toLowerCase().replace(/^www\./, '').replace(/\/.*$/, '');
    var limit = parseInt(elFieldLimit.value, 10);
    var primeDigits = parseInt(elFieldPrDigits.value, 10);

    if (!pattern) { showFormError(T('errPatternRequired')); return; }
    if (isNaN(limit) || limit < 1) { showFormError(T('errLimitMin')); return; }

    var dup = allRules.find(function (r) {
      return r.pattern === pattern && r.id !== editingRuleId;
    });
    if (dup) { showFormError(T('errDuplicate')); return; }

    if (editingRuleId) {
      allRules = allRules.map(function (r) {
        if (r.id !== editingRuleId) return r;
        return Object.assign({}, r, { pattern: pattern, dailyLimit: limit, primeDigits: primeDigits });
      });
    } else {
      allRules = allRules.concat([{
        id: generateId(),
        pattern: pattern,
        dailyLimit: limit,
        enabled: true,
        primeDigits: primeDigits
      }]);
    }

    var wasEditing = !!editingRuleId;
    sendMsg('SAVE_RULES', { rules: allRules }).then(function () {
      closeForm();
      renderStatsBar();
      renderRuleCards();
      showToast(T(wasEditing ? 'toastRuleUpdated' : 'toastRuleAdded'));
    });
  }

  function showFormError(msg) {
    elFormError.textContent = msg;
    elFormError.classList.remove('hidden');
  }

  function deleteRule(id) {
    allRules = allRules.filter(function (r) { return r.id !== id; });
    sendMsg('SAVE_RULES', { rules: allRules }).then(function () {
      renderStatsBar();
      renderRuleCards();
      showToast(T('toastRuleRemoved'));
    });
  }

  // ── Global Settings ──
  function saveGlobalSettings() {
    currentSettings.primeDigits = parseInt(elGlobalPrDigits.value, 10);
    currentSettings.language    = elGlobalLanguage.value;
    currentSettings.theme       = elGlobalTheme.value;

    // Apply theme immediately
    document.documentElement.setAttribute('data-theme', currentSettings.theme);
    window.VR.lang = currentSettings.language;
    window.VR.applyI18n();

    // Re-render dynamic content with new language
    elFormTitle.textContent = editingRuleId ? T('editRule') : T('newRule');
    renderStatsBar();
    renderRuleCards();

    sendMsg('SAVE_SETTINGS', { settings: currentSettings }).then(function () {
      showToast(T('toastSettingsSaved'));
    });
  }

  function resetToday() {
    if (!confirm(T('confirmReset'))) return;
    chrome.storage.local.get('visitLog', function (data) {
      var log = data.visitLog || {};
      var today = (function () {
        var d = new Date();
        return d.getFullYear() + '-' +
          String(d.getMonth() + 1).padStart(2, '0') + '-' +
          String(d.getDate()).padStart(2, '0');
      })();
      delete log[today];
      chrome.storage.local.set({ visitLog: log }, function () {
        todayStats = {};
        renderStatsBar();
        renderRuleCards();
        showToast(T('toastCountsReset'));
      });
    });
  }

  // ── Events ──
  elAddBtn.addEventListener('click', openAddForm);
  elSaveRuleBtn.addEventListener('click', saveRule);
  elCancelFormBtn.addEventListener('click', closeForm);
  elGlobalPrDigits.addEventListener('change', saveGlobalSettings);
  elGlobalLanguage.addEventListener('change', saveGlobalSettings);
  elGlobalTheme.addEventListener('change', saveGlobalSettings);
  elResetTodayBtn.addEventListener('click', resetToday);
  elFieldPattern.addEventListener('keydown', function (e) { if (e.key === 'Enter') elFieldLimit.focus(); });
  elFieldLimit.addEventListener('keydown', function (e) { if (e.key === 'Enter') saveRule(); });

  // ── Boot ──
  window.VR.loadPrefs().then(function () {
    window.VR.applyI18n();

    Promise.all([
      sendMsg('GET_RULES'),
      sendMsg('GET_ALL_TODAY_STATS'),
      sendMsg('GET_SETTINGS')
    ]).then(function (results) {
      allRules = Array.isArray(results[0]) ? results[0] : [];
      todayStats = results[1] || {};
      currentSettings = Object.assign(
        { primeDigits: 2, language: 'en', theme: 'dark' },
        results[2] || {}
      );

      elGlobalPrDigits.value = currentSettings.primeDigits || 2;
      elGlobalLanguage.value = currentSettings.language || 'en';
      elGlobalTheme.value    = currentSettings.theme || 'dark';

      // Re-apply i18n for the select option texts
      window.VR.applyI18n();

      renderStatsBar();
      renderRuleCards();
    });
  });

})();
