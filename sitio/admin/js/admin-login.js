(function () {
  'use strict';
  var form = document.getElementById('loginForm');
  var alertEl = document.getElementById('alert');

  function showError(msg) {
    alertEl.innerHTML = '<div class="vo-login-alert vo-login-alert-error">' + msg + '</div>';
  }

  // Si ya hay sesion de admin activa, saltar directo al dashboard.
  window.VOAdmin.api('/me').then(function (data) {
    if (data.authenticated) window.location.href = 'index.html';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    alertEl.innerHTML = '';
    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value;
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;

    window.VOAdmin.api('/login', { method: 'POST', body: { username: username, password: password } })
      .then(function () {
        window.location.href = 'index.html';
      })
      .catch(function () {
        showError('Usuario o contraseña incorrectos.');
        btn.disabled = false;
      });
  });

  /* ══ Google SSO (opcional, solo si ADMIN_GOOGLE_EMAIL esta configurada) ══ */
  window.VOAdmin.api('/google-sso-status').then(function (status) {
    if (!status.enabled || !status.clientId) return;

    document.getElementById('googleSsoSep').hidden = false;
    var target = document.getElementById('g_id_signin');

    function handleCredential(response) {
      window.VOAdmin.api('/login/google', { method: 'POST', body: { credential: response && response.credential } })
        .then(function () {
          window.location.href = 'index.html';
        })
        .catch(function () {
          showError('Esa cuenta de Google no tiene acceso al panel.');
        });
    }

    function renderButton() {
      if (!(window.google && google.accounts && google.accounts.id)) return;
      google.accounts.id.initialize({ client_id: status.clientId, callback: handleCredential });
      google.accounts.id.renderButton(target, { theme: 'outline', size: 'large', text: 'signin_with' });
    }

    if (window.google && google.accounts && google.accounts.id) {
      renderButton();
    } else {
      var tries = 0;
      var iv = setInterval(function () {
        tries++;
        if (window.google && google.accounts && google.accounts.id) {
          clearInterval(iv);
          renderButton();
        } else if (tries > 100) {
          clearInterval(iv);
        }
      }, 200);
    }
  }).catch(function () { /* si falla el check, simplemente no se muestra el boton */ });
})();
