// Velvet Rope — i18n
// Usage in HTML: <span data-i18n="key">fallback</span>
// Usage in JS:   T('key')  or  T('dynamicKey', arg1, arg2)

window.VR = window.VR || {};

window.VR.STRINGS = {
  en: {
    // Brand (shared)
    brandName: 'VELVET ROPE',

    // Blocked page
    accessRestricted:   'ACCESS RESTRICTED',
    blockedDomain:      'BLOCKED DOMAIN',
    visitsToday:        function(c, t){ return c + ' / ' + t + ' visits today'; },
    challengeLabel:     'PROVE YOUR INTENT — FACTOR THE PRODUCT',
    productPrefix:      'P\u2081 \u00d7 P\u2082 =',
    inputP1:            'P\u2081',
    inputP2:            'P\u2082',
    verifyBtn:          'VERIFY',
    successText:        'Access granted for this visit.',
    successSub:         'Redirecting\u2026',
    manageRules:        'Manage Rules',
    resetsAtMidnight:   'Limits reset at midnight',
    errNotPrime:        'Both values must be prime numbers.',
    errWrongProduct:    'Incorrect. The product does not match.',
    hintCorrect:        'Correct. Granting access\u2026',

    // Popup
    currentPage:        'CURRENT PAGE',
    allRulesToday:      'ALL RULES \u2014 TODAY',
    enabled:            'Enabled',
    disabled:           'Disabled',
    remove:             'Remove',
    noLimitSet:         'No limit set for this site.',
    dailyLimitLabel:    'Daily limit',
    visitsUnit:         'visits',
    restrictThisSite:   'Restrict This Site',
    noRulesMsg:         'No rules configured.',
    addRuleHint:        'Visit a site and add one above.',
    extPageMsg:         'Not applicable on extension pages.',

    // Options — header / form
    brandSub:           'Access Management',
    addRule:            'Add Rule',
    newRule:            'New Rule',
    editRule:           'Edit Rule',
    domainPatternLabel: 'Domain Pattern',
    domainPlaceholder:  'e.g. zhihu.com',
    subdomainHint:      'Subdomains are matched automatically.',
    dailyLimitFormLabel:'Daily Limit',
    challengeLabel2:    'Challenge',
    saveRule:           'Save Rule',
    cancelBtn:          'Cancel',

    // Options — prime difficulty select
    prime1Easy:   '1-digit primes (easy)',
    prime2Std:    '2-digit primes (standard)',
    prime3Hard:   '3-digit primes (hard)',
    prime4Max:    '4-digit primes (maximum)',

    // Options — empty state
    emptyTitle:   'No rules yet.',
    emptySub:     'Add a domain rule to start managing your access.',

    // Options — settings section
    globalSettings:      'GLOBAL SETTINGS',
    defaultDifficulty:   'Default challenge difficulty',
    defaultDiffHint:     'Applied when adding rules via quick-add popup',
    resetUsageData:      'Reset usage data',
    resetHint:           'Clear all today\u2019s visit counts (rules remain)',
    resetTodayBtn:       'Reset Today',
    languageLabel:       'Language',
    languageHint:        'Interface display language',
    themeLabel:          'Theme',
    themeHint:           'Color scheme preference',
    themeDark:           'Dark',
    themeLight:          'Light',

    // Options — toasts / errors
    errPatternRequired:  'Please enter a domain pattern.',
    errLimitMin:         'Daily limit must be at least 1.',
    errDuplicate:        'A rule for this domain already exists.',
    toastRuleAdded:      'Rule added.',
    toastRuleUpdated:    'Rule updated.',
    toastRuleRemoved:    'Rule removed.',
    toastSettingsSaved:  'Settings saved.',
    toastCountsReset:    'Today\'s counts reset.',
    confirmReset:        'Reset all visit counts for today? This cannot be undone.',

    // Rule card meta
    digitChallenge:      function(d){ return d + '-digit challenge'; },
    todayStat:           function(c, t){ return c + ' / ' + t + ' today'; }
  },

  zh: {
    brandName: 'VELVET ROPE',

    accessRestricted:   '\u8bbf\u95ee\u53d7\u9650',
    blockedDomain:      '\u5df2\u62e6\u622a\u57df\u540d',
    visitsToday:        function(c, t){ return '\u4eca\u65e5\u5df2\u8bbf\u95ee ' + c + ' / ' + t + ' \u6b21'; },
    challengeLabel:     '\u8bc1\u660e\u4f60\u7684\u610f\u5fd7 \u2014 \u5206\u89e3\u8fd9\u4e2a\u4e58\u79ef',
    productPrefix:      'P\u2081 \u00d7 P\u2082 =',
    inputP1:            'P\u2081',
    inputP2:            'P\u2082',
    verifyBtn:          '\u9a8c\u8bc1',
    successText:        '\u672c\u6b21\u8bbf\u95ee\u5df2\u89e3\u9664\u9650\u5236',
    successSub:         '\u8df3\u8f6c\u4e2d\u2026',
    manageRules:        '\u7ba1\u7406\u89c4\u5219',
    resetsAtMidnight:   '\u6bcf\u65e5\u96f6\u70b9\u91cd\u7f6e',
    errNotPrime:        '\u4e24\u4e2a\u5024\u90fd\u5fc5\u987b\u662f\u8d28\u6570',
    errWrongProduct:    '\u4e58\u79ef\u4e0d\u5339\u914d\uff0c\u8bf7\u91cd\u8bd5',
    hintCorrect:        '\u6b63\u786e\uff01\u89e3\u9664\u9650\u5236\u4e2d\u2026',

    currentPage:        '\u5f53\u524d\u9875\u9762',
    allRulesToday:      '\u5168\u90e8\u89c4\u5219 \u2014 \u4eca\u65e5',
    enabled:            '\u5df2\u542f\u7528',
    disabled:           '\u5df2\u7981\u7528',
    remove:             '\u5220\u9664',
    noLimitSet:         '\u8be5\u7f51\u7ad9\u5c1a\u672a\u8bbe\u7f6e\u9650\u5236',
    dailyLimitLabel:    '\u6bcf\u65e5\u9650\u989d',
    visitsUnit:         '\u6b21',
    restrictThisSite:   '\u9650\u5236\u6b64\u7f51\u7ad9',
    noRulesMsg:         '\u5c1a\u672a\u914d\u7f6e\u89c4\u5219',
    addRuleHint:        '\u8bbf\u95ee\u7f51\u7ad9\u540e\uff0c\u4ece\u4e0a\u65b9\u6dfb\u52a0\u89c4\u5219',
    extPageMsg:         '\u6269\u5c55/\u7cfb\u7edf\u9875\u9762\uff0c\u4e0d\u9002\u7528',

    brandSub:           '\u8bbf\u95ee\u7ba1\u7406',
    addRule:            '\u6dfb\u52a0\u89c4\u5219',
    newRule:            '\u65b0\u5efa\u89c4\u5219',
    editRule:           '\u7f16\u8f91\u89c4\u5219',
    domainPatternLabel: '\u57df\u540d\u6a21\u5f0f',
    domainPlaceholder:  '\u4f8b\uff1a zhihu.com',
    subdomainHint:      '\u5b50\u57df\u540d\u4f1a\u81ea\u52a8\u5339\u914d',
    dailyLimitFormLabel:'\u6bcf\u65e5\u9650\u989d',
    challengeLabel2:    '\u6311\u6218\u96be\u5ea6',
    saveRule:           '\u4fdd\u5b58\u89c4\u5219',
    cancelBtn:          '\u53d6\u6d88',

    prime1Easy:   '1\u4f4d\u8d28\u6570\uff08\u7b80\u5355\uff09',
    prime2Std:    '2\u4f4d\u8d28\u6570\uff08\u6807\u51c6\uff09',
    prime3Hard:   '3\u4f4d\u8d28\u6570\uff08\u56f0\u96be\uff09',
    prime4Max:    '4\u4f4d\u8d28\u6570\uff08\u6781\u9650\uff09',

    emptyTitle:   '\u6682\u65e0\u89c4\u5219',
    emptySub:     '\u6dfb\u52a0\u57df\u540d\u89c4\u5219\uff0c\u5f00\u59cb\u7ba1\u7406\u4f60\u7684\u8bbf\u95ee',

    globalSettings:      '\u5168\u5c40\u8bbe\u7f6e',
    defaultDifficulty:   '\u9ed8\u8ba4\u6311\u6218\u96be\u5ea6',
    defaultDiffHint:     '\u901a\u8fc7\u5f39\u7a97\u5feb\u901f\u6dfb\u52a0\u89c4\u5219\u65f6\u4f7f\u7528',
    resetUsageData:      '\u91cd\u7f6e\u4f7f\u7528\u6570\u636e',
    resetHint:           '\u6e05\u9664\u4eca\u65e5\u6240\u6709\u8bbf\u95ee\u6b21\u6570\uff08\u89c4\u5219\u4fdd\u7559\uff09',
    resetTodayBtn:       '\u91cd\u7f6e\u4eca\u65e5',
    languageLabel:       '\u8bed\u8a00',
    languageHint:        '\u754c\u9762\u663e\u793a\u8bed\u8a00',
    themeLabel:          '\u4e3b\u9898',
    themeHint:           '\u914d\u8272\u65b9\u6848\u504f\u597d',
    themeDark:           '\u6df1\u8272',
    themeLight:          '\u65e5\u5149',

    errPatternRequired:  '\u8bf7\u8f93\u5165\u57df\u540d\u6a21\u5f0f',
    errLimitMin:         '\u6bcf\u65e5\u9650\u989d\u4e0d\u80fd\u5c11\u4e8e 1',
    errDuplicate:        '\u8be5\u57df\u540d\u89c4\u5219\u5df2\u5b58\u5728',
    toastRuleAdded:      '\u89c4\u5219\u5df2\u6dfb\u52a0',
    toastRuleUpdated:    '\u89c4\u5219\u5df2\u66f4\u65b0',
    toastRuleRemoved:    '\u89c4\u5219\u5df2\u5220\u9664',
    toastSettingsSaved:  '\u8bbe\u7f6e\u5df2\u4fdd\u5b58',
    toastCountsReset:    '\u4eca\u65e5\u8ba1\u6570\u5df2\u91cd\u7f6e',
    confirmReset:        '\u91cd\u7f6e\u4eca\u65e5\u6240\u6709\u8bbf\u95ee\u6b21\u6570\uff1f\u6b64\u64cd\u4f5c\u4e0d\u53ef\u64a4\u9500\u3002',

    digitChallenge:      function(d){ return d + '\u4f4d\u8d28\u6570\u6311\u6218'; },
    todayStat:           function(c, t){ return '\u4eca\u65e5 ' + c + ' / ' + t; }
  }
};

// Primary translation function
window.T = function (key) {
  var lang = (window.VR && window.VR.lang) || 'en';
  var strings = window.VR.STRINGS[lang] || window.VR.STRINGS.en;
  var val = strings[key];
  if (val === undefined) val = (window.VR.STRINGS.en || {})[key];
  if (val === undefined) return key;
  if (typeof val === 'function') {
    var args = Array.prototype.slice.call(arguments, 1);
    return val.apply(null, args);
  }
  return val;
};

// Apply translations to all [data-i18n] elements in the DOM
window.VR.applyI18n = function () {
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.textContent = T(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    el.placeholder = T(el.getAttribute('data-i18n-placeholder'));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
    el.title = T(el.getAttribute('data-i18n-title'));
  });
};
