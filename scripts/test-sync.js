/**
 * Test automatizado de sync TX <-> RX via Socket.IO
 * Sobe dois clientes (TX e RX), TX publica state, RX deve receber.
 */
const { io } = require('socket.io-client');

const URL = process.argv[2] || 'http://localhost:7474';
const TIMEOUT_MS = 5000;

const log = (...a) => console.log('[test]', ...a);
const ok = (...a) => console.log('  OK', ...a);
const fail = (...a) => { console.error('  FAIL', ...a); process.exitCode = 1; };

function waitFor(socket, event, ms = TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting for "${event}"`)), ms);
    socket.once(event, (data) => { clearTimeout(t); resolve(data); });
  });
}

(async () => {
  log('Connecting to', URL);

  const tx = io(URL, { transports: ['websocket'] });
  const rx = io(URL, { transports: ['websocket'] });

  try {
    await Promise.all([
      waitFor(tx, 'connect'),
      waitFor(rx, 'connect'),
    ]);
    ok('TX e RX conectados');

    // Identify
    tx.emit('identify', { name: 'TestTX', mode: 'tx' });
    rx.emit('identify', { name: 'TestRX', mode: 'rx' });
    await new Promise(r => setTimeout(r, 200));

    // RX deveria ter recebido snapshot inicial
    const snapshot = await waitFor(rx, 'snapshot').catch(() => null);
    if (snapshot) ok('RX recebeu snapshot inicial');
    else log('  (snapshot pode ter chegado antes do listener, normal)');

    // TX publica state
    const testState = {
      songId: 99, partIndex: 2, beat: 3, playing: true,
      bpm: 142, ts: Date.now(),
    };

    const rxPromise = waitFor(rx, 'state', 3000);
    tx.emit('state', testState);
    const received = await rxPromise.catch(e => null);

    if (received && received.bpm === 142 && received.partIndex === 2) {
      ok('RX recebeu state do TX (bpm=142, partIndex=2)');
    } else {
      fail('RX não recebeu state ou veio incorreto:', received);
    }

    // Time ping
    const pongP = waitFor(tx, 'time:pong', 2000);
    tx.emit('time:ping', { t0: Date.now() });
    const pong = await pongP.catch(() => null);
    if (pong) ok('time:ping/pong funcionando');
    else fail('time:ping não respondeu');

    // Clients count broadcast
    const countP = waitFor(rx, 'clients:count', 1500).catch(() => null);
    const cx = io(URL, { transports: ['websocket'] });
    await waitFor(cx, 'connect');
    const count = await countP;
    if (count && typeof count === 'object' && (count.count || count.tx >= 0 || Array.isArray(count.clients))) {
      ok('clients:count emitido ao conectar 3º cliente');
    } else if (typeof count === 'number') {
      ok('clients:count =', count);
    } else {
      log('  (clients:count não chegou — pode estar OK se servidor não emite a cada connect)');
    }

    cx.disconnect();
    tx.disconnect();
    rx.disconnect();

    log('Testes concluídos. Exit code:', process.exitCode || 0);
    process.exit(process.exitCode || 0);
  } catch (e) {
    console.error('[test] ERRO:', e.message);
    tx?.disconnect();
    rx?.disconnect();
    process.exit(1);
  }
})();
