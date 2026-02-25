// Velvet Rope — Blocked Page Logic
(function () {
  'use strict';

  var params     = new URLSearchParams(location.search);
  var domain     = params.get('domain') || 'unknown';
  var returnUrl  = params.get('returnUrl') || '';
  var limit      = parseInt(params.get('limit'), 10) || 0;
  var count      = parseInt(params.get('count'), 10) || 0;

  // Prime utilities
  function sievePrimes(max) {
    var sieve = new Uint8Array(max + 1).fill(1);
    sieve[0] = sieve[1] = 0;
    for (var i = 2; i * i <= max; i++) {
      if (sieve[i]) {
        for (var j = i * i; j <= max; j += i) sieve[j] = 0;
      }
    }
    var result = [];
    for (var k = 2; k <= max; k++) { if (sieve[k]) result.push(k); }
    return result;
  }

  var ALL_PRIMES = sievePrimes(9999);

  function getPrimesOfDigits(digits) {
    if (digits < 1) digits = 1;
    if (digits > 4) digits = 4;
    var min = digits === 1 ? 2 : Math.pow(10, digits - 1);
    var max = Math.pow(10, digits) - 1;
    return ALL_PRIMES.filter(function(p){ return p >= min && p <= max; });
  }

  function isPrime(n) {
    n = Math.abs(Math.round(n));
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (var i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  var challenge = { p1: 0, p2: 0, product: 0 };
  var primeDigits = 2;

  function generateChallenge(digits) {
    var pool = getPrimesOfDigits(digits);
    var p1 = pickRandom(pool);
    var p2 = pickRandom(pool);
    challenge = { p1: p1, p2: p2, product: p1 * p2 };
  }

  // DOM refs
  var elDomain          = document.getElementById('domainName');
  var elCounterBar      = document.getElementById('counterBar');
  var elCounterText     = document.getElementById('counterText');
  var elProduct         = document.getElementById('productValue');
  var elInput1          = document.getElementById('input1');
  var elInput2          = document.getElementById('input2');
  var elHint            = document.getElementById('challengeHint');
  var elVerifyBtn       = document.getElementById('verifyBtn');
  var elChallengeSection= document.getElementById('challengeSection');
  var elSuccessSection  = document.getElementById('successSection');

  function renderDomainInfo() {
    elDomain.textContent = domain;
    var ratio = limit > 0 ? Math.min(count / limit, 1) : 1;
    elCounterBar.style.width = (ratio * 100) + '%';
    elCounterText.textContent = T('visitsToday', count, limit);
    document.title = domain + ' — ' + T('accessRestricted');
  }

  function renderChallenge() {
    generateChallenge(primeDigits);
    elProduct.textContent = challenge.product.toLocaleString();
    elInput1.value = '';
    elInput2.value = '';
    elHint.textContent = '';
    elHint.className = 'challenge-hint';
    elInput1.classList.remove('error', 'success');
    elInput2.classList.remove('error', 'success');
    elVerifyBtn.disabled = false;
    // Update placeholders to current language
    elInput1.placeholder = T('inputP1');
    elInput2.placeholder = T('inputP2');
  }

  function verify() {
    var v1 = parseInt(elInput1.value, 10);
    var v2 = parseInt(elInput2.value, 10);

    if (!isPrime(v1) || !isPrime(v2)) {
      showError(T('errNotPrime'));
      return;
    }
    if (v1 * v2 !== challenge.product) {
      showError(T('errWrongProduct'));
      return;
    }

    elInput1.classList.add('success');
    elInput2.classList.add('success');
    elHint.textContent = T('hintCorrect');
    elHint.className = 'challenge-hint success-text';
    elVerifyBtn.disabled = true;

    chrome.runtime.sendMessage({ type: 'GRANT_EXTRA_UNLOCK', domain: domain }, function () {
      setTimeout(showSuccess, 600);
    });
  }

  function showError(msg) {
    elInput1.classList.remove('success');
    elInput2.classList.remove('success');
    elInput1.classList.add('error');
    elInput2.classList.add('error');
    elHint.textContent = msg;
    elHint.className = 'challenge-hint error-text';
    setTimeout(renderChallenge, 1800);
  }

  function showSuccess() {
    elChallengeSection.classList.add('hidden');
    elSuccessSection.classList.remove('hidden');
    setTimeout(function () {
      location.href = returnUrl || 'about:blank';
    }, 1200);
  }

  elVerifyBtn.addEventListener('click', verify);
  elInput1.addEventListener('keydown', function(e){ if (e.key === 'Enter') elInput2.focus(); });
  elInput2.addEventListener('keydown', function(e){ if (e.key === 'Enter') verify(); });

  // Boot: load prefs first, then render
  window.VR.loadPrefs().then(function () {
    window.VR.applyI18n();

    // Load primeDigits from settings
    chrome.storage.local.get('settings', function (data) {
      var s = (data && data.settings) || {};
      primeDigits = s.primeDigits || 2;
      renderDomainInfo();
      renderChallenge();
      elInput1.focus();
    });
  });

})();
