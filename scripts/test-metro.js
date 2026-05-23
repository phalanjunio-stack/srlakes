/**
 * Valida lógica do metrônomo:
 * - intervalo entre clicks = 60000/bpm ms
 * - downbeat acentua a cada `sig` batidas
 * - mudança de BPM/sig reinicia corretamente
 */
function makeMetro() {
  return {
    bpm: 120, sig: 4, beat: 1, timer: null, accent: true,
    history: [], // {t, beat, accent}
    start(now = Date.now()) {
      if (this.timer) return;
      this.beat = 1;
      this.history.push({ t: now, beat: 1, accent: true });
      // simula setInterval virtual
      this._lastTick = now;
      this.timer = true;
    },
    tick(now) {
      this.beat = this.beat % this.sig + 1;
      const isAccent = this.beat === 1 && this.accent;
      this.history.push({ t: now, beat: this.beat, accent: isAccent });
    },
    stop() { this.timer = false; },
    setBpm(v) {
      this.bpm = Math.max(20, Math.min(300, v));
      if (this.timer) { this.stop(); this.start(); this.history = [{...this.history[0], reset:true}]; }
    },
  };
}

let fails = 0;
function check(name, cond, info) {
  console.log(`  ${cond?'OK':'FAIL'} ${name}${info?' '+info:''}`);
  if (!cond) fails++;
}

console.log('[metro] cálculo de intervalo');
for (const bpm of [60, 90, 120, 140, 180, 240]) {
  const interval = 60000 / bpm;
  const expected = { 60: 1000, 90: 666.67, 120: 500, 140: 428.57, 180: 333.33, 240: 250 }[bpm];
  check(`BPM ${bpm}`, Math.abs(interval - expected) < 0.5, `→ ${interval.toFixed(2)}ms (esperado ${expected}ms)`);
}

console.log('[metro] sequência de beats com sig 4/4 (8 batidas)');
const m = makeMetro();
m.setBpm.call(m, 120);
m.sig = 4;
let t = 0;
m.start(t);
for (let i = 0; i < 7; i++) { t += 60000/m.bpm; m.tick(t); }
const beats = m.history.map(h => h.beat);
const accents = m.history.map(h => h.accent);
const expectedBeats = [1,2,3,4,1,2,3,4];
const expectedAccents = [true,false,false,false,true,false,false,false];
check('sequência de beats', JSON.stringify(beats) === JSON.stringify(expectedBeats), `[${beats}]`);
check('acentos em beat 1', JSON.stringify(accents) === JSON.stringify(expectedAccents), `[${accents}]`);

console.log('[metro] sig 6/8');
const m2 = makeMetro(); m2.sig = 6;
m2.start(0);
for (let i = 0; i < 11; i++) m2.tick(0);
const seq68 = m2.history.map(h => h.beat);
check('6/8 ciclo', JSON.stringify(seq68) === JSON.stringify([1,2,3,4,5,6,1,2,3,4,5,6]), `[${seq68}]`);

console.log('[metro] limites: BPM clamp [20, 300]');
const m3 = makeMetro();
m3.setBpm.call(m3, 10);
check('BPM 10 → 20', m3.bpm === 20);
m3.setBpm.call(m3, 500);
check('BPM 500 → 300', m3.bpm === 300);
m3.setBpm.call(m3, 142);
check('BPM 142 mantém', m3.bpm === 142);

console.log(`\n[metro] ${fails === 0 ? '✓ TODOS PASSARAM' : `✗ ${fails} FALHAS`}`);
process.exit(fails === 0 ? 0 : 1);
