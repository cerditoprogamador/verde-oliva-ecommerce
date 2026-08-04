(function () {
  'use strict';
  var form = document.getElementById('loginForm');
  var alertEl = document.getElementById('alert');

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
        alertEl.innerHTML = '<div class="adm-alert adm-alert-error">Usuario o contraseña incorrectos.</div>';
        btn.disabled = false;
      });
  });
})();
