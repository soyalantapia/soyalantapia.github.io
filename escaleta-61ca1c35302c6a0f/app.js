(function () {
  'use strict';

  var CLAVE = 'escaleta:v1';
  var datos = null;
  var vista = 'tema';
  var estado = { actual: null, hecho: {}, saltado: {} };
  var $ = function (id) { return document.getElementById(id); };

  // ── Lo que se recuerda en este teléfono ──────────────────────────────────
  function leerEstado() {
    try {
      var s = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (s && typeof s === 'object') {
        estado.actual = typeof s.actual === 'string' ? s.actual : null;
        estado.hecho = s.hecho && typeof s.hecho === 'object' ? s.hecho : {};
        estado.saltado = s.saltado && typeof s.saltado === 'object' ? s.saltado : {};
      }
    } catch (e) { /* sin almacenamiento: anda igual, sólo que no recuerda */ }
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* nada */ }
  }

  // ── Ayudas ───────────────────────────────────────────────────────────────
  function lista() { return datos ? datos.temas : []; }
  function cerrado(t) { return !!(estado.hecho[t.id] || estado.saltado[t.id]); }
  function indiceDe(id) {
    var ts = lista();
    for (var i = 0; i < ts.length; i++) { if (ts[i].id === id) return i; }
    return -1;
  }
  function indiceActual() { var i = indiceDe(estado.actual); return i < 0 ? 0 : i; }
  function proximoAbierto(desde) {
    var ts = lista();
    for (var i = desde + 1; i < ts.length; i++) { if (!cerrado(ts[i])) return i; }
    for (var j = 0; j < Math.min(desde + 1, ts.length); j++) { if (!cerrado(ts[j])) return j; }
    return -1;
  }
  function hechos() { return lista().filter(function (t) { return estado.hecho[t.id]; }).length; }
  function saltados() { return lista().filter(function (t) { return estado.saltado[t.id] && !estado.hecho[t.id]; }); }
  function dos(n) { return n < 10 ? '0' + n : String(n); }
  function texto(el, s) { el.textContent = s == null ? '' : String(s); }
  function fecha(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : (iso || ''); }
  function arriba() { window.scrollTo(0, 0); }
  function vibrar() { try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) { /* nada */ } }
  // Lo que va entre corchetes es una escena que tiene que poner Alan: se muestra aparte.
  function conEscenas(el, s) {
    var partes = String(s == null ? '' : s).split(/\[([^\]]+)\]/);
    partes.forEach(function (parte, k) {
      if (!parte) return;
      if (k % 2 === 1) {
        var span = document.createElement('span');
        span.className = 'escena';
        var b = document.createElement('b');
        b.textContent = 'Tu escena: ';
        span.appendChild(b);
        span.appendChild(document.createTextNode(parte));
        el.appendChild(span);
      } else {
        el.appendChild(document.createTextNode(parte));
      }
    });
  }
  function etiqueta(txt, cls) {
    var s = document.createElement('span');
    s.className = 'etiqueta ' + cls;
    s.textContent = txt;
    return s;
  }

  // ── Vistas ───────────────────────────────────────────────────────────────
  function mostrar(v) {
    vista = v;
    ['tema', 'lista', 'fin', 'error'].forEach(function (k) { $('vista-' + k).hidden = k !== v; });
    $('acciones').hidden = v !== 'tema';
    $('contador').hidden = v === 'error';
  }

  // ── Modo: entender (todo) o grabar (lo mínimo) ───────────────────────────
  var CLAVE_MODO = 'escaleta:modo';
  var modo = 'entender';
  function leerModo() {
    try {
      var m = localStorage.getItem(CLAVE_MODO);
      if (m === 'entender' || m === 'grabar') modo = m;
    } catch (e) { /* nada */ }
  }
  function aplicarModo() {
    document.body.classList.toggle('grabar', modo === 'grabar');
    $('modo-entender').setAttribute('aria-pressed', String(modo === 'entender'));
    $('modo-grabar').setAttribute('aria-pressed', String(modo === 'grabar'));
  }
  function cambiarModo(m) {
    modo = m;
    try { localStorage.setItem(CLAVE_MODO, m); } catch (e) { /* nada */ }
    aplicarModo();
  }
  $('modo-entender').addEventListener('click', function () { cambiarModo('entender'); });
  $('modo-grabar').addEventListener('click', function () { cambiarModo('grabar'); });

  function pintarTema() {
    var ts = lista();
    var i = indiceActual();
    var t = ts[i];
    estado.actual = t.id;

    var h = $('tema');
    h.textContent = '';
    var num = document.createElement('span');
    num.className = 'num';
    num.textContent = dos(i + 1);
    var nom = document.createElement('span');
    nom.textContent = t.tema || '';
    h.appendChild(num);
    h.appendChild(nom);
    if (estado.hecho[t.id]) h.appendChild(etiqueta('Grabado', 'ok'));
    else if (estado.saltado[t.id]) h.appendChild(etiqueta('Saltado', 'salto'));
    if (t.si_hay_tiempo) h.appendChild(etiqueta('Si hay tiempo', 'opcional'));

    texto($('gancho'), t.gancho);
    var ol = $('puntos');
    ol.textContent = '';
    (Array.isArray(t.puntos) ? t.puntos : []).forEach(function (p) {
      var li = document.createElement('li');
      conEscenas(li, p);
      ol.appendChild(li);
    });
    texto($('cierre'), t.cierre);
    texto($('aquien'), t.a_quien);
    texto($('angulo'), t.angulo ? 'Ángulo: ' + t.angulo : '');
    texto($('polemica'), t.polemica);
    texto($('insight'), t.insight);
    texto($('objetivo'), t.objetivo);
    $('campo-polemica').hidden = !t.polemica;
    $('campo-insight').hidden = !t.insight;
    $('campo-objetivo').hidden = !t.objetivo;

    $('anterior').disabled = i === 0;
    texto($('contador'), (i + 1) + ' / ' + ts.length);
    document.title = dos(i + 1) + ' · ' + (t.tema || '') + ' · Escaleta';
  }

  function pintarLista() {
    var ts = lista();
    var actual = indiceActual();
    var ol = $('items');
    ol.textContent = '';
    ts.forEach(function (t, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'item' + (i === actual ? ' actual' : '') + (cerrado(t) ? ' cerrado' : '');
      b.setAttribute('data-i', String(i));
      var n = document.createElement('span');
      n.className = 'n';
      n.textContent = dos(i + 1);
      var tt = document.createElement('span');
      tt.className = 't';
      tt.textContent = t.tema || '';
      var sm = document.createElement('small');
      sm.textContent = t.gancho || '';
      tt.appendChild(sm);
      var e = document.createElement('span');
      e.className = 'e';
      if (estado.hecho[t.id]) { e.className += ' ok'; e.textContent = 'Grabado'; }
      else if (estado.saltado[t.id]) { e.className += ' salto'; e.textContent = 'Saltado'; }
      else if (t.si_hay_tiempo) { e.className += ' salto'; e.textContent = 'Si hay tiempo'; }
      b.appendChild(n);
      b.appendChild(tt);
      b.appendChild(e);
      li.appendChild(b);
      ol.appendChild(li);
    });
    var s = saltados().length;
    texto($('resumen'), hechos() + ' de ' + ts.length + ' grabados' +
      (s ? ' · ' + s + (s === 1 ? ' saltado' : ' saltados') : '') +
      (datos && datos.actualizado ? ' · guiones del ' + fecha(datos.actualizado) : ''));
    texto($('contador'), (actual + 1) + ' / ' + ts.length);
  }

  function pintarFin() {
    var ts = lista();
    var s = saltados().length;
    texto($('fin-texto'), 'Grabaste ' + hechos() + ' de ' + ts.length + '.');
    var b = $('ir-saltados');
    b.hidden = s === 0;
    texto(b, s === 1 ? 'Ir al saltado' : 'Ir a los ' + s + ' saltados');
    texto($('contador'), hechos() + ' / ' + ts.length);
  }

  function irA(i) {
    var t = lista()[i];
    if (!t) return;
    estado.actual = t.id;
    guardar();
    mostrar('tema');
    pintarTema();
    arriba();
  }

  function avanzar() {
    var n = proximoAbierto(indiceActual());
    if (n < 0) {
      guardar();
      mostrar('fin');
      pintarFin();
      arriba();
      return;
    }
    irA(n);
  }

  function volver() {
    if (lista().every(cerrado)) { mostrar('fin'); pintarFin(); arriba(); }
    else irA(indiceActual());
  }

  // ── Botones ──────────────────────────────────────────────────────────────
  $('grabado').addEventListener('click', function () {
    var t = lista()[indiceActual()];
    if (!t) return;
    estado.hecho[t.id] = true;
    delete estado.saltado[t.id];
    vibrar();
    avanzar();
  });
  $('saltar').addEventListener('click', function () {
    var t = lista()[indiceActual()];
    if (!t) return;
    if (!estado.hecho[t.id]) estado.saltado[t.id] = true;
    avanzar();
  });
  $('anterior').addEventListener('click', function () {
    var i = indiceActual();
    if (i > 0) irA(i - 1);
  });

  $('contador').addEventListener('click', function () {
    if (vista === 'lista') { volver(); return; }
    mostrar('lista');
    pintarLista();
    arriba();
  });
  $('volver').addEventListener('click', volver);
  $('items').addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('button[data-i]') : null;
    if (b) irA(Number(b.getAttribute('data-i')));
  });
  $('ver-todos').addEventListener('click', function () { mostrar('lista'); pintarLista(); arriba(); });
  $('ir-saltados').addEventListener('click', function () {
    // Los saltados se reabren, así «Grabado» pasa de uno al otro.
    var primero = -1;
    lista().forEach(function (t, i) {
      if (estado.saltado[t.id] && !estado.hecho[t.id]) {
        delete estado.saltado[t.id];
        if (primero < 0) primero = i;
      }
    });
    if (primero >= 0) irA(primero);
  });

  var armado = null;
  $('reiniciar').addEventListener('click', function () {
    var b = $('reiniciar');
    if (!armado) {
      texto(b, '¿Seguro? Tocá de nuevo para borrar el progreso');
      armado = setTimeout(function () { armado = null; texto(b, 'Empezar de cero'); }, 4000);
      return;
    }
    clearTimeout(armado);
    armado = null;
    texto(b, 'Empezar de cero');
    estado = { actual: null, hecho: {}, saltado: {} };
    irA(0);
  });

  document.addEventListener('keydown', function (ev) {
    if (vista !== 'tema' || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (ev.key === 'Enter') {
      if (ev.target && ev.target.tagName === 'BUTTON') return;
      ev.preventDefault();
      $('grabado').click();
    } else if (ev.key === 'ArrowLeft') {
      $('anterior').click();
    } else if (ev.key === 'ArrowRight') {
      var i = indiceActual();
      if (i < lista().length - 1) irA(i + 1);
    }
  });

  // ── Que la pantalla no se apague mientras grabás ─────────────────────────
  var wake = null;
  function pantallaPrendida() {
    try {
      if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
      if (wake && !wake.released) return;
      navigator.wakeLock.request('screen').then(function (w) { wake = w; }).catch(function () { /* nada */ });
    } catch (e) { /* nada */ }
  }
  document.addEventListener('visibilitychange', pantallaPrendida);
  document.addEventListener('click', pantallaPrendida);

  // ── Carga ────────────────────────────────────────────────────────────────
  function cargar() {
    fetch('guiones.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) {
        if (!d || !Array.isArray(d.temas)) throw new Error('sin temas');
        d.temas = d.temas.filter(function (t) { return t && typeof t.id === 'string' && t.id; });
        if (!d.temas.length) throw new Error('sin temas');
        datos = d;
        if (indiceDe(estado.actual) < 0) {
          var n = proximoAbierto(-1);
          estado.actual = d.temas[n < 0 ? 0 : n].id;
        }
        guardar();
        if (lista().every(cerrado)) { mostrar('fin'); pintarFin(); }
        else { mostrar('tema'); pintarTema(); }
      })
      .catch(function () { mostrar('error'); });
  }
  $('reintentar').addEventListener('click', cargar);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* sin modo offline */ });
    });
  }

  leerEstado();
  leerModo();
  aplicarModo();
  cargar();
})();
