// ============================================================
//  CEL TRENCAT — servidor multijugador (Node.js + Socket.IO)
//  Desplegable gratis a Render: `npm install` i `npm start`
// ============================================================
import express from 'express';
import compression from 'compression';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { Sim } from './public/js/sim.js';
import { MAX_PLAYERS, MODES, GAME_VERSION } from './public/js/data.js';
import { levelOk } from './public/js/parkour.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const TICK = 1 / 20;
const DATA_DIR = path.join(__dirname, 'data');
const SAVE_FILE = path.join(DATA_DIR, 'saves.json');

const app = express();
app.use(compression());
// el codi del joc (html i js) es revalida sempre, perquè en actualitzar el joc tothom tingui la versió nova
app.use('/assets', express.static(path.join(__dirname, 'public/assets'), { maxAge: '1h' }));
app.use('/vendor', express.static(path.join(__dirname, 'public/vendor'), { maxAge: '7d' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0, setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache') }));
app.get('/health', (_req, res) => res.json({ ok: true, version: GAME_VERSION, rooms: rooms.size, players: [...rooms.values()].reduce((a, r) => a + r.members.size, 0) }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' }, pingInterval: 10000, pingTimeout: 20000 });

// ---------------- partides guardades al servidor ----------------
let saves = {};
try { fs.mkdirSync(DATA_DIR, { recursive: true }); saves = JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8')); } catch { saves = {}; }
let savesDirty = false;
setInterval(() => {
  if (!savesDirty) return;
  savesDirty = false;
  fs.writeFile(SAVE_FILE, JSON.stringify(saves), () => {});
}, 20000);

// ---------------- sales ----------------
const rooms = new Map();
const CODE_CHARS = '0123456789';
function newCode() {
  let c;
  do { c = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join(''); } while (rooms.has(c));
  return c;
}
// Una sala és un grup d'amics amb un líder. El líder tria el mode i comença la partida;
// en acabar, tothom torna a la sala i es pot triar un altre mode.
// Les sales són privades: només s'hi entra amb el codi de 4 números.
function createRoom({ mode = 'coop', name = '', max = MAX_PLAYERS }) {
  const code = newCode();
  const room = { code, mode: MODES[mode] && MODES[mode].multi ? mode : 'coop', name: String(name).slice(0, 24) || `Sala ${code}`,
    level: 1, max: Math.max(2, Math.min(MAX_PLAYERS, max | 0 || MAX_PLAYERS)), members: new Map(), leader: null, state: 'lobby', sim: null,
    sockets: new Map(), queues: new Map(), broadcast: [], tickN: 0, emptySince: Date.now() };
  room.timer = setInterval(() => tickRoom(room), TICK * 1000);
  rooms.set(code, room);
  console.log(`[sala] creada ${code}`);
  return room;
}

function roomState(room) {
  return { code: room.code, mode: room.mode, level: room.level, leader: room.leader, state: room.state, max: room.max,
    members: [...room.members.values()].map((m) => ({ id: m.id, name: m.name, cls: m.cls, hero: m.hero, level: m.level, inGame: room.sockets.has(m.id) })) };
}
function sendRoom(room) { const st = roomState(room); for (const m of room.members.values()) m.socket.emit('room', st); }

function startSim(room) {
  room.sim = new Sim({ mode: room.mode, seed: Math.floor(Math.random() * 1e9), expect: room.members.size, level: room.level, onEvent: (type, data, to) => routeEvent(room, type, data, to) });
  room.state = 'playing';
  room.broadcast = []; room.queues = new Map(); room.sockets = new Map();
  console.log(`[sala] ${room.code}: comença ${room.mode}`);
}
function flushRoom(room) {
  for (const [id, socket] of room.sockets) {
    const q = room.queues.get(id) || [];
    const evs = room.broadcast.length ? room.broadcast.concat(q) : q;
    if (evs.length) socket.emit('ev', evs);
    room.queues.set(id, []);
  }
  room.broadcast = [];
}
// treu un jugador de la partida (però no de la sala)
function leaveGame(room, id) {
  if (!room.sim || !room.sockets.has(id)) return;
  try { room.sim.flushSaves(true); } catch { /* res */ }
  flushRoom(room);
  room.sim.removePlayer(id);
  room.sockets.delete(id); room.queues.delete(id);
  if (room.sockets.size === 0) endGame(room);
}
// acaba la partida per a tothom i torna a la sala
function endGame(room) {
  if (room.sim) { try { room.sim.flushSaves(true); } catch { /* res */ } flushRoom(room); }
  for (const socket of room.sockets.values()) socket.emit('roomLobby', {});
  room.sim = null; room.state = 'lobby'; room.sockets = new Map(); room.queues = new Map(); room.broadcast = [];
  console.log(`[sala] ${room.code}: torna a la sala`);
  sendRoom(room);
}

function routeEvent(room, type, data, to) {
  if (type === 'save' && to) {
    const s = room.sockets.get(to);
    if (s && s.data.token) { saves[s.data.token] = { save: data, at: Date.now() }; savesDirty = true; }
    const m = room.members.get(to); if (m && m.level !== data.level) { m.level = data.level; sendRoom(room); }
  }
  if (to) { const q = room.queues.get(to); if (q) q.push([type, data]); }
  else room.broadcast.push([type, data]);
}

function tickRoom(room) {
  if (room.sim) {
    try { room.sim.tick(TICK); } catch (e) { console.error('[sim]', e); }
    room.tickN++;
    const sendSnap = room.tickN % 2 === 0;
    flushRoom(room);
    if (sendSnap) for (const [id, socket] of room.sockets) socket.volatile.emit('snap', room.sim.snapshot(id));
  }
  if (room.members.size === 0 && Date.now() - room.emptySince > 60000) {
    clearInterval(room.timer); rooms.delete(room.code);
    console.log(`[sala] tancada ${room.code}`);
  }
}

io.on('connection', (socket) => {
  socket.data.room = null;
  socket.on('hello', (_m, cb) => { if (typeof cb === 'function') cb({ version: GAME_VERSION }); });

  // comprovar un codi abans de triar l'heroi
  socket.on('check', (msg, cb) => {
    const reply = typeof cb === 'function' ? cb : () => {};
    const code = String((msg && msg.code) || '').toUpperCase().trim();
    const room = rooms.get(code);
    if (!/^[0-9]{4}$/.test(code)) return reply({ ok: false, error: 'El codi ha de tenir 4 números' });
    if (!room) return reply({ ok: false, error: `No hi ha cap sala amb el codi ${code}. Revisa'l amb el teu amic.` });
    if (room.members.size >= room.max) return reply({ ok: false, error: `La sala ${code} és plena (${room.members.size}/${room.max})` });
    const lead = room.members.get(room.leader);
    reply({ ok: true, code, mode: room.mode, players: room.members.size, max: room.max, state: room.state, leader: lead ? lead.name : '' });
  });

  socket.on('create', (opts, cb) => {
    const room = createRoom(opts || {});
    if (typeof cb === 'function') cb({ ok: true, code: room.code, mode: room.mode });
  });

  // entrar a la sala (encara no a la partida)
  socket.on('join', (msg, cb) => {
    const reply = typeof cb === 'function' ? cb : () => {};
    if (socket.data.room) return reply({ ok: false, error: 'Ja ets dins d\'una sala' });
    const code = String((msg && msg.code) || '').toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) return reply({ ok: false, error: `No hi ha cap sala amb el codi ${code}` });
    if (room.members.size >= room.max) return reply({ ok: false, error: 'La sala és plena' });
    socket.data.token = String((msg && msg.token) || '').slice(0, 64) || null;
    const sv = (msg && msg.save) || {};
    room.members.set(socket.id, { id: socket.id, socket, name: String(sv.name || (msg && msg.name) || 'Heroi').replace(/[<>]/g, '').slice(0, 16), cls: sv.cls || (msg && msg.cls) || 'foc', hero: sv.hero || 'heroi1', level: sv.level | 0 || 1 });
    if (!room.leader || !room.members.has(room.leader)) room.leader = socket.id;
    socket.data.room = room;
    socket.join(room.code);
    reply({ ok: true, code: room.code, id: socket.id, ...roomState(room) });
    sendRoom(room);
    console.log(`[sala] ${code}: entra ${socket.id} (${room.members.size}/${room.max})`);
  });

  // el líder tria el mode
  socket.on('roomMode', (msg) => {
    const room = socket.data.room;
    if (!room || room.leader !== socket.id || room.state !== 'lobby') return;
    const mode = msg && msg.mode;
    if (MODES[mode] && MODES[mode].multi) { room.mode = mode; if (msg.level) room.level = levelOk(msg.level); sendRoom(room); }
  });
  // el líder comença la partida
  socket.on('roomStart', (_m, cb) => {
    const reply = typeof cb === 'function' ? cb : () => {};
    const room = socket.data.room;
    if (!room || room.leader !== socket.id) return reply({ ok: false, error: 'Només el líder pot començar la partida' });
    if (room.state !== 'lobby') return reply({ ok: false, error: 'La partida ja ha començat' });
    if (MODES[room.mode].kind === 'pvp' && room.members.size < 2) return reply({ ok: false, error: 'Per a aquest mode cal com a mínim 2 jugadors' });
    startSim(room);
    for (const m of room.members.values()) m.socket.emit('roomStart', { mode: room.mode });
    sendRoom(room);
    reply({ ok: true });
  });
  // el líder acaba la partida per a tothom
  socket.on('roomEnd', () => {
    const room = socket.data.room;
    if (room && room.leader === socket.id && room.sim) endGame(room);
  });
  // un jugador surt de la partida però es queda a la sala
  socket.on('roomBack', () => {
    const room = socket.data.room;
    if (!room) return;
    leaveGame(room, socket.id);
    socket.emit('roomLobby', {});
    sendRoom(room);
  });

  // entrar a la partida en marxa de la sala
  socket.on('enter', (msg, cb) => {
    const reply = typeof cb === 'function' ? cb : () => {};
    const room = socket.data.room;
    if (!room || !room.members.has(socket.id)) return reply({ ok: false, error: 'No ets dins de cap sala' });
    if (!room.sim) return reply({ ok: false, error: 'La partida encara no ha començat' });
    if (room.sockets.has(socket.id)) return reply({ ok: false, error: 'Ja ets a la partida' });
    let save = msg && msg.save;
    const stored = socket.data.token && saves[socket.data.token];
    if (stored && stored.save && (!save || (stored.save.name === save.name && (stored.save.level > save.level || (stored.save.level === save.level && stored.save.xp > save.xp))))) save = stored.save;
    room.sockets.set(socket.id, socket);
    room.queues.set(socket.id, []);
    room.sim.addPlayer(socket.id, { save, name: msg && msg.name, cls: msg && msg.cls, hero: msg && msg.hero });
    const m = room.members.get(socket.id); if (m && save) { m.name = save.name || m.name; m.cls = save.cls || m.cls; m.level = save.level || m.level; }
    reply({ ok: true, code: room.code, mode: room.mode, id: socket.id });
    sendRoom(room);
  });

  for (const type of ['st', 'act', 'chat', 'shop', 'npc', 'inv', 'respawn', 'match']) {
    socket.on(type, (m) => {
      const room = socket.data.room;
      if (!room || !room.sim || !room.sockets.has(socket.id)) return;
      try { room.sim.input(socket.id, type, m || {}); } catch (e) { console.error('[input]', e); }
    });
  }
  // xat de la sala (fora de la partida)
  socket.on('roomChat', (m) => {
    const room = socket.data.room;
    if (!room) return;
    const text = String((m && m.text) || '').slice(0, 160).trim();
    const mem = room.members.get(socket.id);
    if (text && mem) for (const x of room.members.values()) x.socket.emit('roomChat', { name: mem.name, text });
  });

  const leave = () => {
    const room = socket.data.room;
    if (!room) return;
    leaveGame(room, socket.id);
    room.members.delete(socket.id);
    socket.leave(room.code);
    socket.data.room = null;
    if (room.leader === socket.id) room.leader = room.members.size ? room.members.keys().next().value : null;
    if (room.members.size === 0) { room.emptySince = Date.now(); if (room.sim) endGame(room); }
    sendRoom(room);
  };
  socket.on('leave', leave);
  socket.on('disconnect', leave);
});

server.listen(PORT, () => {
  console.log(`Cel Trencat v${GAME_VERSION} en marxa al port ${PORT}`);
});
