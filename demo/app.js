/* Salua demo — all state is simulated in the browser. No backend, no real crypto, no network calls. */
(function () {
  'use strict';

  /* ================= i18n ================= */
  var T = {
    es: {
      'skip': 'Ir al contenido',
      'tagline': 'Tu historia clínica, bajo tu control',
      'demoBadge': 'Solana devnet · simulado',
      'netSim': 'devnet · simulado',
      'sidebarNoteTitle': 'Datos cifrados de extremo a extremo',
      'sidebarNoteBody': 'El documento se cifra en tu navegador (AES-256-GCM). En Solana solo quedan permisos, hashes y auditoría.',
      'sidebarFootDemo': 'Demo interactivo',
      'viewAs': 'Ver como:',
      'footer1': 'Salua — prototipo navegable. Todos los datos y transacciones son ficticios.',
      'footer2': 'Sin backend · nada sale del navegador',
      'notifTitle': 'Notificaciones',
      'notifEmpty': 'Sin notificaciones.',
      'close': 'Cerrar', 'cancel': 'Cancelar', 'confirm': 'Confirmar',
      'expired': 'vencido',
      'role.patient': 'Ana · Paciente', 'role.issuer': 'Dra. Ríos · Emisora', 'role.reader': 'Dr. Sosa · Lector', 'role.blocked': 'Dr. Vega · Lector',
      'sub.patient': 'Paciente', 'sub.issuer': 'MP 12345 · Cardiología', 'sub.reader': 'MP 67890 · Clínica San José', 'sub.blocked': 'MP 11223 · Sin verificar en esta clínica',
      'name.patient': 'Ana García', 'name.issuer': 'Dra. Paula Ríos', 'name.reader': 'Dr. Martín Sosa', 'name.blocked': 'Dr. Luis Vega',
      'nav.records': 'Mis estudios', 'nav.qr': 'Mi QR', 'nav.requests': 'Solicitudes', 'nav.timeline': 'Línea de tiempo',
      'nav.issue': 'Nuevo estudio', 'nav.request': 'Pedir acceso', 'nav.viewer': 'Visor',
      'dashboardOf': function (n) { return 'Panel de ' + n; },
      'switchedTo': function (l) { return 'Cambiaste a: ' + l; },

      'guideTitle': 'Guion del demo',
      'goToStep': function (n, m) { return 'Ir al paso ' + n + ' / ' + m; },
      'resetDemo': 'Reiniciar demo',
      'chainTitle': 'Qué queda en Solana',
      'chainSub': 'Simulación de escrituras on-chain. Nada médico toca la cadena.',
      'chainRecent': 'Cuentas y eventos recientes',
      'sigLabel': 'firma:',
      'chainCaption': 'PDAs: PatientProfile, Record (content_hash, emisor, estado) y AccessGrant (lector, vencimiento). Eventos: RecordIssued, AccessGranted, AccessLogged.',
      'offchainTitle': 'Lo que NO está en la cadena',
      'excl.doc': 'El documento', 'excl.names': 'Nombres', 'excl.diag': 'Diagnósticos', 'excl.dni': 'DNI',
      'offchainBody': 'El archivo va cifrado a almacenamiento off-chain (borrable). La cadena solo prueba quién emitió, quién accedió y que el hash no cambió.',

      'g1.t': '1 · La Dra. Ríos escanea el QR de Ana', 'g1.d': 'Cambiá a "Dra. Ríos" y tocá "Simular escaneo". Se cifra el estudio, se calcula el hash y se firma issue_record.',
      'g2.t': '2 · Ana revisa el estudio nuevo', 'g2.d': 'En "Mis estudios" aparece con la notificación. Podés tocar "No es mío" en cualquier estudio para ver el estado DISPUTED.',
      'g3.t': '3 · El Dr. Sosa pide acceso', 'g3.d': 'Cambiá a "Dr. Sosa", ingresá el código de Ana y pedí acceso al estudio.',
      'g4.t': '4 · Ana firma el permiso', 'g4.d': 'Volvé a Ana → Solicitudes, elegí 1 hora y firmá grant_access.',
      'g5.t': '5 · El Dr. Sosa abre el visor', 'g5.d': 'El servicio de llaves verifica el permiso on-chain, entrega la llave y registra el acceso. Probá "simular archivo alterado".',
      'g6.t': '6 · El Dr. Vega queda afuera', 'g6.d': 'Pedí acceso con el Dr. Vega, negalo desde Ana y mirá qué pasa.',
      'g7.t': '7 · Vencimiento del permiso', 'g7.d': 'Tocá "Simular paso del tiempo" en el visor del Dr. Sosa y reintentá pedir la llave.',
      'g8.t': '8 · Línea de tiempo de Ana', 'g8.d': 'Todos los accesos quedan registrados con su transacción en Solana devnet.',

      'st.ACTIVE': 'Activo', 'st.DISPUTED': 'En disputa', 'st.VOIDED': 'Anulado',
      'st.denied': 'Denegado', 'st.expired': 'Vencido', 'st.granted': 'Otorgado', 'st.pending': 'Pendiente',
      'st.waiting': 'Esperando a Ana', 'st.live': 'Permiso vigente', 'st.expiredPill': 'Permiso vencido',

      'kind.lab': 'Laboratorio', 'kind.img': 'Imagen', 'kind.study': 'Estudio', 'kind.rep': 'Informe',
      'recData.hemo': 'Hemograma completo', 'recData.radio': 'Radiografía de tórax', 'recData.ecg': 'Electrocardiograma',
      'docData.eco': 'Informe de ecocardiograma', 'docData.lipids': 'Laboratorio — perfil lipídico',
      'docDetail.eco': 'Ecocardiograma Doppler · 2 páginas · 1,4 MB', 'docDetail.lipids': 'Análisis bioquímico · 1 página · 380 KB',
      'docKind.pdf': 'Informe PDF', 'docKind.res': 'Resultados PDF',

      'rec.title': 'Mis estudios',
      'rec.sub': 'Sos la dueña de tu historia. Cada carga queda firmada por el médico.',
      'pendBanner': function (n) { return n + ' solicitud(es) de acceso esperando tu firma.'; },
      'review': 'Revisar',
      'hero.eyebrow': 'TU HISTORIA, TUS REGLAS',
      'hero.h': 'Ningún médico lee tus estudios sin tu firma.',
      'hero.p': 'El acceso vence solo y cada lectura queda registrada en Solana.',
      'stat.records': 'estudios emitidos', 'stat.active': 'activos y verificables', 'stat.events': 'eventos auditados',
      'listTitle': 'Estudios',
      'listNew': function (n) { return n + ' nuevo(s) recibido(s)'; },
      'listSorted': 'Ordenados por fecha de emisión',
      'f.all': 'Todos', 'f.active': 'Activos', 'f.disputed': 'En disputa',
      'notMine': 'No es mío', 'newTag': '· nuevo',
      'issuedBy': 'Emitido por', 'byIssuer': 'emitido por',
      'secStrip': 'Cifrados con AES-256-GCM en tu navegador · la cadena solo guarda el hash',

      'qr.title': 'Mi QR',
      'qr.sub': 'Mostrá este código al médico presente. Vence y se regenera solo.',
      'qr.card': 'Código de acceso temporal',
      'qr.renews': function (x) { return 'Se renueva en ' + x; },
      'qr.wallet': 'Tu wallet pública',
      'qr.how': 'Cómo funciona',
      'qr.s1t': 'El médico escanea', 'qr.s1p': 'Un médico verificado (matrícula registrada) escanea el código para identificar tu historia.',
      'qr.s2t': 'Puede cargar o pedir acceso', 'qr.s2p': 'Puede emitirte un estudio nuevo o pedirte permiso para leer uno existente.',
      'qr.s3t': 'Vos decidís', 'qr.s3p': 'Aprobás por 1 h, 24 h o 7 días firmando grant_access con tu wallet. Después vence solo.',
      'qr.notice': 'El código no contiene datos médicos: solo sirve para encontrar tu PatientProfile en Solana.',
      'validFor': function (x) { return 'válido por ' + x; },

      'req.title': 'Solicitudes de acceso',
      'req.sub': 'Solo vos podés firmar un permiso. Nada se comparte por defecto.',
      'req.verified': 'matrícula verificada',
      'req.asksFor': 'Solicita acceso a:',
      'req.dur': 'Duración del permiso',
      'dur.1h': '1 hora', 'dur.24h': '24 horas', 'dur.7d': '7 días',
      'req.sign': 'Firmar grant_access', 'req.deny': 'Denegar',
      'req.empty.t': 'Sin solicitudes pendientes',
      'req.empty.p': 'Cuando un médico pida acceso con tu código, aparece acá con su matrícula verificada.',
      'req.resolved': 'Resueltas',
      'req.signedExp': function (x) { return 'Permiso firmado · vence ' + x; },
      'req.deniedByYou': 'Acceso denegado por vos',
      'org.blocked': 'consultorio particular',

      'tl.title': 'Línea de tiempo',
      'tl.sub': 'Cada emisión, permiso y lectura queda registrado en Solana. Esto es tu evidencia.',
      'tl.viewtx': 'Ver transacción en solscan (devnet)',
      'tl.empty': 'Todavía no hay eventos.',
      'tl.strip': 'Los eventos guardan quién, cuándo y la firma — nunca el contenido del estudio',
      'log.issued': function (x) { return 'Emitió "' + x + '"'; },
      'log.disputed': function (x) { return 'Marcó "' + x + '" como no suyo (dispute_record)'; },
      'log.granted': function (d, x, w) { return 'Firmó acceso de ' + d + ' a "' + x + '" para ' + w; },
      'log.accessed': function (x) { return 'Accedió a "' + x + '" (llave entregada y acceso registrado)'; },
      'log.denied': function (w, x) { return 'Denegó el acceso de ' + w + ' a "' + x + '"'; },
      'log.issuedSig': function (x) { return 'Emitió "' + x + '" con firma de MP 12345'; },

      'iss.title': 'Cargar estudio',
      'iss.sub': 'Solo médicos con matrícula verificada pueden emitir. Cada carga queda firmada con tu wallet.',
      'iss.scanT': 'Escanear el QR del paciente',
      'iss.scanP': 'El código identifica el PatientProfile en Solana. No expone datos médicos.',
      'iss.scanBtn': 'Simular escaneo del QR de Ana',
      'iss.found': 'Paciente identificado',
      'iss.foundMeta': function (w) { return 'PatientProfile encontrado · wallet ' + w; },
      'iss.pick': 'Seleccionar documento',
      'iss.choose': 'Elegir', 'iss.chosen': 'Seleccionado',
      'iss.emit': 'Cifrar y emitir estudio',
      'iss.forPatient': function (c) { return 'Para Ana García · ' + c; },
      'proc.enc': 'Cifrando con AES-256-GCM en el navegador',
      'proc.encSub': 'DEK nueva por estudio · el archivo plano nunca sale',
      'proc.hash': 'Calculando content_hash (SHA-256)',
      'proc.hashSub': 'hash del archivo cifrado',
      'proc.hashVal': function (h) { return 'hash: ' + h; },
      'proc.sign': 'Firmando issue_record en Solana',
      'proc.signSub': 'Record PDA · hash, emisor y estado on-chain',
      'proc.done': 'Confirmado',
      'proc.doneSub': 'Estudio activo y verificable para el paciente',
      'iss.doneMsg': '<b>Estudio emitido.</b> Ana recibió una notificación y puede disputarlo si no es suyo.',
      'iss.another': 'Emitir otro estudio',
      'toast.scan': 'QR válido: PatientProfile de Ana García encontrado en Solana.',

      'rd.title': 'Pedir acceso',
      'rd.sub': function (mp) { return 'Ingresá el código temporal del paciente. ' + mp + '.'; },
      'rd.code': 'Código del paciente',
      'rd.useAna': 'Usar código de Ana',
      'rd.codeNote': 'El código identifica a la paciente frente a vos. Vence cada 2 minutos.',
      'rd.find': 'Buscar paciente',
      'rd.found': function (n) { return 'Historia encontrada · ' + n + ' estudios'; },
      'rd.askAccess': 'Solicitar acceso a un estudio',
      'rd.mine': 'Mis solicitudes',
      'rd.requestBtn': 'Pedir acceso',
      'rd.openViewer': 'Abrir visor',
      'rd.deniedNote': 'Acceso denegado: el servicio de llaves niega por defecto',
      'toast.reqSent': 'Solicitud enviada. Ana decide si firma el acceso.',
      'toast.badCode': 'Código inválido o vencido. Pedile a Ana el código actual.',
      'toast.found': 'Paciente encontrada: Ana García.',

      'vw.title': 'Visor protegido',
      'vw.sub': 'El documento solo se descifra si el permiso está vigente y el hash coincide.',
      'vw.none.t': 'Sin permiso activo',
      'vw.none.p': 'Pedí acceso a un estudio de Ana. Cuando ella firme grant_access, podés abrirlo acá.',
      'vw.left': function (x) { return 'Quedan ' + x; },
      'vw.keyT': 'Pedir la llave de descifrado',
      'vw.keyP': 'El servicio de llaves verifica tu AccessGrant en Solana antes de entregar la DEK.',
      'vw.keyBtn': 'Solicitar llave',
      'vw.expiredNotice': 'El permiso venció. El servicio de llaves no entrega más la DEK. Ana puede firmar un permiso nuevo.',
      'vw.p1': 'Servicio de llaves: verificando AccessGrant en Solana',
      'vw.p1sub': function (r, x) { return 'AccessGrant PDA · lector ' + r + ' · Record ' + x; },
      'vw.p2': 'Registrando log_access',
      'vw.p2sub': 'AccessLogged · firma key_service · reloj de la red',
      'vw.p3': 'Llave entregada — verificando integridad',
      'vw.p3sub': 'recalculando SHA-256 del archivo cifrado',
      'vw.expT': 'PERMISO VENCIDO',
      'vw.expP': 'El servicio de llaves verificó la cadena y tu AccessGrant ya venció.<br><b>Llave no entregada.</b> Solo Ana puede firmar un nuevo acceso.',
      'vw.altT': 'ESTUDIO ALTERADO',
      'vw.altP': 'El SHA-256 del archivo no coincide con el content_hash on-chain.<br><b>No se descifró el documento.</b>',
      'hash.onchain': 'on-chain content_hash',
      'hash.calc': 'hash calculado',
      'tools': 'Herramientas del demo',
      'tools.tamper': 'simular archivo alterado',
      'tools.time': 'Simular paso del tiempo (vencer permiso)',
      'doc.info': 'Informe:', 'doc.concl': 'Conclusión:', 'doc.patient': 'Paciente',
      'doc.body1': function (c) { return 'Estudio realizado en ' + c + '. Ventana acústica adecuada. Cavidades de dimensiones normales. Función sistólica del ventrículo izquierdo conservada (FEy 62%). Sin alteraciones segmentarias de la motilidad. Válvulas de morfología normal, sin estenosis ni insuficiencias significativas.'; },
      'doc.body2': 'Ecocardiograma dentro de parámetros normales. Se sugiere control clínico anual.',
      'doc.signed': 'firmado digitalmente con wallet',
      'doc.footer': 'Documento protegido — descarga deshabilitada · visible solo con permiso vigente',
      'iss.det.emitter': 'Emisor verificado', 'iss.det.spec': 'Especialidad', 'spec.cardio': 'Cardiología',
      'iss.det.date': 'Fecha on-chain', 'iss.det.tx': 'Transacción', 'iss.det.origin': 'Origen', 'iss.det.originV': 'verificado por el equipo',
      'vw.integrity': 'Integridad verificada: el hash del archivo coincide con el content_hash registrado en Solana.',
      'toast.time': 'Pasaron 60+ minutos: el AccessGrant del Dr. Sosa venció on-chain.',
      'toast.tamperOn': 'Archivo modificado: el hash ya no coincide con el on-chain.',
      'toast.tamperOff': 'Archivo restaurado: hash coincide otra vez.',

      'md.notMine': 'Marcar "No es mío"',
      'md.notMineBody': function (x) { return 'El estudio <b>' + x + '</b> pasará a estado <b>En disputa</b>. Se firma dispute_record en Solana y el emisor deberá anularlo o corregirlo.'; },
      'md.grant': 'Firmar grant_access',
      'md.grantBody': function (w, x) { return 'Vas a firmar un AccessGrant en Solana para <b>' + w + '</b> sobre <b>' + x + '</b>.'; },
      'md.grantNote': 'El servicio de llaves solo entregará la DEK mientras el permiso esté vigente.',
      'md.signWallet': 'Firmar con mi wallet',
      'toast.disputed': 'Estudio marcado como DISPUTED. El emisor fue notificado.',
      'toast.granted': function (x) { return 'Permiso firmado en Solana. Vence en ' + x + '.'; },
      'toast.denied': 'Acceso denegado. Por defecto, nadie lee sin tu firma.',
      'notif.newRec': function (x) { return 'Estudio nuevo: "' + x + '" emitido por la ' + t('name.issuer') + ' (Centro Diagnóstico Norte).'; },
      'notif.canRead': function (w, x) { return w + ' ahora puede leer "' + x + '"'; },

      'cn.profile': function (w) { return 'owner: ' + w; },
      'cn.recordSeed': 'content_hash · issuer · ACTIVE',
      'cn.recordNew': function (h, w) { return 'content_hash ' + h + '… · issuer ' + w; },
      'cn.disputed': 'status ACTIVE → DISPUTED · firmado por el paciente',
      'cn.grant': function (w, x) { return 'reader ' + w + ' · expires_at ' + x; },
      'cn.access': function (w, x) { return 'reader ' + w + ' · record_pda · ts ' + x; }
    },
    en: {
      'skip': 'Skip to content',
      'tagline': 'Your health record, under your control',
      'demoBadge': 'Solana devnet · simulated',
      'netSim': 'devnet · simulated',
      'sidebarNoteTitle': 'End-to-end encrypted data',
      'sidebarNoteBody': 'The document is encrypted in your browser (AES-256-GCM). On Solana only permissions, hashes and audit logs remain.',
      'sidebarFootDemo': 'Interactive demo',
      'viewAs': 'View as:',
      'footer1': 'Salua — clickable prototype. All data and transactions are fictional.',
      'footer2': 'No backend · nothing leaves the browser',
      'notifTitle': 'Notifications',
      'notifEmpty': 'No notifications.',
      'close': 'Close', 'cancel': 'Cancel', 'confirm': 'Confirm',
      'expired': 'expired',
      'role.patient': 'Ana · Patient', 'role.issuer': 'Dr. Ríos · Issuer', 'role.reader': 'Dr. Sosa · Reader', 'role.blocked': 'Dr. Vega · Reader',
      'sub.patient': 'Patient', 'sub.issuer': 'MP 12345 · Cardiology', 'sub.reader': 'MP 67890 · San José Clinic', 'sub.blocked': 'MP 11223 · Not verified at this clinic',
      'name.patient': 'Ana García', 'name.issuer': 'Dr. Paula Ríos', 'name.reader': 'Dr. Martín Sosa', 'name.blocked': 'Dr. Luis Vega',
      'nav.records': 'My records', 'nav.qr': 'My QR', 'nav.requests': 'Requests', 'nav.timeline': 'Timeline',
      'nav.issue': 'New record', 'nav.request': 'Request access', 'nav.viewer': 'Viewer',
      'dashboardOf': function (n) { return n + "'s dashboard"; },
      'switchedTo': function (l) { return 'Switched to: ' + l; },

      'guideTitle': 'Demo script',
      'goToStep': function (n, m) { return 'Go to step ' + n + ' / ' + m; },
      'resetDemo': 'Reset demo',
      'chainTitle': 'What goes on Solana',
      'chainSub': 'Simulated on-chain writes. Nothing medical touches the chain.',
      'chainRecent': 'Recent accounts and events',
      'sigLabel': 'sig:',
      'chainCaption': 'PDAs: PatientProfile, Record (content_hash, issuer, status) and AccessGrant (reader, expiry). Events: RecordIssued, AccessGranted, AccessLogged.',
      'offchainTitle': 'What is NOT on the chain',
      'excl.doc': 'The document', 'excl.names': 'Names', 'excl.diag': 'Diagnoses', 'excl.dni': 'National ID',
      'offchainBody': 'The file goes encrypted to (deletable) off-chain storage. The chain only proves who issued it, who accessed it, and that the hash did not change.',

      'g1.t': '1 · Dr. Ríos scans Ana\'s QR', 'g1.d': 'Switch to "Dr. Ríos" and tap "Simulate scan". The record gets encrypted, its hash is computed and issue_record is signed.',
      'g2.t': '2 · Ana reviews the new record', 'g2.d': 'It shows in "My records" with a notification. Tap "Not mine" on any record to see the DISPUTED status.',
      'g3.t': '3 · Dr. Sosa requests access', 'g3.d': 'Switch to "Dr. Sosa", enter Ana\'s code and request access to the record.',
      'g4.t': '4 · Ana signs the permission', 'g4.d': 'Back to Ana → Requests, pick 1 hour and sign grant_access.',
      'g5.t': '5 · Dr. Sosa opens the viewer', 'g5.d': 'The key service verifies the permission on-chain, delivers the key and logs the access. Try "simulate tampered file".',
      'g6.t': '6 · Dr. Vega stays out', 'g6.d': 'Request access as Dr. Vega, deny it from Ana and see what happens.',
      'g7.t': '7 · Permission expiry', 'g7.d': 'Tap "Simulate time passing" in Dr. Sosa\'s viewer and retry requesting the key.',
      'g8.t': '8 · Ana\'s timeline', 'g8.d': 'Every access is logged with its transaction on Solana devnet.',

      'st.ACTIVE': 'Active', 'st.DISPUTED': 'Disputed', 'st.VOIDED': 'Voided',
      'st.denied': 'Denied', 'st.expired': 'Expired', 'st.granted': 'Granted', 'st.pending': 'Pending',
      'st.waiting': 'Waiting for Ana', 'st.live': 'Permission active', 'st.expiredPill': 'Permission expired',

      'kind.lab': 'Lab', 'kind.img': 'Imaging', 'kind.study': 'Study', 'kind.rep': 'Report',
      'recData.hemo': 'Complete blood count', 'recData.radio': 'Chest X-ray', 'recData.ecg': 'Electrocardiogram',
      'docData.eco': 'Echocardiogram report', 'docData.lipids': 'Lab — lipid panel',
      'docDetail.eco': 'Doppler echocardiogram · 2 pages · 1.4 MB', 'docDetail.lipids': 'Biochemistry panel · 1 page · 380 KB',
      'docKind.pdf': 'PDF report', 'docKind.res': 'PDF results',

      'rec.title': 'My records',
      'rec.sub': 'You own your health record. Every upload is signed by the doctor.',
      'pendBanner': function (n) { return n + ' access request(s) waiting for your signature.'; },
      'review': 'Review',
      'hero.eyebrow': 'YOUR RECORD, YOUR RULES',
      'hero.h': 'No doctor reads your records without your signature.',
      'hero.p': 'Access expires on its own and every read is logged on Solana.',
      'stat.records': 'records issued', 'stat.active': 'active and verifiable', 'stat.events': 'audited events',
      'listTitle': 'Records',
      'listNew': function (n) { return n + ' new received'; },
      'listSorted': 'Sorted by issue date',
      'f.all': 'All', 'f.active': 'Active', 'f.disputed': 'Disputed',
      'notMine': 'Not mine', 'newTag': '· new',
      'issuedBy': 'Issued by', 'byIssuer': 'issued by',
      'secStrip': 'Encrypted with AES-256-GCM in your browser · the chain only stores the hash',

      'qr.title': 'My QR',
      'qr.sub': 'Show this code to the doctor in front of you. It expires and renews on its own.',
      'qr.card': 'Temporary access code',
      'qr.renews': function (x) { return 'Renews in ' + x; },
      'qr.wallet': 'Your public wallet',
      'qr.how': 'How it works',
      'qr.s1t': 'The doctor scans', 'qr.s1p': 'A verified doctor (registered license) scans the code to identify your record.',
      'qr.s2t': 'They can upload or request access', 'qr.s2p': 'They can issue you a new record or ask your permission to read an existing one.',
      'qr.s3t': 'You decide', 'qr.s3p': 'You approve for 1 h, 24 h or 7 days by signing grant_access with your wallet. It then expires on its own.',
      'qr.notice': 'The code contains no medical data: it only locates your PatientProfile on Solana.',
      'validFor': function (x) { return 'valid for ' + x; },

      'req.title': 'Access requests',
      'req.sub': 'Only you can sign a permission. Nothing is shared by default.',
      'req.verified': 'license verified',
      'req.asksFor': 'Requests access to:',
      'req.dur': 'Permission duration',
      'dur.1h': '1 hour', 'dur.24h': '24 hours', 'dur.7d': '7 days',
      'req.sign': 'Sign grant_access', 'req.deny': 'Deny',
      'req.empty.t': 'No pending requests',
      'req.empty.p': 'When a doctor requests access with your code, it shows here with their verified license.',
      'req.resolved': 'Resolved',
      'req.signedExp': function (x) { return 'Permission signed · expires ' + x; },
      'req.deniedByYou': 'Access denied by you',
      'org.blocked': 'private practice',

      'tl.title': 'Timeline',
      'tl.sub': 'Every issuance, permission and read is logged on Solana. This is your evidence.',
      'tl.viewtx': 'View transaction on solscan (devnet)',
      'tl.empty': 'No events yet.',
      'tl.strip': 'Events store who, when and the signature — never the record content',
      'log.issued': function (x) { return 'Issued "' + x + '"'; },
      'log.disputed': function (x) { return 'Marked "' + x + '" as not theirs (dispute_record)'; },
      'log.granted': function (d, x, w) { return 'Signed ' + d + ' access to "' + x + '" for ' + w; },
      'log.accessed': function (x) { return 'Accessed "' + x + '" (key delivered and access logged)'; },
      'log.denied': function (w, x) { return 'Denied ' + w + ' access to "' + x + '"'; },
      'log.issuedSig': function (x) { return 'Issued "' + x + '" signed with MP 12345'; },

      'iss.title': 'Upload record',
      'iss.sub': 'Only doctors with a verified license can issue. Every upload is signed with your wallet.',
      'iss.scanT': 'Scan the patient\'s QR',
      'iss.scanP': 'The code identifies the PatientProfile on Solana. It exposes no medical data.',
      'iss.scanBtn': 'Simulate scanning Ana\'s QR',
      'iss.found': 'Patient identified',
      'iss.foundMeta': function (w) { return 'PatientProfile found · wallet ' + w; },
      'iss.pick': 'Select document',
      'iss.choose': 'Choose', 'iss.chosen': 'Selected',
      'iss.emit': 'Encrypt and issue record',
      'iss.forPatient': function (c) { return 'For Ana García · ' + c; },
      'proc.enc': 'Encrypting with AES-256-GCM in the browser',
      'proc.encSub': 'New DEK per record · the plaintext file never leaves',
      'proc.hash': 'Computing content_hash (SHA-256)',
      'proc.hashSub': 'hash of the encrypted file',
      'proc.hashVal': function (h) { return 'hash: ' + h; },
      'proc.sign': 'Signing issue_record on Solana',
      'proc.signSub': 'Record PDA · hash, issuer and status on-chain',
      'proc.done': 'Confirmed',
      'proc.doneSub': 'Record active and verifiable for the patient',
      'iss.doneMsg': '<b>Record issued.</b> Ana was notified and can dispute it if it is not hers.',
      'iss.another': 'Issue another record',
      'toast.scan': 'Valid QR: Ana García\'s PatientProfile found on Solana.',

      'rd.title': 'Request access',
      'rd.sub': function (mp) { return 'Enter the patient\'s temporary code. ' + mp + '.'; },
      'rd.code': 'Patient\'s code',
      'rd.useAna': 'Use Ana\'s code',
      'rd.codeNote': 'The code identifies the patient in front of you. It expires every 2 minutes.',
      'rd.find': 'Find patient',
      'rd.found': function (n) { return 'Record found · ' + n + ' records'; },
      'rd.askAccess': 'Request access to a record',
      'rd.mine': 'My requests',
      'rd.requestBtn': 'Request access',
      'rd.openViewer': 'Open viewer',
      'rd.deniedNote': 'Access denied: the key service denies by default',
      'toast.reqSent': 'Request sent. Ana decides whether to sign access.',
      'toast.badCode': 'Invalid or expired code. Ask Ana for the current code.',
      'toast.found': 'Patient found: Ana García.',

      'vw.title': 'Protected viewer',
      'vw.sub': 'The document only decrypts if the permission is valid and the hash matches.',
      'vw.none.t': 'No active permission',
      'vw.none.p': 'Request access to one of Ana\'s records. Once she signs grant_access you can open it here.',
      'vw.left': function (x) { return x + ' left'; },
      'vw.keyT': 'Request the decryption key',
      'vw.keyP': 'The key service checks your AccessGrant on Solana before releasing the DEK.',
      'vw.keyBtn': 'Request key',
      'vw.expiredNotice': 'The permission expired. The key service no longer releases the DEK. Ana can sign a new permission.',
      'vw.p1': 'Key service: verifying AccessGrant on Solana',
      'vw.p1sub': function (r, x) { return 'AccessGrant PDA · reader ' + r + ' · Record ' + x; },
      'vw.p2': 'Logging log_access',
      'vw.p2sub': 'AccessLogged · key_service signature · network clock',
      'vw.p3': 'Key delivered — verifying integrity',
      'vw.p3sub': 'recomputing SHA-256 of the encrypted file',
      'vw.expT': 'PERMISSION EXPIRED',
      'vw.expP': 'The key service checked the chain and your AccessGrant already expired.<br><b>Key not delivered.</b> Only Ana can sign new access.',
      'vw.altT': 'RECORD TAMPERED',
      'vw.altP': 'The file\'s SHA-256 does not match the on-chain content_hash.<br><b>The document was not decrypted.</b>',
      'hash.onchain': 'on-chain content_hash',
      'hash.calc': 'computed hash',
      'tools': 'Demo tools',
      'tools.tamper': 'simulate tampered file',
      'tools.time': 'Simulate time passing (expire permission)',
      'doc.info': 'Findings:', 'doc.concl': 'Conclusion:', 'doc.patient': 'Patient',
      'doc.body1': function (c) { return 'Study performed at ' + c + '. Adequate acoustic window. Normal-sized chambers. Preserved left ventricular systolic function (EF 62%). No segmental wall-motion abnormalities. Valves of normal morphology, no significant stenosis or regurgitation.'; },
      'doc.body2': 'Echocardiogram within normal parameters. Annual clinical follow-up suggested.',
      'doc.signed': 'digitally signed with wallet',
      'doc.footer': 'Protected document — download disabled · visible only while permission is active',
      'iss.det.emitter': 'Verified issuer', 'iss.det.spec': 'Specialty', 'spec.cardio': 'Cardiology',
      'iss.det.date': 'On-chain date', 'iss.det.tx': 'Transaction', 'iss.det.origin': 'Origin', 'iss.det.originV': 'verified by the team',
      'vw.integrity': 'Integrity verified: the file hash matches the content_hash recorded on Solana.',
      'toast.time': '60+ minutes passed: Dr. Sosa\'s AccessGrant expired on-chain.',
      'toast.tamperOn': 'File modified: the hash no longer matches the on-chain one.',
      'toast.tamperOff': 'File restored: hash matches again.',

      'md.notMine': 'Mark "Not mine"',
      'md.notMineBody': function (x) { return 'The record <b>' + x + '</b> will move to <b>Disputed</b> status. dispute_record is signed on Solana and the issuer must void or correct it.'; },
      'md.grant': 'Sign grant_access',
      'md.grantBody': function (w, x) { return 'You are about to sign an AccessGrant on Solana for <b>' + w + '</b> on <b>' + x + '</b>.'; },
      'md.grantNote': 'The key service will only release the DEK while the permission is valid.',
      'md.signWallet': 'Sign with my wallet',
      'toast.disputed': 'Record marked as DISPUTED. The issuer was notified.',
      'toast.granted': function (x) { return 'Permission signed on Solana. Expires in ' + x + '.'; },
      'toast.denied': 'Access denied. By default, nobody reads without your signature.',
      'notif.newRec': function (x) { return 'New record: "' + x + '" issued by ' + t('name.issuer') + ' (Centro Diagnóstico Norte).'; },
      'notif.canRead': function (w, x) { return w + ' can now read "' + x + '"'; },

      'cn.profile': function (w) { return 'owner: ' + w; },
      'cn.recordSeed': 'content_hash · issuer · ACTIVE',
      'cn.recordNew': function (h, w) { return 'content_hash ' + h + '… · issuer ' + w; },
      'cn.disputed': 'status ACTIVE → DISPUTED · signed by the patient',
      'cn.grant': function (w, x) { return 'reader ' + w + ' · expires_at ' + x; },
      'cn.access': function (w, x) { return 'reader ' + w + ' · record_pda · ts ' + x; }
    }
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
  function locale() { return state.lang === 'en' ? 'en-US' : 'es-AR'; }
  function fmtTime(ts) { return new Date(ts).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }); }
  function fmtDate(ts) { return new Date(ts).toLocaleDateString(locale(), { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  function fmtRemaining(ms) {
    if (ms <= 0) return t('expired');
    var m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    if (m >= 60) { var h = Math.floor(m / 60); return h + ' h ' + (m % 60) + ' min'; }
    return m + ':' + String(s).padStart(2, '0') + ' min';
  }
  function t(k) {
    var v = (T[state.lang] || T.es)[k];
    if (v === undefined) v = T.es[k] !== undefined ? T.es[k] : k;
    if (typeof v === 'function') return v.apply(null, Array.prototype.slice.call(arguments, 1));
    return v;
  }
  function name(r) { return t('name.' + r); }
  function resolveArgs(args) {
    return (args || []).map(function (a) { return typeof a === 'string' && T.es[a] !== undefined ? t(a) : a; });
  }

  var now = Date.now();
  function mkRecord(id, titleK, kindK, clinic, issuer, issuedAgo) {
    var h = hash64(), tx = sig();
    return {
      id: id, titleK: titleK, kindK: kindK, clinic: clinic, issuer: issuer,
      status: 'ACTIVE', hash: h, tx: tx,
      issuedAt: now - issuedAgo, isNew: false
    };
  }

  var state = {
    lang: (function () { try { return localStorage.getItem('salua-lang') || 'es'; } catch (e) { return 'es'; } })(),
    role: 'patient',
    view: 'records',
    shortCode: 'A7K2M9',
    codeExpires: now + 120000,
    records: [
      mkRecord('r1', 'recData.hemo', 'kind.lab', 'north', 'issuer', 86400000 * 3),
      mkRecord('r2', 'recData.radio', 'kind.img', 'sanjose', 'issuer', 86400000 * 10),
      mkRecord('r3', 'recData.ecg', 'kind.study', 'north', 'issuer', 86400000 * 20)
    ],
    requests: [],
    log: [
      { whoR: 'issuer', whatK: 'log.issued', whatA: ['recData.hemo'], when: now - 86400000 * 3, tx: null, event: 'RecordIssued' }
    ],
    notifications: [],
    chain: [
      { account: 'PatientProfile', sig: sig(), noteK: 'cn.profile', noteA: [short(WALLETS.patient)], event: 'ProfileRegistered' },
      { account: 'Record', sig: sig(), noteK: 'cn.recordSeed', noteA: [], event: 'RecordIssued' }
    ],
    issuerStep: 0,
    chosenDoc: null,
    processing: null,
    viewer: { stage: 'idle', tampered: false }
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
    globe: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>',
    user: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>'
  };
  function icon(n) { return ICONS[n] || ''; }

  function brandImg(cls) {
    return '<img class="' + cls + '" src="assets/logo-salua.jpeg" alt="Salua">';
  }

  /* ---------- helpers ---------- */
  var app = document.getElementById('app');
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function record(id) { return state.records.find(function (r) { return r.id === id; }); }
  function requestFor(id) { return state.requests.find(function (r) { return r.id === id; }); }
  function grantForDoctor(doctor, recordId) {
    return state.requests.find(function (r) { return r.doctor === doctor && r.recordId === recordId && r.status === 'granted'; });
  }
  function statusClass(s) { return { ACTIVE: 'active', DISPUTED: 'disputed', VOIDED: 'voided' }[s] || ''; }
  function initials(n) { return n.replace(/^Dra?\.?\s*/, '').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join(''); }
  function rolePerson() { return name(state.role); }
  function toast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('visible'); }, 3200);
  }
  function pushLog(whoR, whatK, whatA, tx, event) { state.log.unshift({ whoR: whoR, whatK: whatK, whatA: whatA, when: Date.now(), tx: tx, event: event }); }
  function pushChain(account, sigv, noteK, noteA, event) { state.chain.unshift({ account: account, sig: sigv, noteK: noteK, noteA: noteA, event: event }); }
  function notify(msgK) { state.notifications.unshift({ msgK: msgK, args: Array.prototype.slice.call(arguments, 1), when: Date.now() }); }

  /* ---------- QR (decorative deterministic pattern) ---------- */
  function qrSvg(seed) {
    var n = 21, v = 0;
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
  function guideSteps() {
    var sosaReq = state.requests.find(function (r) { return r.doctor === 'reader'; });
    var vegaReq = state.requests.find(function (r) { return r.doctor === 'blocked'; });
    return [
      { tk: 'g1.t', dk: 'g1.d', role: 'issuer', view: 'issue', done: state.records.some(function (r) { return r.isNew; }) },
      { tk: 'g2.t', dk: 'g2.d', role: 'patient', view: 'records', done: state.records.some(function (r) { return r.isNew; }) },
      { tk: 'g3.t', dk: 'g3.d', role: 'reader', view: 'request', done: !!sosaReq },
      { tk: 'g4.t', dk: 'g4.d', role: 'patient', view: 'requests', done: !!(sosaReq && sosaReq.status !== 'pending') },
      { tk: 'g5.t', dk: 'g5.d', role: 'reader', view: 'viewer', done: state.viewer.stage === 'document' },
      { tk: 'g6.t', dk: 'g6.d', role: 'blocked', view: 'request', done: !!(vegaReq && vegaReq.status === 'denied') },
      { tk: 'g7.t', dk: 'g7.d', role: 'reader', view: 'viewer', done: state.viewer.stage === 'deniedExpired' },
      { tk: 'g8.t', dk: 'g8.d', role: 'patient', view: 'timeline', done: false }
    ];
  }
  function currentGuide() {
    var steps = guideSteps();
    for (var i = 0; i < steps.length; i++) if (!steps[i].done) return { step: steps[i], index: i, total: steps.length, steps: steps };
    return { step: steps[steps.length - 1], index: steps.length - 1, total: steps.length, steps: steps };
  }

  /* ---------- layout ---------- */
  function navItems() {
    return {
      patient: [
        { v: 'records', lk: 'nav.records', i: 'home' },
        { v: 'qr', lk: 'nav.qr', i: 'qr' },
        { v: 'requests', lk: 'nav.requests', i: 'inbox', count: function () { return state.requests.filter(function (r) { return r.status === 'pending'; }).length; } },
        { v: 'timeline', lk: 'nav.timeline', i: 'history' }
      ],
      issuer: [{ v: 'issue', lk: 'nav.issue', i: 'scan' }],
      reader: [
        { v: 'request', lk: 'nav.request', i: 'send' },
        { v: 'viewer', lk: 'nav.viewer', i: 'eye' }
      ],
      blocked: [{ v: 'request', lk: 'nav.request', i: 'send' }]
    };
  }
  function roleLabel(r) { return t('role.' + r); }

  function renderShell(content) {
    var nav = navItems()[state.role];
    app.innerHTML =
      '<div class="shell">' +
      '<aside class="sidebar">' +
      '<div class="brand">' + brandImg('brand-img') + '</div>' +
      '<div class="brand-tag">' + t('tagline') + '</div>' +
      '<div class="workspace-label eyebrow">' + esc(roleLabel(state.role)) + '</div>' +
      '<nav class="nav">' + nav.map(function (n) {
        var c = n.count ? n.count() : 0;
        return '<button data-nav="' + n.v + '" class="' + (state.view === n.v ? 'active' : '') + '">' + icon(n.i) + '<span>' + esc(t(n.lk)) + '</span>' + (c ? '<span class="count">' + c + '</span>' : '') + '</button>';
      }).join('') + '</nav>' +
      '<div class="sidebar-bottom"><div class="privacy-note">' + icon('lock') + '<strong style="font-size:12px">' + esc(t('sidebarNoteTitle')) + '</strong><p>' + esc(t('sidebarNoteBody')) + '</p></div>' +
      '<div class="sidebar-foot"><span>' + esc(t('sidebarFootDemo')) + '</span><span>' + esc(t('netSim')) + '</span></div></div>' +
      '</aside>' +
      '<main id="main" style="min-width:0">' +
      '<header class="topbar">' +
      '<div class="row">' +
      '<div class="brand mobile-brand"><span class="brand-icon">' + brandImg('brand-icon-img') + '</span><span>Salua</span></div>' +
      '<span class="topbar-title">' + esc(t('dashboardOf', rolePerson())) + '</span>' +
      '</div>' +
      '<div class="row">' +
      '<span class="demo-badge"><i class="dot"></i>' + esc(t('demoBadge')) + '</span>' +
      '<div class="lang-switch" role="group" aria-label="Language">' +
      '<button data-lang="es" class="' + (state.lang === 'es' ? 'on' : '') + '">ES</button>' +
      '<button data-lang="en" class="' + (state.lang === 'en' ? 'on' : '') + '">EN</button>' +
      '</div>' +
      '<button class="icon-btn" id="bell" aria-label="' + esc(t('notifTitle')) + '">' + icon('bell') + (state.notifications.length ? '<span class="notification-dot"></span>' : '') + '</button>' +
      '<div class="identity"><div class="avatar' + (state.role === 'patient' ? '' : ' doctor') + '">' + initials(rolePerson()) + '</div><div><strong>' + esc(rolePerson()) + '</strong><small>' + esc(t('sub.' + state.role)) + '</small></div></div>' +
      '</div></header>' +
      '<div class="content">' +
      '<div class="role-bar"><span class="role-label">' + esc(t('viewAs')) + '</span><div class="role-switch">' +
      ['patient', 'issuer', 'reader', 'blocked'].map(function (r) {
        return '<button data-role="' + r + '" class="' + (state.role === r ? 'selected' : '') + '">' + esc(roleLabel(r).split(' · ')[0]) + '</button>';
      }).join('') +
      '</div></div>' +
      '<div class="layout"><div class="main-column">' + content + '<div class="footer"><span>' + esc(t('footer1')) + '</span><span>' + esc(t('footer2')) + '</span></div></div>' +
      renderRail() +
      '</div></div></main></div>';

    app.querySelectorAll('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () { state.view = b.getAttribute('data-nav'); render(); });
    });
    app.querySelectorAll('[data-role]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.role = b.getAttribute('data-role');
        state.view = navItems()[state.role][0].v;
        render();
      });
    });
    app.querySelectorAll('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.lang = b.getAttribute('data-lang');
        try { localStorage.setItem('salua-lang', state.lang); } catch (e) {}
        document.documentElement.lang = state.lang;
        var sk = document.getElementById('skipLink'); if (sk) sk.textContent = t('skip');
        render();
      });
    });
    var bell = document.getElementById('bell');
    if (bell) bell.addEventListener('click', function () {
      var list = state.notifications.length ? state.notifications.map(function (n) { var a = resolveArgs(n.args); return '<li style="padding:9px 0;border-bottom:1px solid var(--line);font-size:12px">' + esc(t(n.msgK, a[0], a[1])) + ' <span class="muted">· ' + fmtTime(n.when) + '</span></li>'; }).join('') : '<li style="font-size:12px" class="muted">' + esc(t('notifEmpty')) + '</li>';
      openModal(t('notifTitle'), '<ul style="list-style:none;padding:0;margin:0">' + list + '</ul>');
      state.notifications = [];
    });
    bindRail();
    bindContent();
  }

  function renderRail() {
    var g = currentGuide();
    var recent = state.chain.slice(0, 4);
    return '<aside class="rail">' +
      '<div class="guide"><span class="eyebrow">' + esc(t('guideTitle')) + '</span>' +
      '<h3>' + esc(t(g.step.tk)) + '</h3><p>' + esc(t(g.step.dk)) + '</p>' +
      '<button class="button teal" data-goto="' + g.step.role + '|' + g.step.view + '">' + icon('send') + esc(t('goToStep', g.index + 1, g.total)) + '</button>' +
      '<div class="guide-track">' + g.steps.map(function (s) { return '<i class="' + (s.done ? 'done' : '') + '"></i>'; }).join('') + '</div>' +
      '<button class="reset" id="resetDemo">' + esc(t('resetDemo')) + '</button></div>' +
      '<div class="chain-card"><div class="chain-head"><h2><span class="solana"><i></i><i></i><i></i></span>' + esc(t('chainTitle')) + '</h2><p>' + esc(t('chainSub')) + '</p><span class="network"><i class="dot"></i>' + esc(t('netSim')) + '</span></div>' +
      '<div class="chain-body"><div class="chain-subtitle">' + esc(t('chainRecent')) + '</div>' +
      recent.map(function (c) {
        return '<div class="chain-row"><span class="row" style="gap:8px">' + icon('lock') + '<b>' + c.account + ' PDA</b></span><a class="mono" href="' + solscan(c.sig) + '" target="_blank" rel="noopener">' + short(c.sig) + '</a></div>' +
          '<div class="hash-box"><strong>' + esc(t(c.noteK, c.noteA[0], c.noteA[1])) + '</strong>' + esc(t('sigLabel')) + ' ' + c.sig.slice(0, 20) + '…<br><span class="event-pill">' + c.event + '</span></div>';
      }).join('') +
      '<p class="chain-caption">' + esc(t('chainCaption')) + '</p></div>' +
      '<div class="chain-outside"><h3>' + icon('eye') + esc(t('offchainTitle')) + '</h3>' +
      '<div class="excluded"><span>' + esc(t('excl.doc')) + '</span><span>' + esc(t('excl.names')) + '</span><span>' + esc(t('excl.diag')) + '</span><span>' + esc(t('excl.dni')) + '</span></div>' +
      '<p>' + esc(t('offchainBody')) + '</p></div></div>' +
      '</aside>';
  }

  function bindRail() {
    var g = app.querySelector('[data-goto]');
    if (g) g.addEventListener('click', function () {
      var p = g.getAttribute('data-goto').split('|');
      state.role = p[0]; state.view = p[1]; render();
      toast(t('switchedTo', roleLabel(state.role)));
    });
    var r = document.getElementById('resetDemo');
    if (r) r.addEventListener('click', function () { try { localStorage.setItem('salua-lang', state.lang); } catch (e) {} location.reload(); });
  }

  function openModal(title, html, actions) {
    var d = document.getElementById('modal');
    d.innerHTML = '<h2 id="modal-title">' + esc(title) + '</h2>' + html + '<div class="row">' + (actions || '<button class="button secondary" data-close>' + esc(t('close')) + '</button>') + '</div>';
    if (!d.open) d.showModal();
    d.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { d.close(); }); });
    return d;
  }

  /* ================= PATIENT ================= */
  function patientRecordsView() {
    var newCount = state.records.filter(function (r) { return r.isNew; }).length;
    var list = state.records.map(function (r) {
      var cls = r.kindK === 'kind.lab' ? '' : r.kindK === 'kind.img' ? 'teal' : 'purple';
      return '<div class="record"><div class="record-icon ' + cls + '">' + icon('file') + '</div>' +
        '<div class="record-info"><h3>' + esc(t(r.titleK)) + (r.isNew ? '<span class="new-tag">' + esc(t('newTag')) + '</span>' : '') + '</h3>' +
        '<p>' + esc(t(r.kindK)) + ' · ' + fmtDate(r.issuedAt) + ' · ' + esc(name(r.issuer)) + '</p>' +
        '<span class="origin">' + icon('building') + esc(CLINICS[r.clinic]) + '</span></div>' +
        '<div class="record-actions"><span class="status ' + statusClass(r.status) + '">' + esc(t('st.' + r.status)) + '</span>' +
        (r.status === 'ACTIVE' ? '<button class="text-button" data-dispute="' + r.id + '">' + esc(t('notMine')) + '</button>' : '') +
        '</div></div>';
    }).join('');
    var pending = state.requests.filter(function (r) { return r.status === 'pending'; });
    return '<div class="heading"><div><h1>' + esc(t('rec.title')) + '</h1><p>' + esc(t('rec.sub')) + '</p></div>' +
      '<button class="button teal" data-navto="qr">' + icon('qr') + esc(t('nav.qr')) + '</button></div>' +
      (pending.length ? '<div class="request-banner">' + icon('inbox') + '<p><b>' + esc(t('pendBanner', pending.length)) + '</b></p><button class="button" data-navto="requests">' + esc(t('review')) + '</button></div>' : '') +
      '<div class="hero"><div><span class="eyebrow">' + esc(t('hero.eyebrow')) + '</span><h2>' + esc(t('hero.h')) + '</h2><p>' + esc(t('hero.p')) + '</p></div>' +
      '<div class="shield-orbit">' + icon('shield') + '<span class="shield-check">' + icon('check') + '</span></div></div>' +
      '<div class="stats"><div class="stat"><span class="stat-icon">' + icon('file') + '</span><div><strong>' + state.records.length + '</strong><small>' + esc(t('stat.records')) + '</small></div></div>' +
      '<div class="stat"><span class="stat-icon">' + icon('shieldCheck') + '</span><div><strong>' + state.records.filter(function (r) { return r.status === 'ACTIVE'; }).length + '</strong><small>' + esc(t('stat.active')) + '</small></div></div>' +
      '<div class="stat"><span class="stat-icon">' + icon('history') + '</span><div><strong>' + state.log.length + '</strong><small>' + esc(t('stat.events')) + '</small></div></div></div>' +
      '<div class="section-head"><div><h2>' + esc(t('listTitle')) + '</h2><p>' + esc(newCount ? t('listNew', newCount) : t('listSorted')) + '</p></div></div>' +
      '<div class="filter-bar"><button class="filter active">' + esc(t('f.all')) + '</button><button class="filter">' + esc(t('f.active')) + '</button><button class="filter">' + esc(t('f.disputed')) + '</button></div>' +
      list +
      '<p class="security-strip">' + icon('lock') + esc(t('secStrip')) + '</p>';
  }

  function patientQrView() {
    var left = Math.max(0, state.codeExpires - Date.now());
    return '<div class="heading"><div><h1>' + esc(t('qr.title')) + '</h1><p>' + esc(t('qr.sub')) + '</p></div></div>' +
      '<div class="qr-grid">' +
      '<div class="card qr-card"><h3>' + esc(t('qr.card')) + '</h3>' +
      '<div class="qr-code">' + qrSvg(state.shortCode + WALLETS.patient) + '</div>' +
      '<div class="short-code">' + state.shortCode + '</div>' +
      '<span class="timer-pill">' + icon('clock') + esc(t('qr.renews', fmtRemaining(left))) + '</span>' +
      '<div class="wallet"><small class="eyebrow">' + esc(t('qr.wallet')) + '</small><span class="mono">' + WALLETS.patient + '</span></div></div>' +
      '<div class="card"><h3>' + esc(t('qr.how')) + '</h3><ul class="info-list">' +
      '<li><span class="step-number">1</span><div><h3>' + esc(t('qr.s1t')) + '</h3><p>' + esc(t('qr.s1p')) + '</p></div></li>' +
      '<li><span class="step-number">2</span><div><h3>' + esc(t('qr.s2t')) + '</h3><p>' + esc(t('qr.s2p')) + '</p></div></li>' +
      '<li><span class="step-number">3</span><div><h3>' + esc(t('qr.s3t')) + '</h3><p>' + esc(t('qr.s3p')) + '</p></div></li></ul>' +
      '<div class="notice">' + icon('shield') + '<span>' + esc(t('qr.notice')) + '</span></div></div>' +
      '</div>';
  }

  function patientRequestsView() {
    var pending = state.requests.filter(function (r) { return r.status === 'pending'; });
    var answered = state.requests.filter(function (r) { return r.status !== 'pending'; });
    var pendingHtml = pending.map(function (req) {
      var r = record(req.recordId);
      var who = req.doctor === 'reader' ? { n: name('reader'), mp: 'MP 67890', org: CLINICS.sanjose } : { n: name('blocked'), mp: 'MP 11223', org: t('org.blocked') };
      return '<div class="request-card" style="margin-bottom:16px">' +
        '<div class="row between"><div class="identity"><div class="avatar doctor">' + initials(who.n) + '</div><div><strong>' + esc(who.n) + '</strong><span class="verified">' + icon('shieldCheck') + esc(t('req.verified')) + ' · ' + who.mp + '</span><small>' + esc(who.org) + '</small></div></div></div>' +
        '<div class="record-reference">' + esc(t('req.asksFor')) + ' <b>' + esc(r ? t(r.titleK) : '') + '</b></div>' +
        '<small class="eyebrow">' + esc(t('req.dur')) + '</small>' +
        '<div class="durations">' +
        '<button class="duration selected" data-dur="3600000" data-req="' + req.id + '">' + esc(t('dur.1h')) + '</button>' +
        '<button class="duration" data-dur="86400000" data-req="' + req.id + '">' + esc(t('dur.24h')) + '</button>' +
        '<button class="duration" data-dur="604800000" data-req="' + req.id + '">' + esc(t('dur.7d')) + '</button></div>' +
        '<div class="row"><button class="button teal" data-grant="' + req.id + '" style="flex:1">' + icon('shieldCheck') + esc(t('req.sign')) + '</button>' +
        '<button class="button danger" data-deny="' + req.id + '" style="flex:1">' + icon('x') + esc(t('req.deny')) + '</button></div></div>';
    }).join('');
    var answeredHtml = answered.map(function (req) {
      var r = record(req.recordId);
      var who = req.doctor === 'reader' ? name('reader') : name('blocked');
      return '<div class="record"><div class="record-icon ' + (req.status === 'granted' ? 'teal' : 'purple') + '">' + icon(req.status === 'granted' ? 'check' : 'x') + '</div>' +
        '<div class="record-info"><h3>' + esc(who) + ' — ' + esc(r ? t(r.titleK) : '') + '</h3>' +
        '<p>' + esc(req.status === 'granted' ? t('req.signedExp', fmtTime(req.expiresAt)) : t('req.deniedByYou')) + '</p></div>' +
        '<div class="record-actions"><span class="status ' + (req.status === 'granted' ? 'active' : 'denied') + '">' + esc(t(req.status === 'granted' ? 'st.granted' : 'st.denied')) + '</span></div></div>';
    }).join('');
    return '<div class="heading"><div><h1>' + esc(t('req.title')) + '</h1><p>' + esc(t('req.sub')) + '</p></div></div>' +
      (pendingHtml || '<div class="empty">' + icon('inbox') + '<h3>' + esc(t('req.empty.t')) + '</h3><p>' + esc(t('req.empty.p')) + '</p></div>') +
      (answeredHtml ? '<div class="section-head" style="margin-top:24px"><h2>' + esc(t('req.resolved')) + '</h2></div>' + answeredHtml : '');
  }

  function patientTimelineView() {
    var items = state.log.map(function (e) {
      var a = resolveArgs(e.whatA);
      return '<div class="timeline-item"><div class="timeline-icon">' + icon(e.event === 'AccessLogged' ? 'eye' : e.event === 'AccessGranted' ? 'shieldCheck' : e.event === 'AccessDenied' ? 'x' : 'file') + '</div>' +
        '<div class="timeline-content"><h3>' + esc(name(e.whoR)) + '</h3><p>' + esc(t(e.whatK, a[0], a[1], a[2])) + '</p><time>' + fmtDate(e.when) + ' · ' + fmtTime(e.when) + '</time>' +
        (e.tx ? '<a class="text-button row" style="gap:4px;display:inline-flex" href="' + solscan(e.tx) + '" target="_blank" rel="noopener">' + esc(t('tl.viewtx')) + ' ' + icon('external') + '</a>' : '') +
        '</div></div>';
    }).join('');
    return '<div class="heading"><div><h1>' + esc(t('tl.title')) + '</h1><p>' + esc(t('tl.sub')) + '</p></div></div>' +
      '<div class="card"><div class="timeline">' + (items || '<p class="muted" style="font-size:12px">' + esc(t('tl.empty')) + '</p>') + '</div></div>' +
      '<p class="security-strip">' + icon('lock') + esc(t('tl.strip')) + '</p>';
  }

  /* ================= ISSUER ================= */
  var SAMPLE_DOCS = [
    { id: 'doc1', titleK: 'docData.eco', kindK: 'docKind.pdf', detailK: 'docDetail.eco' },
    { id: 'doc2', titleK: 'docData.lipids', kindK: 'docKind.res', detailK: 'docDetail.lipids' }
  ];

  function issuerView() {
    var s = state.issuerStep, html = '';
    html += '<div class="heading"><div><h1>' + esc(t('iss.title')) + '</h1><p>' + esc(t('iss.sub')) + '</p></div></div>';

    if (s === 0) {
      html += '<div class="card"><div class="scan-box">' + icon('scan') + '<h3>' + esc(t('iss.scanT')) + '</h3><p>' + esc(t('iss.scanP')) + '</p>' +
        '<button class="button teal" id="scanBtn">' + icon('qr') + esc(t('iss.scanBtn')) + '</button></div></div>';
    } else if (s === 1) {
      html += '<div class="card"><h3>' + esc(t('iss.found')) + '</h3>' +
        '<div class="patient-match" style="margin:15px 0"><div class="avatar">AG</div><div><strong style="font-size:13px">' + esc(name('patient')) + '</strong><p>' + esc(t('iss.foundMeta', short(WALLETS.patient))) + '</p></div><span class="verified" style="margin-left:auto">' + icon('shieldCheck') + esc(t('validFor', fmtRemaining(state.codeExpires - Date.now()))) + '</span></div>' +
        '<h3 style="margin-top:20px">' + esc(t('iss.pick')) + '</h3>' +
        SAMPLE_DOCS.map(function (d) {
          return '<button class="sample-choice' + (state.chosenDoc === d.id ? ' chosen' : '') + '" data-doc="' + d.id + '">' + icon('file') + '<span><strong>' + esc(t(d.titleK)) + '</strong><small>' + esc(t(d.detailK)) + '</small></span><span class="muted" style="margin-left:auto;font-size:11px">' + esc(state.chosenDoc === d.id ? t('iss.chosen') : t('iss.choose')) + '</span></button>';
        }).join('') +
        '<button class="button teal full" id="startIssue" ' + (state.chosenDoc ? '' : 'disabled') + '>' + icon('lock') + esc(t('iss.emit')) + '</button></div>';
    } else if (s === 2 || s === 3) {
      var st = state.processing || { step: 0 };
      var docTitleK = SAMPLE_DOCS.find(function (d) { return d.id === state.chosenDoc; }).titleK;
      html += '<div class="card"><h3>' + esc(t(docTitleK)) + '</h3><p class="muted" style="font-size:11px;margin-top:5px">' + esc(t('iss.forPatient', CLINICS.north)) + '</p>' +
        '<div class="processing">' +
        procStep(0, st.step, t('proc.enc'), t('proc.encSub')) +
        procStep(1, st.step, t('proc.hash'), st.hash ? t('proc.hashVal', st.hash.slice(0, 32) + '…') : t('proc.hashSub')) +
        procStep(2, st.step, t('proc.sign'), t('proc.signSub')) +
        procStep(3, st.step, t('proc.done'), t('proc.doneSub')) +
        '</div>' +
        (s === 3 ? '<div class="notice success" style="margin-top:16px">' + icon('check') + '<span>' + t('iss.doneMsg') + '</span></div>' +
          '<button class="button full" style="margin-top:14px" id="issueDone">' + esc(t('iss.another')) + '</button>' : '') +
        '</div>';
    }
    return html;
  }
  function procStep(i, cur, title, sub) {
    var cls = i < cur ? 'complete' : i === cur ? 'current' : '';
    var ic = i < cur ? icon('check') : i === cur ? '<span class="spinner"></span>' : '<span style="width:16px;height:16px;border-radius:50%;border:2px solid var(--line);display:inline-block;flex-shrink:0"></span>';
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
      id: 'r' + Date.now(), titleK: doc.titleK, kindK: doc.id === 'doc1' ? 'kind.rep' : 'kind.lab',
      clinic: 'north', issuer: 'issuer', status: 'ACTIVE',
      hash: state.processing.hash, tx: tx, issuedAt: Date.now(), isNew: true
    };
    state.records.unshift(r);
    pushLog('issuer', 'log.issuedSig', [r.titleK], tx, 'RecordIssued');
    pushChain('Record', tx, 'cn.recordNew', [r.hash.slice(0, 16), short(WALLETS.issuer)], 'RecordIssued');
    notify('notif.newRec', r.titleK);
    state.issuerStep = 3;
    render();
  }

  /* ================= READER / BLOCKED ================= */
  function codeInputView(doctor) {
    var mp = doctor === 'reader' ? 'MP 67890 · ' + CLINICS.sanjose : 'MP 11223 · ' + t('org.blocked');
    var myReqs = state.requests.filter(function (r) { return r.doctor === doctor; });
    var list = myReqs.map(function (req) {
      var r = record(req.recordId);
      var st = req.status;
      var statusEl = st === 'granted'
        ? (req.expiresAt > Date.now()
          ? '<span class="status active">' + esc(t('st.live')) + ' · ' + fmtRemaining(req.expiresAt - Date.now()) + '</span>'
          : '<span class="status expired">' + esc(t('st.expired')) + '</span>')
        : st === 'denied' ? '<span class="status denied">' + esc(t('st.denied')) + '</span>' : '<span class="status disputed">' + esc(t('st.waiting')) + '</span>';
      return '<div class="record"><div class="record-icon">' + icon('file') + '</div>' +
        '<div class="record-info"><h3>' + esc(r ? t(r.titleK) : '') + '</h3><p>' + esc(CLINICS[r.clinic]) + ' · ' + esc(t('byIssuer')) + ' ' + esc(name(r.issuer)) + '</p></div>' +
        '<div class="record-actions">' + statusEl +
        (st === 'granted' && doctor === 'reader' ? '<button class="text-button" data-navto="viewer">' + esc(t('rd.openViewer')) + '</button>' : '') +
        (st === 'denied' ? '<span style="font-size:10px;color:#b9475c">' + esc(t('rd.deniedNote')) + '</span>' : '') +
        '</div></div>';
    }).join('');
    return '<div class="heading"><div><h1>' + esc(t('rd.title')) + '</h1><p>' + esc(t('rd.sub', mp)) + '</p></div></div>' +
      '<div class="card" style="margin-bottom:20px"><label class="form-label" style="margin-top:0" for="codeInput">' + esc(t('rd.code')) + '</label>' +
      '<div class="row"><input id="codeInput" value="' + state.shortCode + '" maxlength="6" style="letter-spacing:5px;font-weight:600" aria-label="' + esc(t('rd.code')) + '">' +
      '<button class="button secondary" id="pasteCode" style="white-space:nowrap">' + esc(t('rd.useAna')) + '</button></div>' +
      '<p class="muted" style="font-size:11px;margin-top:10px">' + esc(t('rd.codeNote')) + '</p>' +
      '<button class="button teal full" style="margin-top:16px" id="findPatient">' + icon('qr') + esc(t('rd.find')) + '</button></div>' +
      (state.foundPatient ? patientStudiesList(doctor) : '') +
      (myReqs.length ? '<div class="section-head"><h2>' + esc(t('rd.mine')) + '</h2></div>' + list : '');
  }
  function patientStudiesList(doctor) {
    var actives = state.records.filter(function (r) { return r.status === 'ACTIVE'; });
    return '<div class="card"><div class="patient-match"><div class="avatar">AG</div><div><strong style="font-size:13px">' + esc(name('patient')) + '</strong><p>' + esc(t('rd.found', state.records.length)) + '</p></div></div>' +
      '<h3 style="margin:18px 0 10px">' + esc(t('rd.askAccess')) + '</h3>' +
      actives.map(function (r) {
        var already = state.requests.find(function (q) { return q.doctor === doctor && q.recordId === r.id; });
        return '<div class="record"><div class="record-icon">' + icon('file') + '</div>' +
          '<div class="record-info"><h3>' + esc(t(r.titleK)) + '</h3><p>' + esc(CLINICS[r.clinic]) + '</p></div>' +
          '<div class="record-actions">' +
          (already
            ? '<span class="status ' + (already.status === 'granted' ? 'active' : already.status === 'denied' ? 'denied' : 'disputed') + '">' + esc(t(already.status === 'granted' ? 'st.granted' : already.status === 'denied' ? 'st.denied' : 'st.pending')) + '</span>'
            : '<button class="button secondary" data-request="' + r.id + '" data-doctor="' + doctor + '" style="font-size:11px;padding:9px 13px">' + icon('send') + esc(t('rd.requestBtn')) + '</button>') +
          '</div></div>';
      }).join('') + '</div>';
  }

  function viewerView() {
    var req = state.requests.find(function (r) { return r.doctor === 'reader' && r.status === 'granted'; });
    var v = state.viewer;
    var head = '<div class="heading"><div><h1>' + esc(t('vw.title')) + '</h1><p>' + esc(t('vw.sub')) + '</p></div></div>';
    if (!req) {
      return head + '<div class="empty">' + icon('eye') + '<h3>' + esc(t('vw.none.t')) + '</h3><p>' + esc(t('vw.none.p')) + '</p>' +
        '<button class="button teal" data-navto="request">' + esc(t('rd.requestBtn')) + '</button></div>';
    }
    var r = record(req.recordId);
    var remaining = req.expiresAt - Date.now();
    var expired = remaining <= 0;

    var body = '<div class="viewer-top"><div><h2>' + esc(t(r.titleK)) + '</h2><span class="origin" style="display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--muted)">' + icon('building') + esc(t('issuedBy')) + ' ' + esc(CLINICS[r.clinic]) + '</span></div>' +
      (expired ? '<span class="status expired">' + esc(t('st.expiredPill')) + '</span>' : '<span class="timer-pill">' + icon('clock') + esc(t('vw.left', fmtRemaining(remaining))) + '</span>') + '</div>';

    if (v.stage === 'idle') {
      body += '<div class="card" style="text-align:center;padding:40px 20px"><div class="scan-box" style="border-style:solid">' + icon('key') +
        '<h3>' + esc(t('vw.keyT')) + '</h3><p>' + esc(t('vw.keyP')) + '</p>' +
        '<button class="button teal" id="requestKey">' + icon('key') + esc(t('vw.keyBtn')) + '</button></div>' +
        (expired ? '<div class="notice error" style="margin-top:14px;text-align:left">' + icon('alert') + '<span>' + esc(t('vw.expiredNotice')) + '</span></div>' : '') +
        demoTools(v, req) + '</div>';
    } else if (v.stage === 'processing') {
      body += '<div class="card"><div class="processing">' +
        procStep(0, v.step, t('vw.p1'), t('vw.p1sub', name('reader'), t(r.titleK))) +
        procStep(1, v.step, t('vw.p2'), t('vw.p2sub')) +
        procStep(2, v.step, t('vw.p3'), t('vw.p3sub')) +
        '</div></div>';
    } else if (v.stage === 'deniedExpired') {
      body += '<div class="card"><div class="integrity-block">' + icon('alert') + '<h2>' + esc(t('vw.expT')) + '</h2>' +
        '<p>' + t('vw.expP') + '</p></div></div>';
    } else if (v.stage === 'document') {
      if (v.tampered) {
        body += '<div class="card"><div class="integrity-block">' + icon('alert') + '<h2>' + esc(t('vw.altT')) + '</h2>' +
          '<p>' + t('vw.altP') + '</p></div>' +
          '<div class="hash-box"><strong>' + esc(t('hash.onchain')) + '</strong>' + r.hash + '<br><strong>' + esc(t('hash.calc')) + '</strong>' + hash64() + '</div>' + demoTools(v, req) + '</div>';
      } else {
        body += documentHtml(r, req) + demoTools(v, req);
      }
    }
    return head + body;
  }

  function demoTools(v, req) {
    return '<details class="demo-tools"><summary>' + esc(t('tools')) + '</summary><div class="row">' +
      (v.stage === 'document' ? '<label class="check-label"><input type="checkbox" id="tamperToggle" ' + (v.tampered ? 'checked' : '') + '> ' + esc(t('tools.tamper')) + '</label>' : '') +
      '<button class="text-button" id="skipTime">' + icon('clock') + ' ' + esc(t('tools.time')) + '</button>' +
      '</div></details>';
  }

  function documentHtml(r, req) {
    var wm = [];
    for (var i = 0; i < 6; i++) wm.push('<span>' + esc(name('reader')) + ' · MP 67890 · ' + fmtDate(Date.now()) + '</span>');
    var date = fmtDate(r.issuedAt);
    return '<div class="card">' +
      '<div class="document"><div style="padding:26px 26px 40px;font-size:12px;line-height:1.9;position:relative;z-index:1;background:#fff">' +
      '<div class="row between" style="border-bottom:2px solid var(--navy);padding-bottom:12px;margin-bottom:16px"><div><b style="color:var(--navy);font-size:15px">' + esc(t(r.titleK).toUpperCase()) + '</b><br><small class="muted">' + esc(CLINICS[r.clinic]) + ' · ' + date + '</small></div><div style="text-align:right"><small class="muted">' + esc(t('doc.patient')) + '</small><br><b>' + esc(name('patient')) + '</b></div></div>' +
      '<p><b>' + esc(t('doc.info')) + '</b> ' + esc(t('doc.body1', CLINICS[r.clinic])) + '</p>' +
      '<p><b>' + esc(t('doc.concl')) + '</b> ' + esc(t('doc.body2')) + '</p>' +
      '<p style="margin-top:22px"><b>' + esc(name('issuer')) + '</b><br><small class="muted">MP 12345 · ' + esc(t('spec.cardio')) + ' · ' + esc(t('doc.signed')) + '</small></p>' +
      '<div class="watermarks">' + wm.join('') + '</div>' +
      '</div><div class="document-footer">' + esc(t('doc.footer')) + '</div></div>' +
      '<div class="issuer-details">' +
      '<div><dt>' + esc(t('iss.det.emitter')) + '</dt><dd><b>' + esc(name('issuer')) + '</b> · MP 12345</dd></div>' +
      '<div><dt>' + esc(t('iss.det.spec')) + '</dt><dd>' + esc(t('spec.cardio')) + '</dd></div>' +
      '<div><dt>' + esc(t('iss.det.date')) + '</dt><dd>' + date + ' · ' + fmtTime(r.issuedAt) + '</dd></div>' +
      '<div><dt>' + esc(t('iss.det.tx')) + '</dt><dd><a href="' + solscan(r.tx) + '" target="_blank" rel="noopener">' + short(r.tx) + ' ' + icon('external') + '</a></dd></div>' +
      '<div><dt>content_hash</dt><dd class="mono" style="font-size:10px">' + r.hash.slice(0, 40) + '…</dd></div>' +
      '<div><dt>' + esc(t('iss.det.origin')) + '</dt><dd>' + esc(CLINICS[r.clinic]) + ' · ' + esc(t('iss.det.originV')) + '</dd></div>' +
      '</div>' +
      '<div class="notice success" style="margin-top:14px">' + icon('shieldCheck') + '<span>' + esc(t('vw.integrity')) + '</span></div></div>';
  }

  function runKeyRequest(req) {
    var v = state.viewer;
    if (req.expiresAt <= Date.now()) { v.stage = 'deniedExpired'; render(); return; }
    v.stage = 'processing'; v.step = 0; render();
    setTimeout(function () { v.step = 1; render(); }, 1100);
    setTimeout(function () {
      var logTx = sig();
      pushLog('reader', 'log.accessed', [record(req.recordId).titleK], logTx, 'AccessLogged');
      pushChain('AccessLogged', logTx, 'cn.access', [short(WALLETS.reader), fmtTime(Date.now())], 'AccessLogged');
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
        openModal(t('md.notMine'), '<p>' + t('md.notMineBody', esc(t(r.titleK))) + '</p>',
          '<button class="button secondary" data-close>' + esc(t('cancel')) + '</button><button class="button danger" id="confirmDispute">' + esc(t('confirm')) + '</button>');
        document.getElementById('confirmDispute').addEventListener('click', function () {
          r.status = 'DISPUTED';
          var tx = sig();
          pushLog('patient', 'log.disputed', [r.titleK], tx, 'RecordDisputed');
          pushChain('Record', tx, 'cn.disputed', [], 'RecordDisputed');
          document.getElementById('modal').close();
          render();
          toast(t('toast.disputed'));
        });
      });
    });
    app.querySelectorAll('[data-grant]').forEach(function (b) {
      b.addEventListener('click', function () {
        var req = requestFor(b.getAttribute('data-grant'));
        var dur = parseInt(app.querySelector('.duration.selected[data-req="' + req.id + '"]').getAttribute('data-dur'), 10);
        var r = record(req.recordId);
        var whoName = req.doctor === 'reader' ? name('reader') : name('blocked');
        openModal(t('md.grant'), '<p>' + t('md.grantBody', esc(whoName), esc(t(r.titleK))) + '</p><pre>grant_access(\n  record: ' + r.id + '_pda,\n  reader: ' + short(WALLETS[req.doctor]) + ',\n  expires_in: ' + Math.round(dur / 60000) + ' min\n)</pre><p class="muted" style="font-size:11px">' + esc(t('md.grantNote')) + '</p>',
          '<button class="button secondary" data-close>' + esc(t('cancel')) + '</button><button class="button teal" id="signGrant">' + icon('shieldCheck') + esc(t('md.signWallet')) + '</button>');
        document.getElementById('signGrant').addEventListener('click', function () {
          req.status = 'granted'; req.expiresAt = Date.now() + dur; req.tx = sig();
          pushLog('patient', 'log.granted', [fmtRemaining(dur), r.titleK, whoName], req.tx, 'AccessGranted');
          pushChain('AccessGrant', req.tx, 'cn.grant', [short(WALLETS[req.doctor]), fmtTime(req.expiresAt)], 'AccessGranted');
          notify('notif.canRead', whoName, r.titleK);
          document.getElementById('modal').close();
          render();
          toast(t('toast.granted', fmtRemaining(dur)));
        });
      });
    });
    app.querySelectorAll('[data-deny]').forEach(function (b) {
      b.addEventListener('click', function () {
        var req = requestFor(b.getAttribute('data-deny'));
        req.status = 'denied';
        var r = record(req.recordId);
        pushLog('patient', 'log.denied', [name(req.doctor), r.titleK], null, 'AccessDenied');
        render();
        toast(t('toast.denied'));
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
      state.issuerStep = 1; render();
      toast(t('toast.scan'));
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
        toast(t('toast.badCode'));
        return;
      }
      state.foundPatient = true; render();
      toast(t('toast.found'));
    });
    var paste = document.getElementById('pasteCode');
    if (paste) paste.addEventListener('click', function () { document.getElementById('codeInput').value = state.shortCode; });

    app.querySelectorAll('[data-request]').forEach(function (b) {
      b.addEventListener('click', function () {
        var doctor = b.getAttribute('data-doctor');
        var recId = b.getAttribute('data-request');
        state.requests.push({ id: 'q' + Date.now() + doctor, doctor: doctor, recordId: recId, status: 'pending', expiresAt: null, tx: null });
        render();
        toast(t('toast.reqSent'));
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
        if (state.viewer.stage === 'processing' || state.viewer.stage === 'document') state.viewer.stage = 'idle';
        render();
        toast(t('toast.time'));
      }
    });
    var tamper = document.getElementById('tamperToggle');
    if (tamper) tamper.addEventListener('change', function () {
      state.viewer.tampered = tamper.checked; render();
      toast(tamper.checked ? t('toast.tamperOn') : t('toast.tamperOff'));
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

  document.documentElement.lang = state.lang;
  var sk = document.getElementById('skipLink');
  if (sk) sk.textContent = t('skip');
  render();
})();
