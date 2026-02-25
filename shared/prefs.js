// Velvet Rope — Preferences Loader
// Reads settings from storage, applies theme attribute, exposes VR.lang.

window.VR = window.VR || {};

window.VR.loadPrefs = function () {
  return new Promise(function (resolve) {
    chrome.storage.local.get('settings', function (data) {
      var s = (data && data.settings) || {};
      var theme = s.theme || 'dark';
      var language = s.language || 'en';
      document.documentElement.setAttribute('data-theme', theme);
      window.VR.lang = language;
      resolve({ theme: theme, language: language });
    });
  });
};
