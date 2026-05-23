/**
 * Valida lógica do afinador com sinais sintéticos.
 * Reproduz tuner.detectPitch e tuner.freqToNote sem Web Audio.
 */
const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function detectPitch(buf, sampleRate){
  const SIZE = buf.length;
  let rms = 0; for (let i = 0; i < SIZE; i++) rms += buf[i]*buf[i];
  rms = Math.sqrt(rms/SIZE);
  if (rms < 0.01) return -1;
  let r1=0, r2=SIZE-1; const thres = 0.2;
  for (let i = 0; i < SIZE/2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < SIZE/2; i++) if (Math.abs(buf[SIZE-i]) < thres) { r2 = SIZE-i; break; }
  buf = buf.slice(r1, r2);
  const N = buf.length;
  const c = new Array(N).fill(0);
  for (let i = 0; i < N; i++) for (let j = 0; j < N-i; j++) c[i] += buf[j]*buf[j+i];
  let d = 0; while (c[d] > c[d+1]) d++;
  let maxv = -1, maxp = -1;
  for (let i = d; i < N; i++) if (c[i] > maxv) { maxv = c[i]; maxp = i; }
  let T0 = maxp;
  const x1 = c[T0-1]||0, x2 = c[T0]||0, x3 = c[T0+1]||0;
  const a = (x1+x3-2*x2)/2, b = (x3-x1)/2;
  if (a) T0 -= b/(2*a);
  return sampleRate/T0;
}

function freqToNote(freq){
  if (freq <= 0) return null;
  const noteNum = 12 * (Math.log(freq/440)/Math.log(2));
  const rounded = Math.round(noteNum) + 69;
  const cents = Math.floor((noteNum - Math.round(noteNum))*100);
  const name = noteNames[(rounded+1200)%12];
  const octave = Math.floor(rounded/12) - 1;
  return { name, octave, cents, freq };
}

function sine(freq, sampleRate, length) {
  const buf = new Float32Array(length);
  for (let i = 0; i < length; i++) buf[i] = Math.sin(2*Math.PI*freq*i/sampleRate) * 0.5;
  return buf;
}

const sr = 44100;
const len = 2048;
let fails = 0;

console.log('[tuner] testando freqToNote nas 6 cordas padrão da guitarra');
const guitarStrings = [
  { name: 'E', octave: 2, freq: 82.41 },
  { name: 'A', octave: 2, freq: 110.00 },
  { name: 'D', octave: 3, freq: 146.83 },
  { name: 'G', octave: 3, freq: 196.00 },
  { name: 'B', octave: 3, freq: 246.94 },
  { name: 'E', octave: 4, freq: 329.63 },
];
for (const s of guitarStrings) {
  const n = freqToNote(s.freq);
  const ok = n.name === s.name && n.octave === s.octave && Math.abs(n.cents) < 3;
  console.log(`  ${ok?'OK':'FAIL'} ${s.freq}Hz -> ${n.name}${n.octave} ${n.cents>=0?'+':''}${n.cents}c (esperado ${s.name}${s.octave})`);
  if (!ok) fails++;
}

console.log('[tuner] testando detectPitch com sinal sintético');
// pitches que cobrem a faixa típica
for (const f of [110, 220, 440, 880]) {
  const buf = sine(f, sr, len);
  const detected = detectPitch(buf, sr);
  const err = Math.abs(detected - f) / f * 100;
  const ok = err < 5;
  console.log(`  ${ok?'OK':'FAIL'} ${f}Hz -> detectado ${detected.toFixed(2)}Hz (erro ${err.toFixed(2)}%)`);
  if (!ok) fails++;
}

console.log('[tuner] cents perto de zero quando afinada (440Hz exato)');
const n440 = freqToNote(440);
console.log(`  ${n440.cents === 0 ? 'OK' : 'FAIL'} 440Hz -> ${n440.name}${n440.octave} ${n440.cents}c`);
if (n440.cents !== 0) fails++;

console.log('[tuner] desafinada: 445Hz (~+20 cents do A4)');
const n445 = freqToNote(445);
console.log(`  ${n445.cents > 15 ? 'OK' : 'FAIL'} 445Hz -> ${n445.name}${n445.octave} +${n445.cents}c`);
if (n445.cents <= 15) fails++;

console.log(`\n[tuner] ${fails === 0 ? '✓ TODOS PASSARAM' : `✗ ${fails} FALHAS`}`);
process.exit(fails === 0 ? 0 : 1);
