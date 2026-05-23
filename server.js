/**
 * Sr Lakes — Stage Sync
 * Backend: Express + Socket.IO + persistência em JSON + QR code + mDNS
 *
 * Roda no notebook do líder. Celulares conectam via http://<IP>:7474
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');

const PORT = process.env.PORT || 7474;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const SONGS_FILE = path.join(DATA_DIR, 'songs.json');
const SETLISTS_FILE = path.join(DATA_DIR, 'setlists.json');

// ============================================================
// Utilities
// ============================================================
function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }
function readJson(file, fallback = []) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}
function localIPs() {
  const list = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) list.push({ iface: name, ip: net.address });
    }
  }
  return list;
}
function primaryIP() { return localIPs()[0]?.ip || 'localhost'; }

// ============================================================
// Bootstrap data (apenas se ainda não existir)
// ============================================================
const DEFAULT_SONGS = [
  { id:1, num:'01', title:'Ao Som da Chuva', artist:'Sr Lakes', key:'D', bpm:96, sig:'4/4', duration:'03:42',
    parts:[
      {type:'intro', chords:['D','A','Bm','G'], reps:2, bars:4, lyrics:'', note:'Entrada limpa, só violão'},
      {type:'verso', chords:['D','A','Bm','G'], reps:1, bars:8, lyrics:'A chuva caiu naquela noite\nE eu pensei em você outra vez', note:''},
      {type:'refrao', chords:['G','D','A','Bm'], reps:2, bars:8, lyrics:'Volta pra mim, volta pra mim\nNo som da chuva, no fim do mundo', note:''},
      {type:'verso', chords:['D','A','Bm','G'], reps:1, bars:8, lyrics:'O tempo passou e ficou\nA marca dos dias bons', note:''},
      {type:'refrao2', chords:['G','D','A','Bm'], reps:2, bars:8, lyrics:'Volta pra mim, volta pra mim', note:''},
      {type:'final', chords:['D','A','Bm','G'], reps:2, bars:4, lyrics:'', note:'Final em fade out'},
    ]},
  { id:2, num:'02', title:'Estrada de Terra', artist:'Sr Lakes', key:'G', bpm:112, sig:'4/4', duration:'04:05',
    parts:[
      {type:'intro', chords:['G','Em','C','D'], reps:2, bars:4, lyrics:'', note:'Bateria entra no 2º compasso'},
      {type:'verso', chords:['G','Em','C','D'], reps:1, bars:8, lyrics:'Pego a estrada de manhã cedo\nA poeira voa atrás', note:''},
      {type:'refrao', chords:['C','G','D','Em'], reps:2, bars:8, lyrics:'Estrada de terra, coração\nMe leva pra onde a gente é livre', note:''},
      {type:'solo', chords:['G','Em','C','D'], reps:1, bars:16, lyrics:'', note:'Solo de slide guitar — Tom de Sol maior'},
      {type:'refrao2', chords:['C','G','D','Em'], reps:3, bars:8, lyrics:'Estrada de terra, coração', note:''},
    ]},
  { id:3, num:'03', title:'Última Cerveja', artist:'Sr Lakes', key:'A', bpm:140, sig:'4/4', duration:'03:18',
    parts:[
      {type:'intro', chords:['A','D','E','A'], reps:2, bars:4, lyrics:'', note:''},
      {type:'verso', chords:['A','D','E','A'], reps:1, bars:8, lyrics:'A última cerveja do bar\nNa mesa que era nossa', note:''},
      {type:'refrao', chords:['D','A','E','F#m'], reps:2, bars:8, lyrics:'E eu fico aqui\nEsperando o sol nascer', note:''},
      {type:'ponte', chords:['F#m','D','A','E'], reps:1, bars:4, lyrics:'Mas tudo bem', note:''},
      {type:'final', chords:['A','D','E','A'], reps:4, bars:2, lyrics:'', note:'Final rápido'},
    ]},
  { id:4, num:'04', title:'Mundo Dá Voltas', artist:'Sr Lakes', key:'E', bpm:128, sig:'4/4', duration:'04:12',
    parts:[
      {type:'intro', chords:['Bm','G5','D','A'], reps:4, bars:2, lyrics:'', note:'Intro instrumental · Entrada da banda'},
      {type:'verso', chords:['Bm','G5','D','A'], reps:1, bars:8, lyrics:'Ela dormiu no calor dos meus braços\nE eu acordei sem saber se era um sonho', note:''},
      {type:'refrao', chords:['Bm','G5','D','A'], reps:1, bars:8, lyrics:'Naquele amor\nÀ sua maneira\nPerdendo o meu tempo\nA noite inteira', note:''},
      {type:'solo', chords:['Bm','G5','D','A'], reps:1, bars:8, lyrics:'', note:'Solo da guitarra · Baixo segura a base'},
      {type:'pausa', chords:['—'], reps:1, bars:1, lyrics:'', note:'Pausa total · Vocal entra solo'},
      {type:'volta', chords:['Bm','G5','D','A'], reps:1, bars:8, lyrics:'Há um tempo atrás pensei em te dizer\nQue o mundo dá voltas, dá voltas e vai', note:''},
      {type:'refrao2', chords:['Bm','G5','D','A'], reps:2, bars:8, lyrics:'Naquele amor\nÀ sua maneira', note:''},
      {type:'final', chords:['A','Bm','G5','D'], reps:4, bars:2, lyrics:'', note:'Repetir: A noite inteira'},
    ]},
  { id:5, num:'05', title:'Garagem 3am', artist:'Sr Lakes', key:'F#m', bpm:118, sig:'4/4', duration:'03:55',
    parts:[
      {type:'intro', chords:['F#m','D','A','E'], reps:2, bars:4, lyrics:'', note:''},
      {type:'verso', chords:['F#m','D','A','E'], reps:1, bars:8, lyrics:'Três da manhã na garagem\nE a banda ainda toca', note:''},
      {type:'refrao', chords:['A','E','F#m','D'], reps:2, bars:8, lyrics:'Sonhos que ninguém ouviu\nNo amplificador', note:''},
    ]},
  { id:6, num:'06', title:'Praia Vazia', artist:'Sr Lakes', key:'C', bpm:84, sig:'6/8', duration:'04:30',
    parts:[
      {type:'intro', chords:['C','Am','F','G'], reps:2, bars:4, lyrics:'', note:''},
      {type:'verso', chords:['C','Am','F','G'], reps:1, bars:8, lyrics:'A praia vazia em janeiro\nO céu de chumbo no inverno', note:''},
      {type:'refrao', chords:['F','C','G','Am'], reps:2, bars:8, lyrics:'E o mar, o mar, o mar\nÉ sempre o mesmo mar', note:''},
    ]},
  { id:7, num:'07', title:'Bar do Zé', artist:'Cover · Tradicional', key:'G', bpm:104, sig:'4/4', duration:'03:30',
    parts:[
      {type:'intro', chords:['G','C','D','G'], reps:2, bars:4, lyrics:'', note:''},
      {type:'verso', chords:['G','C','D','G'], reps:1, bars:8, lyrics:'No bar do Zé na esquina\nA banda toca toda noite', note:''},
      {type:'refrao', chords:['C','G','D','Em'], reps:2, bars:8, lyrics:'E o povo canta junto', note:''},
    ]},
  { id:8, num:'08', title:'Trovão de Verão', artist:'Sr Lakes', key:'E', bpm:152, sig:'4/4', duration:'02:58',
    parts:[
      {type:'intro', chords:['E','B','C#m','A'], reps:2, bars:4, lyrics:'', note:'Bateria contagem 4'},
      {type:'verso', chords:['E','B','C#m','A'], reps:1, bars:8, lyrics:'Cai o trovão, cai o trovão', note:''},
      {type:'refrao', chords:['A','E','B','C#m'], reps:2, bars:8, lyrics:'E a chuva vem rasgando o céu', note:''},
      {type:'solo', chords:['E','B','C#m','A'], reps:1, bars:8, lyrics:'', note:'Solo distorcido'},
      {type:'final', chords:['E','B','A','E'], reps:1, bars:4, lyrics:'', note:'Acabar em E'},
    ]},
];

const DEFAULT_SETLISTS = [
  { id:1, name:'Show — Bar Sessions', date:'2026-05-25', songs:[1,2,4,3,5,8], duration:'24:00', active:true },
  { id:2, name:'Ensaio — Quinta', date:'2026-05-22', songs:[4,2,5,6,7], duration:'19:30', active:false },
  { id:3, name:'Casamento Lucas & Ana', date:'2026-06-14', songs:[6,1,7,2], duration:'15:45', active:false },
  { id:4, name:'Acústico — Café Norte', date:'2026-06-28', songs:[1,6,3], duration:'12:15', active:false },
];

ensureDir(DATA_DIR);
if (!fs.existsSync(SONGS_FILE)) writeJson(SONGS_FILE, DEFAULT_SONGS);
if (!fs.existsSync(SETLISTS_FILE)) writeJson(SETLISTS_FILE, DEFAULT_SETLISTS);

// ============================================================
// Backup rotativo: mantém 5 últimas versões em data/backups/
// ============================================================
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
ensureDir(BACKUP_DIR);
function rotateBackup(file) {
  try {
    if (!fs.existsSync(file)) return;
    const base = path.basename(file, '.json');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const target = path.join(BACKUP_DIR, `${base}_${ts}.json`);
    fs.copyFileSync(file, target);
    // Mantém só os 5 mais recentes pra esse base
    const all = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith(base + '_'))
      .sort()
      .reverse();
    all.slice(5).forEach(f => fs.unlinkSync(path.join(BACKUP_DIR, f)));
  } catch (e) { console.warn('[backup]', e.message); }
}

// ============================================================
// Validação de payload (Songs/Setlists)
// ============================================================
function validateSong(s) {
  if (!s || typeof s !== 'object') return 'payload inválido';
  if (!s.title || typeof s.title !== 'string' || s.title.trim().length === 0) return 'título obrigatório';
  if (s.title.length > 200) return 'título muito longo';
  if (s.bpm != null && (typeof s.bpm !== 'number' || s.bpm < 20 || s.bpm > 300)) return 'BPM fora de 20-300';
  if (s.parts != null && !Array.isArray(s.parts)) return 'parts deve ser array';
  if (s.parts && s.parts.length > 100) return 'muitas partes (max 100)';
  if (JSON.stringify(s).length > 5 * 1024 * 1024) return 'payload muito grande (>5MB)';
  return null;
}
function validateSetlist(s) {
  if (!s || typeof s !== 'object') return 'payload inválido';
  if (!s.name || typeof s.name !== 'string') return 'name obrigatório';
  if (s.name.length > 200) return 'name muito longo';
  if (s.songs != null && !Array.isArray(s.songs)) return 'songs deve ser array';
  return null;
}

// ============================================================
// Senha da sala (4 dígitos, em memória, opcional)
// ============================================================
let roomPassword = null;
function passwordRequired(req) {
  if (!roomPassword) return false;
  const provided = req.headers['x-room-password'] || req.query.pwd;
  return provided !== roomPassword;
}

// ============================================================
// Estado da sala (in-memory, broadcast pra todos os clientes)
// ============================================================
let liveState = {
  songId: 4, partIdx: 0, beat: 1, rep: 1, bar: 1,
  playing: false, elapsedSec: 0, bpm: 128, ts: Date.now()
};
const clients = new Map(); // socketId -> { name, mode, joinedAt }

// ============================================================
// Express
// ============================================================
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' }, maxHttpBufferSize: 10 * 1024 * 1024 });

app.use(express.json({ limit: '10mb' }));

// Cache control: HTML não, assets sim
app.use((req, res, next) => {
  if (req.url.endsWith('.html') || req.url === '/') {
    res.set('Cache-Control', 'no-cache');
  }
  next();
});

// Static files
app.use(express.static(ROOT, { extensions: ['html'] }));

// ============ REST API ============
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.get('/api/info', (req, res) => res.json({
  ip: primaryIP(),
  port: PORT,
  url: `http://${primaryIP()}:${PORT}`,
  ips: localIPs(),
  clients: clients.size,
  passwordEnabled: !!roomPassword,
}));

// Senha da sala
app.post('/api/room/password', (req, res) => {
  const { password } = req.body || {};
  if (password === '' || password == null) { roomPassword = null; return res.json({ enabled: false }); }
  if (!/^\d{4}$/.test(String(password))) return res.status(400).json({ error: 'senha deve ter 4 dígitos' });
  roomPassword = String(password);
  io.emit('room:password-changed', { enabled: true });
  res.json({ enabled: true });
});
app.post('/api/room/check', (req, res) => {
  if (!roomPassword) return res.json({ ok: true });
  const { password } = req.body || {};
  if (String(password) === roomPassword) return res.json({ ok: true });
  res.status(401).json({ ok: false });
});

// Songs
app.get('/api/songs', (req, res) => res.json(readJson(SONGS_FILE)));
app.post('/api/songs', (req, res) => {
  const err = validateSong(req.body);
  if (err) return res.status(400).json({ error: err });
  const songs = readJson(SONGS_FILE);
  const id = (Math.max(0, ...songs.map(s => s.id || 0)) || 0) + 1;
  const song = { ...req.body, id, num: String(id).padStart(2, '0') };
  rotateBackup(SONGS_FILE);
  songs.push(song);
  writeJson(SONGS_FILE, songs);
  io.emit('songs:changed', songs);
  res.json(song);
});
app.put('/api/songs/:id', (req, res) => {
  const err = validateSong(req.body);
  if (err) return res.status(400).json({ error: err });
  const id = +req.params.id;
  const songs = readJson(SONGS_FILE);
  const i = songs.findIndex(s => s.id === id);
  if (i < 0) return res.status(404).json({ error: 'not found' });
  rotateBackup(SONGS_FILE);
  songs[i] = { ...songs[i], ...req.body, id };
  writeJson(SONGS_FILE, songs);
  io.emit('songs:changed', songs);
  res.json(songs[i]);
});
app.delete('/api/songs/:id', (req, res) => {
  const id = +req.params.id;
  rotateBackup(SONGS_FILE);
  const songs = readJson(SONGS_FILE).filter(s => s.id !== id);
  writeJson(SONGS_FILE, songs);
  io.emit('songs:changed', songs);
  res.json({ ok: true });
});

// Setlists
app.get('/api/setlists', (req, res) => res.json(readJson(SETLISTS_FILE)));
app.post('/api/setlists', (req, res) => {
  const err = validateSetlist(req.body);
  if (err) return res.status(400).json({ error: err });
  const sets = readJson(SETLISTS_FILE);
  const id = (Math.max(0, ...sets.map(s => s.id || 0)) || 0) + 1;
  const set = { ...req.body, id };
  rotateBackup(SETLISTS_FILE);
  sets.push(set);
  writeJson(SETLISTS_FILE, sets);
  io.emit('setlists:changed', sets);
  res.json(set);
});
app.put('/api/setlists/:id', (req, res) => {
  const err = validateSetlist(req.body);
  if (err) return res.status(400).json({ error: err });
  const id = +req.params.id;
  const sets = readJson(SETLISTS_FILE);
  const i = sets.findIndex(s => s.id === id);
  if (i < 0) return res.status(404).json({ error: 'not found' });
  rotateBackup(SETLISTS_FILE);
  sets[i] = { ...sets[i], ...req.body, id };
  writeJson(SETLISTS_FILE, sets);
  io.emit('setlists:changed', sets);
  res.json(sets[i]);
});
app.delete('/api/setlists/:id', (req, res) => {
  const id = +req.params.id;
  rotateBackup(SETLISTS_FILE);
  const sets = readJson(SETLISTS_FILE).filter(s => s.id !== id);
  writeJson(SETLISTS_FILE, sets);
  io.emit('setlists:changed', sets);
  res.json({ ok: true });
});

// QR Code (SVG) apontando pro IP local + porta
app.get('/api/qr', async (req, res) => {
  const target = req.query.url || `http://${primaryIP()}:${PORT}`;
  try {
    const svg = await QRCode.toString(target, {
      type: 'svg', margin: 1, color: { dark: '#04060b', light: '#ffffff' }, errorCorrectionLevel: 'M'
    });
    res.type('image/svg+xml').send(svg);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// ============================================================
// Socket.IO — sincronização em tempo real
// ============================================================
io.on('connection', socket => {
  clients.set(socket.id, { name: 'Músico', mode: 'rx', joinedAt: Date.now() });

  // Snapshot pra quem acabou de entrar
  socket.emit('snapshot', {
    state: liveState,
    clients: Array.from(clients.values()),
    serverTime: Date.now(),
  });

  // Broadcast contagem atualizada pra todos
  io.emit('clients:count', clients.size);
  io.emit('clients:list', Array.from(clients.values()));

  // Identificação
  socket.on('identify', data => {
    const c = clients.get(socket.id);
    if (c) Object.assign(c, data);
    io.emit('clients:list', Array.from(clients.values()));
  });

  // Transmissor atualiza estado → broadcast pros receptores
  socket.on('state', s => {
    liveState = { ...liveState, ...s, ts: Date.now() };
    socket.broadcast.emit('state', liveState);
  });

  // Sync de tempo (cliente envia seu timestamp, servidor responde com o dele → calcula offset/RTT)
  socket.on('time:ping', clientTs => {
    socket.emit('time:pong', { clientTs, serverTs: Date.now() });
  });

  // Beat tick centralizado (opcional — futuro: servidor envia "tic" pra sincronia perfeita)
  socket.on('beat:tick', data => {
    socket.broadcast.emit('beat:tick', { ...data, ts: Date.now() });
  });

  socket.on('disconnect', () => {
    clients.delete(socket.id);
    io.emit('clients:count', clients.size);
    io.emit('clients:list', Array.from(clients.values()));
  });
});

// ============================================================
// mDNS / Bonjour — opcional, falha silencioso
// ============================================================
try {
  const { Bonjour } = require('bonjour-service');
  const bonjour = new Bonjour();
  bonjour.publish({ name: 'Sr Lakes Stage Sync', type: 'http', port: PORT, txt: { path: '/' } });
  console.log('[mDNS] Publicado como srlakes-stage-sync.local');
} catch (e) {
  console.log('[mDNS] Pulando (', e.message, ')');
}

// ============================================================
// Start
// ============================================================
server.listen(PORT, '0.0.0.0', () => {
  const ip = primaryIP();
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   SR LAKES — STAGE SYNC                    ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║   Local:   http://localhost:${PORT}            ║`);
  console.log(`║   LAN:     http://${ip}:${PORT}${' '.repeat(Math.max(0, 16 - ip.length))}║`);
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log('Celulares conectam escaneando o QR ou digitando o IP da LAN.');
  console.log('Ctrl+C pra encerrar.');
});

module.exports = { app, server, io };
