/* Salua demo — all state is simulated in the browser. No backend, no real crypto, no network calls. */
(function () {
  'use strict';

  var NAMES = {
    patient: 'Ana García',
    issuer: 'Dra. Paula Ríos',
    reader: 'Dr. Martín Sosa',
    blocked: 'Dr. Luis Vega'
  };

  var WALLETS = {
    patient: '7xK9mPqR2vBnH4sTdY8wLcEzF3jG6hNaUo5iD1eX',
    issuer: '4rTyU8iO1pQwE3rT5yU7iO9pAsDf2gHjK4lZ6xCv',
    reader: '9mNbV6cX3zKlJ1hGfD4sA7qW5eRt8yUi2oP0xMnB',
    blocked: '2wQsE4rT6yU9iO1pLkJ3hGfD5sA7zXc8vBnM0qWe'
  };

  var CLINICS = { north: 'Centro Diagnóstico Norte', sanjose: 'Clínica San José' };

  function rnd(n) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
    var out = '';
    for (var i = 0; i < n; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
  function hash64() { var h = ''; for (var i = 0; i < 4; i++) h += Math.random().toString(16).slice(2, 18); return h.slice(0, 64); }
  function sig() { return rnd(87); }
  function solscan(s) { return 'https://solscan.io/tx/' + s + '?cluster=devnet'; }
  function short(a) { return a.slice(0, 8) + '…' + a.slice(-6); }
  function fmtTime(ts) { return new Date(ts).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }); }
  function fmtDate(ts) { return new Date(ts).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  function fmtRemaining(ms) {
    if (ms <= 0) return 'vencido';
    var m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    if (m >= 60) { var h = Math.floor(m / 60); return h + ' h ' + (m % 60) + ' min'; }
    return m + ':' + String(s).padStart(2, '0') + ' min';
  }

  var now = Date.now();
  function mkRecord(id, title, kind, clinic, issuer, issuedAgo) {
    var h = hash64(), tx = sig();
    return {
      id: id, title: title, kind: kind, clinic: clinic, issuer: issuer,
      status: 'ACTIVE', hash: h, tx: tx,
      issuedAt: now - issuedAgo, accessSig: null, isNew: false
    };
  }

  var state = {
    role: 'patient',
    view: 'records',
    shortCode: 'A7K2M9',
    codeExpires: now + 120000,
    records: [
      mkRecord('r1', 'Hemograma completo', 'Laboratorio', 'north', 'issuer', 86400000 * 3),
      mkRecord('r2', 'Radiografía de tórax', 'Imagen', 'sanjose', 'issuer', 86400000 * 10),
      mkRecord('r3', 'Electrocardiograma', 'Estudio', 'north', 'issuer', 86400000 * 20)
    ],
    requests: [],
    log: [
      { who: 'Dra. Paula Ríos', what: 'Emitió "Hemograma completo"', when: now - 86400000 * 3, tx: null, event: 'RecordIssued' }
    ],
    notifications: [],
    chain: [
      { account: 'PatientProfile', sig: sig(), note: 'owner: ' + short(WALLETS.patient), event: 'ProfileRegistered' },
      { account: 'Record', sig: sig(), note: 'content_hash · issuer · ACTIVE', event: 'RecordIssued' }
    ],
    issuerStep: 0,
    chosenDoc: null,
    processing: null,
    viewer: { requestId: null, stage: 'idle', tampered: false },
    pendingToast: null
  };

  /* ---------- icons ---------- */
  var P = 'M12 2l7 3v6c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V5l7-3z';
  var ICONS = {
    shield: '<svg class="icon" viewBox="0 0 24 24"><path d="' + P + '"/><path d="M12 8v5M9.5 10.5h5"/></svg>',
    shieldCheck: '<svg class="icon" viewBox="0 0 24 24"><path d="' + P + '"/><path d="M9 12l2 2 4-4.5"/></svg>',
    check: '<svg class="icon" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>',
    x: '<svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    qr: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h4v4h-4z"/></svg>',
    file: '<svg class="icon" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    clock: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    key: '<svg class="icon" viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M11 12L21 2M15 8l3 3M18 5l2 2"/></svg>',
    home: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/></svg>',
    inbox: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 13l3-8h12l3 8v6H3v-6z"/><path d="M3 13h6l2 3h2l2-3h6"/></svg>',
    history: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/><path d="M12 7v5l3 3"/></svg>',
    bell: '<svg class="icon" viewBox="0 0 24 24"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>',
    scan: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3M4 12h16"/></svg>',
    lock: '<svg class="icon" viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    eye: '<svg class="icon" viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    alert: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18.5v.5"/></svg>',
    building: '<svg class="icon" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-4h4v4"/></svg>',
    external: '<svg class="icon" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4L10 14M9 4H4v16h16v-5"/></svg>',
    plus: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    send: '<svg class="icon" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    user: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>'
  };
  function icon(n) { return ICONS[n] || ''; }

  function logoSvg() {
    return '<svg viewBox="0 0 40 46" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0FB3AA"/><stop offset="1" stop-color="#0B91F2"/></linearGradient></defs><path d="M20 1l17 7v13c0 11-7 20.4-17 24C10 41.4 3 32 3 21V8l17-7z" fill="url(#lg)"/><text x="20" y="27" text-anchor="middle" font-family="Poppins,Arial" font-size="15" font-weight="700" fill="#fff">S</text><path d="M20 30v8M16 34h8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>';
  }

  /* ---------- helpers ---------- */
  var app = document.getElementById('app');
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function record(id) { return state.records.find(function (r) { return r.id === id; }); }
  function requestFor(id) { return state.requests.find(function (r) { return r.id === id; }); }
  function grantForDoctor(doctor, recordId) {
    return state.requests.find(function (r) { return r.doctor === doctor && r.recordId === recordId && r.status === 'granted'; });
  }
  function activeGrant(doctor, recordId) {
    var g = grantForDoctor(doctor, recordId);
    return g && g.expiresAt > Date.now() ? g : null;
  }
  function statusLabel(s) { return { ACTIVE: 'Activo', DISPUTED: 'En disputa', VOIDED: 'Anulado' }[s] || s; }
  function statusClass(s) { return { ACTIVE: 'active', DISPUTED: 'disputed', VOIDED: 'voided' }[s] || ''; }
  function initials(n) { return n.replace(/^Dra?\.?\s*/, '').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join(''); }
  function rolePerson() {
    return { patient: NAMES.patient, issuer: NAMES.issuer, reader: NAMES.reader, blocked: NAMES.blocked }[state.role];
  }
  function toast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('visible'); }, 3200);
  }
  function pushLog(who, what, tx, event) { state.log.unshift({ who: who, what: what, when: Date.now(), tx: tx, event: event }); }
  function pushChain(account, sigv, note, event) { state.chain.unshift({ account: account, sig: sigv, note: note, event: event }); }
  function notify(msg) { state.notifications.unshift({ msg: msg, when: Date.now() }); }

  /* ---------- QR (decorative deterministic pattern) ---------- */
  function qrSvg(seed) {
    var cells = [], n = 21, v = 0;
    function bit(i) { v = (v * 31 + seed.charCodeAt(i % seed.length) + i) % 2147483647; return v % 2; }
    function finder(x, y) { return (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7); }
    var rects = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      if (finder(x, y)) continue;
      if (bit(x * n + y)) rects += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
    }
    function frame(cx, cy) {
      return '<rect x="' + cx + '" y="' + cy + '" width="7" height="7" fill="none" stroke="#0D2950" stroke-width="1"/>' +
        '<rect x="' + (cx + 2) + '" y="' + (cy + 2) + '" width="3" height="3"/>';
    }
    return '<svg viewBox="-1 -1 23 23" fill="#0D2950">' + rects + frame(0, 0) + frame(14, 0) + frame(0, 14) + '</svg>';
  }

  /* ---------- guide ---------- */
  function guideStep() {
    var sosaReq = state.requests.find(function (r) { return r.doctor === 'reader'; });
    var vegaReq = state.requests.find(function (r) { return r.doctor === 'blocked'; });
    var sosaGrant = grantForDoctor('reader', sosaReq ? sosaReq.recordId : null);
    var steps = [
      { t: '1 · La Dra. Ríos escanea el QR de Ana', d: 'Cambiá a "Dra. Ríos" y tocá "Simular escaneo". Se cifra el estudio, se calcula el hash y se firma issue_record.', role: 'issuer', view: 'issue', done: state.records.some(function (r) { return r.isNew; }) },
      { t: '2 · Ana revisa el estudio nuevo', d: 'En "Mis estudios" aparece con la notificación. Podés tocar "No es mío" en cualquier estudio para ver el estado DISPUTED.', role: 'patient', view: 'records', done: state.records.some(function (r) { return r.isNew; }) },
      { t: '3 · El Dr. Sosa pide acceso', d: 'Cambiá a "Dr. Sosa", ingresá el código de Ana y pedí acceso al estudio.', role: 'reader', view: 'request', done: !!sosaReq },
      { t: '4 · Ana firma el permiso', d: 'Volvé a Ana → Solicitudes, elegí 1 hora y firmá grant_access.', role: 'patient', view: 'requests', done: !!(sosaReq && sosaReq.status !== 'pending') },
      { t: '5 · El Dr. Sosa abre el visor', d: 'El servicio de llaves verifica el permiso on-chain, entrega la llave y registra el acceso. Probá "simular archivo alterado".', role: 'reader', view: 'viewer', done: state.viewer.stage === 'document' },
      { t: '6 · El Dr. Vega queda afuera', d: 'Pedí acceso con el Dr. Vega, negalo desde Ana y mirá qué pasa.', role: 'blocked', view: 'request', done: !!(vegaReq && vegaReq.status === 'denied') },
      { t: '7 · Vencimiento del permiso', d: 'Tocá "Simular paso del tiempo" en el visor del Dr. Sosa y reintentá pedir la llave.', role: 'reader', view: 'viewer', done: state.viewer.stage === 'deniedExpired' },
      { t: '8 · Línea de tiempo de Ana', d: 'Todos los accesos quedan registrados con su transacción en Solana devnet.', role: 'patient', view: 'timeline', done: false }
    ];
    return steps;
  }
  function currentGuide() {
    var steps = guideStep();
    for (var i = 0; i < steps.length; i++) if (!steps[i].done) return { step: steps[i], index: i, total: steps.length, steps: steps };
    return { step: steps[steps.length - 1], index: steps.length - 1, total: steps.length, steps: steps };
  }

  /* ---------- layout ---------- */
  var NAV = {
    patient: [
      { v: 'records', l: 'Mis estudios', i: 'home' },
      { v: 'qr', l: 'Mi QR', i: 'qr' },
      { v: 'requests', l: 'Solicitudes', i: 'inbox', count: function () { return state.requests.filter(function (r) { return r.status === 'pending'; }).length; } },
      { v: 'timeline', l: 'Línea de tiempo', i: 'history' }
    ],
    issuer: [{ v: 'issue', l: 'Nuevo estudio', i: 'scan' }],
    reader: [
      { v: 'request', l: 'Pedir acceso', i: 'send' },
      { v: 'viewer', l: 'Visor', i: 'eye' }
    ],
    blocked: [{ v: 'request', l: 'Pedir acceso', i: 'send' }]
  };
  var ROLE_LABEL = { patient: 'Ana · Paciente', issuer: 'Dra. Ríos · Emisora', reader: 'Dr. Sosa · Lector', blocked: 'Dr. Vega · Lector' };

  function renderShell(content) {
    var nav = NAV[state.role];
    var pendingCount = nav.find(function (n) { return n.count; });
    app.innerHTML =
      '<div class="shell">' +
      '<aside class="sidebar">' +
      '<div class="brand">' + logoSvg() + '<span>Salua</span></div>' +
      '<div class="brand-tag">Tu historia clínica, bajo tu control</div>' +
      '<div class="workspace-label eyebrow">' + esc(ROLE_LABEL[state.role]) + '</div>' +
      '<nav class="nav">' + nav.map(function (n) {
        var c = n.count ? n.count() : 0;
        return '<button data-nav="' + n.v + '" class="' + (state.view === n.v ? 'active' : '') + '">' + icon(n.i) + '<span>' + n.l + '</span>' + (c ? '<span class="count">' + c + '</span>' : '') + '</button>';
      }).join('') + '</nav>' +
      '<div class="sidebar-bottom"><div class="privacy-note">' + icon('lock') + '<strong style="font-size:11px">Datos cifrados de extremo a extremo</strong><p>El documento se cifra en tu navegador (AES-256-GCM). En Solana solo quedan permisos, hashes y auditoría.</p></div>' +
      '<div class="sidebar-foot"><span>Demo interactivo</span><span>devnet · simulado</span></div></div>' +
      '</aside>' +
      '<main id="main" style="min-width:0">' +
      '<header class="topbar">' +
      '<div class="row">' +
      '<div class="brand mobile-brand">' + logoSvg() + '<span>Salua</span></div>' +
      '<span class="topbar-title">Panel de <strong>' + esc(rolePerson()) + '</strong></span>' +
      '</div>' +
      '<div class="row">' +
      '<span class="demo-badge"><i class="dot"></i>Solana devnet · simulado</span>' +
      '<button class="icon-btn" id="bell" aria-label="Notificaciones">' + icon('bell') + (state.notifications.length ? '<span class="notification-dot"></span>' : '') + '</button>' +
      '<div class="identity"><div class="avatar' + (state.role === 'patient' ? '' : ' doctor') + '">' + initials(rolePerson()) + '</div><div><strong>' + esc(rolePerson()) + '</strong><small>' + esc({ patient: 'Paciente', issuer: 'MP 12345 · Cardiología', reader: 'MP 67890 · Clínica San José', blocked: 'MP 11223 · Sin verificar en esta clínica' }[state.role]) + '</small></div></div>' +
      '</div></header>' +
      '<div class="content">' +
      '<div class="role-bar"><span class="role-label">Ver como:</span><div class="role-switch">' +
      Object.keys(ROLE_LABEL).map(function (r) {
        return '<button data-role="' + r + '" class="' + (state.role === r ? 'selected' : '') + '">' + ROLE_LABEL[r].split(' · ')[0] + '</button>';
      }).join('') +
      '</div></div>' +
      '<div class="layout"><div class="main-column">' + content + '<div class="footer"><span>Salua — prototipo navegable. Todos los datos y transacciones son ficticios.</span><span>Sin backend · nada sale del navegador</span></div></div>' +
      renderRail() +
      '</div></div></main></div>';

    app.querySelectorAll('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () { state.view = b.getAttribute('data-nav'); render(); });
    });
    app.querySelectorAll('[data-role]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.role = b.getAttribute('data-role');
        state.view = NAV[state.role][0].v;
        render();
      });
    });
    var bell = document.getElementById('bell');
    if (bell) bell.addEventListener('click', function () {
      var list = state.notifications.length ? state.notifications.map(function (n) { return '<li style="padding:8px 0;border-bottom:1px solid var(--line);font-size:11px">' + esc(n.msg) + ' <span class="muted">· ' + fmtTime(n.when) + '</span></li>'; }).join('') : '<li style="font-size:11px" class="muted">Sin notificaciones.</li>';
      openModal('Notificaciones', '<ul style="list-style:none;padding:0;margin:0">' + list + '</ul>');
      state.notifications = [];
    });
    bindRail();
    bindContent();
  }

  function renderRail() {
    var g = currentGuide();
    var recent = state.chain.slice(0, 4);
    return '<aside class="rail">' +
      '<div class="guide"><span class="eyebrow">Guion del demo</span>' +
      '<h3>' + esc(g.step.t) + '</h3><p>' + esc(g.step.d) + '</p>' +
      '<button class="button teal" data-goto="' + g.step.role + '|' + g.step.view + '">' + icon('send') + 'Ir al paso ' + (g.index + 1) + ' / ' + g.total + '</button>' +
      '<div class="guide-track">' + g.steps.map(function (s) { return '<i class="' + (s.done ? 'done' : '') + '"></i>'; }).join('') + '</div>' +
      '<button class="reset" id="resetDemo">Reiniciar demo</button></div>' +
      '<div class="chain-card"><div class="chain-head"><h2><span class="solana"><i></i><i></i><i></i></span>Qué queda en Solana</h2><p>Simulación de escrituras on-chain. Nada médico toca la cadena.</p><span class="network"><i class="dot"></i>devnet · simulado</span></div>' +
      '<div class="chain-body"><div class="chain-subtitle">Cuentas y eventos recientes</div>' +
      recent.map(function (c) {
        return '<div class="chain-row"><span class="row" style="gap:7px">' + icon('lock') + '<b>' + c.account + ' PDA</b></span><a class="mono" href="' + solscan(c.sig) + '" target="_blank" rel="noopener">' + short(c.sig) + '</a></div>' +
          '<div class="hash-box"><strong>' + esc(c.note) + '</strong>firma: ' + c.sig.slice(0, 20) + '…<br><span class="event-pill">' + c.event + '</span></div>';
      }).join('') +
      '<p class="chain-caption">PDAs: <b>PatientProfile</b>, <b>Record</b> (content_hash, emisor, estado) y <b>AccessGrant</b> (lector, vencimiento). Eventos: RecordIssued, AccessGranted, AccessLogged.</p></div>' +
      '<div class="chain-outside"><h3>' + icon('eye') + 'Lo que NO está en la cadena</h3>' +
      '<div class="excluded"><span>El documento</span><span>Nombres</span><span>Diagnósticos</span><span>DNI</span></div>' +
      '<p>El archivo va cifrado a almacenamiento off-chain (borrable). La cadena solo prueba quién emitió, quién accedió y que el hash no cambió.</p></div></div>' +
      '</aside>';
  }

  function bindRail() {
    var g = app.querySelector('[data-goto]');
    if (g) g.addEventListener('click', function () {
      var p = g.getAttribute('data-goto').split('|');
      state.role = p[0]; state.view = p[1]; render();
      toast('Cambiaste a: ' + ROLE_LABEL[state.role]);
    });
    var r = document.getElementById('resetDemo');
    if (r) r.addEventListener('click', function () { location.reload(); });
  }

  function openModal(title, html, actions) {
    var d = document.getElementById('modal');
    d.innerHTML = '<h2 id="modal-title">' + esc(title) + '</h2>' + html + '<div class="row">' + (actions || '<button class="button secondary" data-close>Cerrar</button>') + '</div>';
    if (!d.open) d.showModal();
    d.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { d.close(); }); });
    return d;
  }

  /* ================= PATIENT ================= */
  function patientRecordsView() {
    var newCount = state.records.filter(function (r) { return r.isNew; }).length;
    var list = state.records.map(function (r) {
      var ic = r.kind === 'Laboratorio' ? 'file' : r.kind === 'Imagen' ? 'file' : 'file';
      var cls = r.kind === 'Laboratorio' ? '' : r.kind === 'Imagen' ? 'teal' : 'purple';
      return '<div class="record"><div class="record-icon ' + cls + '">' + icon(ic) + '</div>' +
        '<div class="record-info"><h3>' + esc(r.title) + (r.isNew ? '<span class="new-tag">· nuevo</span>' : '') + '</h3>' +
        '<p>' + esc(r.kind) + ' · ' + fmtDate(r.issuedAt) + ' · ' + NAMES[r.issuer] + '</p>' +
        '<span class="origin">' + icon('building') + esc(CLINICS[r.clinic]) + '</span></div>' +
        '<div class="record-actions"><span class="status ' + statusClass(r.status) + '">' + statusLabel(r.status) + '</span>' +
        (r.status === 'ACTIVE' ? '<button class="text-button" data-dispute="' + r.id + '">No es mío</button>' : '') +
        '</div></div>';
    }).join('');
    var pending = state.requests.filter(function (r) { return r.status === 'pending'; });
    return '<div class="heading"><div><h1>Mis estudios</h1><p>Sos la dueña de tu historia. Cada carga queda firmada por el médico.</p></div>' +
      '<button class="button teal" data-navto="qr">' + icon('qr') + 'Mi QR</button></div>' +
      (pending.length ? '<div class="request-banner">' + icon('inbox') + '<p><b>' + pending.length + ' solicitud(es) de acceso</b> esperando tu firma.</p><button class="button" data-navto="requests">Revisar</button></div>' : '') +
      '<div class="hero"><div><span class="eyebrow">Tu historia, tus reglas</span><h2>Ningún médico lee tus estudios sin tu firma.</h2><p>El acceso vence solo y cada lectura queda registrada en Solana.</p></div>' +
      '<div class="shield-orbit">' + icon('shield') + '<span class="shield-check">' + icon('check') + '</span></div></div>' +
      '<div class="stats"><div class="stat"><span class="stat-icon">' + icon('file') + '</span><div><strong>' + state.records.length + '</strong><small>estudios emitidos</small></div></div>' +
      '<div class="stat"><span class="stat-icon">' + icon('shieldCheck') + '</span><div><strong>' + state.records.filter(function (r) { return r.status === 'ACTIVE'; }).length + '</strong><small>activos y verificables</small></div></div>' +
      '<div class="stat"><span class="stat-icon">' + icon('history') + '</span><div><strong>' + state.log.length + '</strong><small>eventos auditados</small></div></div></div>' +
      '<div class="section-head"><div><h2>Estudios</h2><p>' + (newCount ? newCount + ' nuevo(s) recibido(s)' : 'Ordenados por fecha de emisión') + '</p></div></div>' +
      '<div class="filter-bar"><button class="filter active">Todos</button><button class="filter">Activos</button><button class="filter">En disputa</button></div>' +
      list +
      '<p class="security-strip">' + icon('lock') + 'Cifrados con AES-256-GCM en tu navegador · la cadena solo guarda el hash</p>';
  }

  function patientQrView() {
    var left = Math.max(0, state.codeExpires - Date.now());
    return '<div class="heading"><div><h1>Mi QR</h1><p>Mostrá este código al médico presente. Vence y se regenera solo.</p></div></div>' +
      '<div class="qr-grid">' +
      '<div class="card qr-card"><h3>Código de acceso temporal</h3>' +
      '<div class="qr-code">' + qrSvg(state.shortCode + WALLETS.patient) + '</div>' +
      '<div class="short-code">' + state.shortCode + '</div>' +
      '<span class="timer-pill">' + icon('clock') + 'Se renueva en ' + fmtRemaining(left) + '</span>' +
      '<div class="wallet"><small class="eyebrow">Tu wallet pública</small><span class="mono">' + WALLETS.patient + '</span></div></div>' +
      '<div class="card"><h3>Cómo funciona</h3><ul class="info-list">' +
      '<li><span class="step-number">1</span><div><h3>El médico escanea</h3><p>Un médico verificado (matrícula registrada) escanea el código para identificar tu historia.</p></div></li>' +
      '<li><span class="step-number">2</span><div><h3>Puede cargar o pedir acceso</h3><p>Puede emitirte un estudio nuevo o pedirte permiso para leer uno existente.</p></div></li>' +
      '<li><span class="step-number">3</span><div><h3>Vos decidís</h3><p>Aprobás por 1 h, 24 h o 7 días firmando grant_access con tu wallet. Después vence solo.</p></div></li></ul>' +
      '<div class="notice">' + icon('shield') + '<span>El código no contiene datos médicos: solo sirve para encontrar tu PatientProfile en Solana.</span></div></div>' +
      '</div>';
  }

  function patientRequestsView() {
    var pending = state.requests.filter(function (r) { return r.status === 'pending'; });
    var answered = state.requests.filter(function (r) { return r.status !== 'pending'; });
    var pendingHtml = pending.map(function (req) {
      var r = record(req.recordId);
      var who = req.doctor === 'reader' ? { n: NAMES.reader, mp: 'MP 67890', org: CLINICS.sanjose } : { n: NAMES.blocked, mp: 'MP 11223', org: 'Consultorio privado' };
      return '<div class="request-card" style="margin-bottom:16px">' +
        '<div class="row between"><div class="identity"><div class="avatar doctor">' + initials(who.n) + '</div><div><strong>' + esc(who.n) + '</strong><span class="verified">' + icon('shieldCheck') + 'matrícula verificada · ' + who.mp + '</span><small>' + esc(who.org) + '</small></div></div></div>' +
        '<div class="record-reference">Solicita acceso a: <b>' + esc(r ? r.title : '') + '</b></div>' +
        '<small class="eyebrow">Duración del permiso</small>' +
        '<div class="durations">' +
        '<button class="duration selected" data-dur="3600000" data-req="' + req.id + '">1 hora</button>' +
        '<button class="duration" data-dur="86400000" data-req="' + req.id + '">24 horas</button>' +
        '<button class="duration" data-dur="604800000" data-req="' + req.id + '">7 días</button></div>' +
        '<div class="row"><button class="button teal" data-grant="' + req.id + '" style="flex:1">' + icon('shieldCheck') + 'Firmar grant_access</button>' +
        '<button class="button danger" data-deny="' + req.id + '" style="flex:1">' + icon('x') + 'Denegar</button></div></div>';
    }).join('');
    var answeredHtml = answered.map(function (req) {
      var r = record(req.recordId);
      var who = req.doctor === 'reader' ? NAMES.reader : NAMES.blocked;
      return '<div class="record"><div class="record-icon ' + (req.status === 'granted' ? 'teal' : 'purple') + '">' + icon(req.status === 'granted' ? 'check' : 'x') + '</div>' +
        '<div class="record-info"><h3>' + esc(who) + ' — ' + esc(r ? r.title : '') + '</h3>' +
        '<p>' + (req.status === 'granted' ? 'Permiso firmado · vence ' + fmtTime(req.expiresAt) : 'Acceso denegado por vos') + '</p></div>' +
        '<div class="record-actions"><span class="status ' + (req.status === 'granted' ? 'active' : 'denied') + '">' + (req.status === 'granted' ? 'Otorgado' : 'Denegado') + '</span></div></div>';
    }).join('');
    return '<div class="heading"><div><h1>Solicitudes de acceso</h1><p>Solo vos podés firmar un permiso. Nada se comparte por defecto.</p></div></div>' +
      (pendingHtml || '<div class="empty">' + icon('inbox') + '<h3>Sin solicitudes pendientes</h3><p>Cuando un médico pida acceso con tu código, aparece acá con su matrícula verificada.</p></div>') +
      (answeredHtml ? '<div class="section-head" style="margin-top:24px"><h2>Resueltas</h2></div>' + answeredHtml : '');
  }

  function patientTimelineView() {
    var items = state.log.map(function (e) {
      return '<div class="timeline-item"><div class="timeline-icon">' + icon(e.event === 'AccessLogged' ? 'eye' : e.event === 'AccessGranted' ? 'shieldCheck' : e.event === 'AccessDenied' ? 'x' : 'file') + '</div>' +
        '<div class="timeline-content"><h3>' + esc(e.who) + '</h3><p>' + esc(e.what) + '</p><time>' + fmtDate(e.when) + ' · ' + fmtTime(e.when) + '</time>' +
        (e.tx ? '<a class="text-button row" style="gap:4px;display:inline-flex" href="' + solscan(e.tx) + '" target="_blank" rel="noopener">Ver transacción en solscan (devnet) ' + icon('external') + '</a>' : '') +
        '</div></div>';
    }).join('');
    return '<div class="heading"><div><h1>Línea de tiempo</h1><p>Cada emisión, permiso y lectura queda registrado en Solana. Esto es tu evidencia.</p></div></div>' +
      '<div class="card"><div class="timeline">' + (items || '<p class="muted" style="font-size:11px">Todavía no hay eventos.</p>') + '</div></div>' +
      '<p class="security-strip">' + icon('lock') + 'Los eventos guardan quién, cuándo y la firma — nunca el contenido del estudio</p>';
  }

  /* ================= ISSUER ================= */
  var SAMPLE_DOCS = [
    { id: 'doc1', title: 'Informe de ecocardiograma', kind: 'Informe PDF', detail: 'Ecocardiograma Doppler · 2 páginas · 1,4 MB' },
    { id: 'doc2', title: 'Laboratorio — perfil lipídico', kind: 'Resultados PDF', detail: 'Análisis bioquímico · 1 página · 380 KB' }
  ];

  function issuerView() {
    var s = state.issuerStep, html = '';
    html += '<div class="heading"><div><h1>Cargar estudio</h1><p>Solo médicos con matrícula verificada pueden emitir. Cada carga queda firmada con tu wallet.</p></div></div>';

    if (s === 0) {
      html += '<div class="card"><div class="scan-box">' + icon('scan') + '<h3>Escanear el QR del paciente</h3><p>El código identifica el PatientProfile en Solana. No expone datos médicos.</p>' +
        '<button class="button teal" id="scanBtn">' + icon('qr') + 'Simular escaneo del QR de Ana</button></div></div>';
    } else if (s === 1) {
      html += '<div class="card"><h3>Paciente identificado</h3>' +
        '<div class="patient-match" style="margin:15px 0"><div class="avatar">AG</div><div><strong style="font-size:12px">Ana García</strong><p>PatientProfile encontrado · wallet ' + short(WALLETS.patient) + '</p></div><span class="verified" style="margin-left:auto">' + icon('shieldCheck') + 'válido por ' + fmtRemaining(state.codeExpires - Date.now()) + '</span></div>' +
        '<h3 style="margin-top:20px">Seleccionar documento</h3>' +
        SAMPLE_DOCS.map(function (d) {
          return '<button class="sample-choice' + (state.chosenDoc === d.id ? ' chosen' : '') + '" data-doc="' + d.id + '">' + icon('file') + '<span><strong>' + esc(d.title) + '</strong><small>' + esc(d.detail) + '</small></span><span class="muted" style="margin-left:auto;font-size:10px">' + (state.chosenDoc === d.id ? 'Seleccionado' : 'Elegir') + '</span></button>';
        }).join('') +
        '<button class="button teal full" id="startIssue" ' + (state.chosenDoc ? '' : 'disabled') + '>' + icon('lock') + 'Cifrar y emitir estudio</button></div>';
    } else if (s === 2 || s === 3) {
      var st = state.processing || { step: 0 };
      var docTitle = SAMPLE_DOCS.find(function (d) { return d.id === state.chosenDoc; }).title;
      html += '<div class="card"><h3>' + esc(docTitle) + '</h3><p class="muted" style="font-size:10px;margin-top:5px">Para Ana García · ' + CLINICS.north + '</p>' +
        '<div class="processing">' +
        procStep(0, st.step, 'Cifrando con AES-256-GCM en el navegador', 'DEK nueva por estudio · el archivo plano nunca sale') +
        procStep(1, st.step, 'Calculando content_hash (SHA-256)', st.hash ? 'hash: ' + st.hash.slice(0, 32) + '…' : 'hash del archivo cifrado') +
        procStep(2, st.step, 'Firmando issue_record en Solana', 'Record PDA · hash, emisor y estado on-chain') +
        procStep(3, st.step, 'Confirmado', 'Estudio activo y verificable para el paciente') +
        '</div>' +
        (s === 3 ? '<div class="notice success" style="margin-top:16px">' + icon('check') + '<span><b>Estudio emitido.</b> Ana recibió una notificación y puede disputarlo si no es suyo.</span></div>' +
          '<button class="button full" style="margin-top:14px" id="issueDone">Emitir otro estudio</button>' : '') +
        '</div>';
    }
    return html;
  }
  function procStep(i, cur, title, sub) {
    var cls = i < cur ? 'complete' : i === cur ? 'current' : '';
    var ic = i < cur ? icon('check') : i === cur ? '<span class="spinner"></span>' : '<span style="width:15px;height:15px;border-radius:50%;border:2px solid var(--line);display:inline-block;flex-shrink:0"></span>';
    return '<div class="processing-step ' + cls + '">' + ic + '<span><b style="font-weight:500">' + esc(title) + '</b><br><small>' + esc(sub) + '</small></span></div>';
  }

  function runIssuing() {
    state.issuerStep = 2;
    state.processing = { step: 0, hash: hash64() };
    var delays = [1100, 1400, 1600, 900];
    var i = 0;
    function tick() {
      render();
      if (i < delays.length) {
        setTimeout(function () { state.processing.step = ++i; tick(); }, delays[i]);
      } else {
        finishIssue();
      }
    }
    tick();
  }
  function finishIssue() {
    var doc = SAMPLE_DOCS.find(function (d) { return d.id === state.chosenDoc; });
    var tx = sig();
    var r = {
      id: 'r' + Date.now(), title: doc.title, kind: doc.kind.includes('Informe') ? 'Informe' : 'Laboratorio',
      clinic: 'north', issuer: 'issuer', status: 'ACTIVE',
      hash: state.processing.hash, tx: tx, issuedAt: Date.now(), isNew: true
    };
    state.records.unshift(r);
    pushLog(NAMES.issuer, 'Emitió "' + r.title + '" con firma de MP 12345', tx, 'RecordIssued');
    pushChain('Record', tx, 'content_hash ' + r.hash.slice(0, 16) + '… · issuer ' + short(WALLETS.issuer), 'RecordIssued');
    notify('Estudio nuevo: "' + r.title + '" emitido por la Dra. Paula Ríos (Centro Diagnóstico Norte).');
    state.issuerStep = 3;
    render();
  }

  /* ================= READER / BLOCKED ================= */
  function codeInputView(doctor) {
    var mp = doctor === 'reader' ? 'MP 67890 · ' + CLINICS.sanjose : 'MP 11223 · consultorio particular';
    var myReqs = state.requests.filter(function (r) { return r.doctor === doctor; });
    var list = myReqs.map(function (req) {
      var r = record(req.recordId);
      var st = req.status;
      var statusEl = st === 'granted'
        ? (req.expiresAt > Date.now()
          ? '<span class="status active">Permiso vigente · ' + fmtRemaining(req.expiresAt - Date.now()) + '</span>'
          : '<span class="status expired">Vencido</span>')
        : st === 'denied' ? '<span class="status denied">Denegado</span>' : '<span class="status disputed">Esperando a Ana</span>';
      return '<div class="record"><div class="record-icon">' + icon('file') + '</div>' +
        '<div class="record-info"><h3>' + esc(r ? r.title : '') + '</h3><p>' + esc(CLINICS[r.clinic]) + ' · emitido por ' + NAMES[r.issuer] + '</p></div>' +
        '<div class="record-actions">' + statusEl +
        (st === 'granted' && doctor === 'reader' ? '<button class="text-button" data-navto="viewer">Abrir visor</button>' : '') +
        (st === 'denied' ? '<span style="font-size:9px;color:#b9475c">Acceso denegado: el servicio de llaves niega por defecto</span>' : '') +
        '</div></div>';
    }).join('');
    return '<div class="heading"><div><h1>Pedir acceso</h1><p>Ingresá el código temporal del paciente. ' + mp + '.</p></div></div>' +
      '<div class="card" style="margin-bottom:20px"><label class="form-label" style="margin-top:0">Código del paciente</label>' +
      '<div class="row"><input id="codeInput" value="' + state.shortCode + '" maxlength="6" style="letter-spacing:5px;font-weight:600" aria-label="Código del paciente">' +
      '<button class="button secondary" id="pasteCode" style="white-space:nowrap">Usar código de Ana</button></div>' +
      '<p class="muted" style="font-size:10px;margin-top:10px">El código identifica a la paciente frente a vos. Vence cada 2 minutos.</p>' +
      '<button class="button teal full" style="margin-top:16px" id="findPatient">' + icon('qr') + 'Buscar paciente</button></div>' +
      (state.foundPatient ? patientStudiesList(doctor) : '') +
      (myReqs.length ? '<div class="section-head"><h2>Mis solicitudes</h2></div>' + list : '');
  }
  function patientStudiesList(doctor) {
    var actives = state.records.filter(function (r) { return r.status === 'ACTIVE'; });
    return '<div class="card"><div class="patient-match"><div class="avatar">AG</div><div><strong style="font-size:12px">Ana García</strong><p>Historia encontrada · ' + state.records.length + ' estudios</p></div></div>' +
      '<h3 style="margin:18px 0 10px">Solicitar acceso a un estudio</h3>' +
      actives.map(function (r) {
        var already = state.requests.find(function (q) { return q.doctor === doctor && q.recordId === r.id; });
        return '<div class="record"><div class="record-icon">' + icon('file') + '</div>' +
          '<div class="record-info"><h3>' + esc(r.title) + '</h3><p>' + esc(CLINICS[r.clinic]) + '</p></div>' +
          '<div class="record-actions">' +
          (already
            ? '<span class="status ' + (already.status === 'granted' ? 'active' : already.status === 'denied' ? 'denied' : 'disputed') + '">' + (already.status === 'granted' ? 'Otorgado' : already.status === 'denied' ? 'Denegado' : 'Pendiente') + '</span>'
            : '<button class="button secondary" data-request="' + r.id + '" data-doctor="' + doctor + '" style="font-size:10px;padding:8px 12px">' + icon('send') + 'Pedir acceso</button>') +
          '</div></div>';
      }).join('') + '</div>';
  }

  function viewerView() {
    var req = state.requests.find(function (r) { return r.doctor === 'reader' && r.status === 'granted'; });
    var v = state.viewer;
    var head = '<div class="heading"><div><h1>Visor protegido</h1><p>El documento solo se descifra si el permiso está vigente y el hash coincide.</p></div></div>';
    if (!req) {
      return head + '<div class="empty">' + icon('eye') + '<h3>Sin permiso activo</h3><p>Pedí acceso a un estudio de Ana. Cuando ella firme grant_access, podés abrirlo acá.</p>' +
        '<button class="button teal" data-navto="request">Pedir acceso</button></div>';
    }
    var r = record(req.recordId);
    var remaining = req.expiresAt - Date.now();
    var expired = remaining <= 0;

    var body = '<div class="viewer-top"><div><h2>' + esc(r.title) + '</h2><span class="origin" style="display:inline-flex;align-items:center;gap:5px;font-size:10px;color:var(--muted)">' + icon('building') + 'Emitido por ' + CLINICS[r.clinic] + '</span></div>' +
      (expired ? '<span class="status expired">Permiso vencido</span>' : '<span class="timer-pill">' + icon('clock') + 'Quedan ' + fmtRemaining(remaining) + '</span>') + '</div>';

    if (v.stage === 'idle') {
      body += '<div class="card" style="text-align:center;padding:40px 20px"><div class="scan-box" style="border-style:solid">' + icon('key') +
        '<h3>Pedir la llave de descifrado</h3><p>El servicio de llaves verifica tu AccessGrant en Solana antes de entregar la DEK.</p>' +
        '<button class="button teal" id="requestKey">' + icon('key') + 'Solicitar llave</button></div>' +
        (expired ? '<div class="notice error" style="margin-top:14px;text-align:left">' + icon('alert') + '<span>El permiso venció. El servicio de llaves no entrega más la DEK. Ana puede firmar un permiso nuevo.</span></div>' : '') +
        demoTools(v, req) + '</div>';
    } else if (v.stage === 'processing') {
      body += '<div class="card"><div class="processing">' +
        procStep(0, v.step, 'Servicio de llaves: verificando AccessGrant en Solana', 'AccessGrant PDA · lector ' + NAMES.reader + ' · Record ' + r.title) +
        procStep(1, v.step, 'Registrando log_access', 'AccessLogged · firma key_service · reloj de la red') +
        procStep(2, v.step, 'Llave entregada — verificando integridad', 'recalculando SHA-256 del archivo cifrado') +
        '</div></div>';
    } else if (v.stage === 'deniedExpired') {
      body += '<div class="card"><div class="integrity-block">' + icon('alert') + '<h2>PERMISO VENCIDO</h2>' +
        '<p>El servicio de llaves verificó la cadena y tu AccessGrant ya venció.<br><b>Llave no entregada.</b> Solo Ana puede firmar un nuevo acceso.</p></div></div>';
    } else if (v.stage === 'document') {
      if (v.tampered) {
        body += '<div class="card"><div class="integrity-block">' + icon('alert') + '<h2>ESTUDIO ALTERADO</h2>' +
          '<p>El SHA-256 del archivo no coincide con el content_hash on-chain.<br><b>No se descifró el documento.</b></p></div>' +
          '<div class="hash-box"><strong>on-chain content_hash</strong>' + r.hash + '<br><strong>hash calculado</strong>' + hash64() + '</div>' + demoTools(v, req) + '</div>';
      } else {
        body += documentHtml(r, req) + demoTools(v, req);
      }
    }
    return head + body;
  }

  function demoTools(v, req) {
    return '<details class="demo-tools"><summary>Herramientas del demo</summary><div class="row">' +
      (v.stage === 'document' ? '<label class="check-label"><input type="checkbox" id="tamperToggle" ' + (v.tampered ? 'checked' : '') + '> simular archivo alterado</label>' : '') +
      '<button class="text-button" id="skipTime">' + icon('clock') + ' Simular paso del tiempo (vencer permiso)</button>' +
      '</div></details>';
  }

  function documentHtml(r, req) {
    var wm = [];
    for (var i = 0; i < 6; i++) wm.push('<span>' + NAMES.reader + ' · MP 67890 · ' + fmtDate(Date.now()) + '</span>');
    var date = fmtDate(r.issuedAt);
    return '<div class="card">' +
      '<div class="document"><div style="padding:26px 26px 40px;font-size:11px;line-height:1.9;position:relative;z-index:1;background:#fff">' +
      '<div class="row between" style="border-bottom:2px solid var(--navy);padding-bottom:12px;margin-bottom:16px"><div><b style="color:var(--navy);font-size:14px">' + esc(r.title.toUpperCase()) + '</b><br><small class="muted">' + CLINICS[r.clinic] + ' · ' + date + '</small></div><div style="text-align:right"><small class="muted">Paciente</small><br><b>Ana García</b></div></div>' +
      '<p><b>Informe:</b> Estudio realizado en ' + CLINICS[r.clinic] + '. Ventana acústica adecuada. Cavidades de dimensiones normales. Función sistólica del ventrículo izquierdo conservada (FEy 62%). Sin alteraciones segmentarias de la motilidad. Válvulas de morfología normal, sin estenosis ni insuficiencias significativas.</p>' +
      '<p><b>Conclusión:</b> Ecocardiograma dentro de parámetros normales. Se sugiere control clínico anual.</p>' +
      '<p style="margin-top:22px"><b>Dra. Paula Ríos</b><br><small class="muted">MP 12345 · Cardiología · firmado digitalmente con wallet</small></p>' +
      '<div class="watermarks">' + wm.join('') + '</div>' +
      '</div><div class="document-footer">Documento protegido — descarga deshabilitada · visible solo con permiso vigente</div></div>' +
      '<div class="issuer-details">' +
      '<div><dt>Emisor verificado</dt><dd><b>Dra. Paula Ríos</b> · MP 12345</dd></div>' +
      '<div><dt>Especialidad</dt><dd>Cardiología</dd></div>' +
      '<div><dt>Fecha on-chain</dt><dd>' + date + ' · ' + fmtTime(r.issuedAt) + '</dd></div>' +
      '<div><dt>Transacción</dt><dd><a href="' + solscan(r.tx) + '" target="_blank" rel="noopener">' + short(r.tx) + ' ' + icon('external') + '</a></dd></div>' +
      '<div><dt>content_hash</dt><dd class="mono" style="font-size:8px">' + r.hash.slice(0, 40) + '…</dd></div>' +
      '<div><dt>Origen</dt><dd>' + CLINICS[r.clinic] + ' · verificado por el equipo</dd></div>' +
      '</div>' +
      '<div class="notice success" style="margin-top:14px">' + icon('shieldCheck') + '<span>Integridad verificada: el hash del archivo coincide con el content_hash registrado en Solana.</span></div></div>';
  }

  function runKeyRequest(req) {
    var v = state.viewer;
    if (req.expiresAt <= Date.now()) { v.stage = 'deniedExpired'; render(); return; }
    v.stage = 'processing'; v.step = 0; render();
    setTimeout(function () { v.step = 1; render(); }, 1100);
    setTimeout(function () {
      var logTx = sig();
      pushLog(NAMES.reader, 'Accedió a "' + record(req.recordId).title + '" (llave entregada y acceso registrado)', logTx, 'AccessLogged');
      pushChain('AccessLogged', logTx, 'reader ' + short(WALLETS.reader) + ' · record_pda · ts ' + fmtTime(Date.now()), 'AccessLogged');
      v.step = 2; render();
    }, 2200);
    setTimeout(function () { v.stage = 'document'; render(); }, 3300);
  }

  /* ================= bind ================= */
  function bindContent() {
    app.querySelectorAll('[data-navto]').forEach(function (b) {
      b.addEventListener('click', function () { state.view = b.getAttribute('data-navto'); render(); });
    });
    app.querySelectorAll('[data-dispute]').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = record(b.getAttribute('data-dispute'));
        openModal('Marcar "No es mío"', '<p>El estudio <b>' + esc(r.title) + '</b> pasará a estado <b>En disputa</b>. Se firma dispute_record en Solana y el emisor deberá anularlo o corregirlo.</p>',
          '<button class="button secondary" data-close>Cancelar</button><button class="button danger" id="confirmDispute">Confirmar</button>');
        document.getElementById('confirmDispute').addEventListener('click', function () {
          r.status = 'DISPUTED';
          var tx = sig();
          pushLog(NAMES.patient, 'Marcó "' + r.title + '" como no suyo (dispute_record)', tx, 'RecordDisputed');
          pushChain('Record', tx, 'status ACTIVE → DISPUTED · firmado por el paciente', 'RecordDisputed');
          document.getElementById('modal').close();
          render();
          toast('Estudio marcado como DISPUTED. El emisor fue notificado.');
        });
      });
    });
    app.querySelectorAll('[data-grant]').forEach(function (b) {
      b.addEventListener('click', function () {
        var req = requestFor(b.getAttribute('data-grant'));
        var dur = parseInt(app.querySelector('.duration.selected[data-req="' + req.id + '"]').getAttribute('data-dur'), 10);
        var r = record(req.recordId);
        openModal('Firmar grant_access', '<p>Vas a firmar un AccessGrant en Solana para <b>' + esc(req.doctor === 'reader' ? NAMES.reader : NAMES.blocked) + '</b> sobre <b>' + esc(r.title) + '</b>.</p><pre>grant_access(\n  record: ' + r.id + '_pda,\n  reader: ' + short(WALLETS[req.doctor]) + ',\n  expires_in: ' + Math.round(dur / 60000) + ' min\n)</pre><p class="muted" style="font-size:10px">El servicio de llaves solo entregará la DEK mientras el permiso esté vigente.</p>',
          '<button class="button secondary" data-close>Cancelar</button><button class="button teal" id="signGrant">' + icon('shieldCheck') + 'Firmar con mi wallet</button>');
        document.getElementById('signGrant').addEventListener('click', function () {
          req.status = 'granted'; req.expiresAt = Date.now() + dur; req.tx = sig();
          pushLog(NAMES.patient, 'Firmó acceso de ' + fmtRemaining(dur) + ' a "' + r.title + '" para ' + (req.doctor === 'reader' ? NAMES.reader : NAMES.blocked), req.tx, 'AccessGranted');
          pushChain('AccessGrant', req.tx, 'reader ' + short(WALLETS[req.doctor]) + ' · expires_at ' + fmtTime(req.expiresAt), 'AccessGranted');
          notify(req.doctor === 'reader' ? NAMES.reader + ' ahora puede leer "' + r.title + '"' : NAMES.blocked + ' ahora puede leer "' + r.title + '"');
          document.getElementById('modal').close();
          render();
          toast('Permiso firmado en Solana. Vence en ' + fmtRemaining(dur) + '.');
        });
      });
    });
    app.querySelectorAll('[data-deny]').forEach(function (b) {
      b.addEventListener('click', function () {
        var req = requestFor(b.getAttribute('data-deny'));
        req.status = 'denied';
        var r = record(req.recordId);
        pushLog(NAMES.patient, 'Denegó el acceso de ' + NAMES.blocked + ' a "' + r.title + '"', null, 'AccessDenied');
        render();
        toast('Acceso denegado. Por defecto, nadie lee sin tu firma.');
      });
    });
    app.querySelectorAll('.duration').forEach(function (b) {
      b.addEventListener('click', function () {
        var reqId = b.getAttribute('data-req');
        app.querySelectorAll('.duration[data-req="' + reqId + '"]').forEach(function (x) { x.classList.remove('selected'); });
        b.classList.add('selected');
      });
    });

    var scan = document.getElementById('scanBtn');
    if (scan) scan.addEventListener('click', function () {
      state.issuerStep = 1; state.foundPatient = false; render();
      toast('QR válido: PatientProfile de Ana García encontrado en Solana.');
    });
    app.querySelectorAll('[data-doc]').forEach(function (b) {
      b.addEventListener('click', function () { state.chosenDoc = b.getAttribute('data-doc'); render(); });
    });
    var start = document.getElementById('startIssue');
    if (start) start.addEventListener('click', runIssuing);
    var done = document.getElementById('issueDone');
    if (done) done.addEventListener('click', function () { state.issuerStep = 0; state.chosenDoc = null; render(); });

    var find = document.getElementById('findPatient');
    if (find) find.addEventListener('click', function () {
      var val = (document.getElementById('codeInput').value || '').trim().toUpperCase();
      if (val !== state.shortCode || Date.now() > state.codeExpires) {
        toast('Código inválido o vencido. Pedile a Ana el código actual.');
        return;
      }
      state.foundPatient = true; render();
      toast('Paciente encontrada: Ana García.');
    });
    var paste = document.getElementById('pasteCode');
    if (paste) paste.addEventListener('click', function () { document.getElementById('codeInput').value = state.shortCode; });

    app.querySelectorAll('[data-request]').forEach(function (b) {
      b.addEventListener('click', function () {
        var doctor = b.getAttribute('data-doctor');
        var recId = b.getAttribute('data-request');
        state.requests.push({ id: 'q' + Date.now() + doctor, doctor: doctor, recordId: recId, status: 'pending', expiresAt: null, tx: null });
        render();
        toast('Solicitud enviada. Ana decide si firma el acceso.');
      });
    });

    var rk = document.getElementById('requestKey');
    if (rk) rk.addEventListener('click', function () {
      var req = state.requests.find(function (r) { return r.doctor === 'reader' && r.status === 'granted'; });
      runKeyRequest(req);
    });
    var skip = document.getElementById('skipTime');
    if (skip) skip.addEventListener('click', function () {
      var req = state.requests.find(function (r) { return r.doctor === 'reader' && r.status === 'granted'; });
      if (req) {
        req.expiresAt = Date.now() - 1000;
        state.expiredDenied = true;
        if (state.viewer.stage === 'processing' || state.viewer.stage === 'document') state.viewer.stage = 'idle';
        render();
        toast('Pasaron ' + '60+ minutos: el AccessGrant del Dr. Sosa venció on-chain.');
      }
    });
    var tamper = document.getElementById('tamperToggle');
    if (tamper) tamper.addEventListener('change', function () {
      state.viewer.tampered = tamper.checked; render();
      toast(tamper.checked ? 'Archivo modificado: el hash ya no coincide con el on-chain.' : 'Archivo restaurado: hash coincide otra vez.');
    });
  }

  /* ================= render ================= */
  function render() {
    var keepToolsOpen = !!(app && app.querySelector && app.querySelector('.demo-tools') && app.querySelector('.demo-tools').open);
    var content = '';
    if (state.role === 'patient') {
      content = state.view === 'qr' ? patientQrView()
        : state.view === 'requests' ? patientRequestsView()
        : state.view === 'timeline' ? patientTimelineView()
        : patientRecordsView();
    } else if (state.role === 'issuer') {
      content = issuerView();
    } else if (state.role === 'reader') {
      content = state.view === 'viewer' ? viewerView() : codeInputView('reader');
    } else {
      content = codeInputView('blocked');
    }
    renderShell(content);
    if (keepToolsOpen) { var dt = app.querySelector('.demo-tools'); if (dt) dt.open = true; }
  }

  /* code countdown + live countdown refresh */
  setInterval(function () {
    if (Date.now() >= state.codeExpires) {
      state.shortCode = rnd(6);
      state.codeExpires = Date.now() + 120000;
      if (state.role === 'patient' && state.view === 'qr') render();
    } else if ((state.role === 'patient' && state.view === 'qr') || (state.role === 'reader' && state.view === 'viewer')) {
      render();
    }
  }, 1000);

  render();
})();
