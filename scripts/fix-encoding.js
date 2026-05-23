#!/usr/bin/env node
/**
 * Conserta mojibake (UTF-8 lido como cp1252 e re-encodado).
 * Usa codepoints explicitos pra evitar problemas de save deste arquivo.
 */
const fs = require('fs');
const path = require('path');

const FILES = [
  '../index.html',
  '../server.js',
  '../main.js',
  '../README.md',
  '../CHECKLIST_FONTES_E_MELHORIAS.md',
  '../CHECKLIST_DESIGN_PREMIUM.md',
  '../CHECKLIST_TIMELINE_MUSICA.md',
];

// [array de codepoints da sequencia mojibake, char correto]
const MAP = [
  // Letras portuguesas — padrão "Ã + X"
  [[0xC3, 0xA7], 'ç'], [[0xC3, 0x87], 'Ç'],
  [[0xC3, 0xA3], 'ã'], [[0xC3, 0x83], 'Ã'],
  [[0xC3, 0xA1], 'á'], [[0xC3, 0x81], 'Á'],
  [[0xC3, 0xA0], 'à'],
  [[0xC3, 0xA2], 'â'], [[0xC3, 0x82], 'Â'],
  [[0xC3, 0xA9], 'é'], [[0xC3, 0x89], 'É'],
  [[0xC3, 0xAA], 'ê'], [[0xC3, 0x8A], 'Ê'],
  [[0xC3, 0xAD], 'í'], [[0xC3, 0x8D], 'Í'],
  [[0xC3, 0xB3], 'ó'], [[0xC3, 0x93], 'Ó'],
  [[0xC3, 0xB4], 'ô'], [[0xC3, 0x94], 'Ô'],
  [[0xC3, 0xB5], 'õ'], [[0xC3, 0x95], 'Õ'],
  [[0xC3, 0xBA], 'ú'], [[0xC3, 0x9A], 'Ú'],
  [[0xC3, 0xBC], 'ü'],
  // Pontuação (Â + X)
  [[0xC2, 0xB0], '°'],
  [[0xC2, 0xB7], '·'],
  [[0xC2, 0xAE], '®'],
  [[0xC2, 0xA9], '©'],
  // Pontuação (â€ + X) — em dash, en dash, aspas, ellipsis
  [[0xE2, 0x80, 0x94], '—'],
  [[0xE2, 0x80, 0x93], '–'],
  [[0xE2, 0x80, 0xA6], '…'],
  [[0xE2, 0x80, 0xA2], '•'],
  [[0xE2, 0x80, 0x9C], '“'],
  [[0xE2, 0x80, 0x9D], '”'],
  [[0xE2, 0x80, 0x98], '‘'],
  [[0xE2, 0x80, 0x99], '’'],

  // Mojibake DUPLO (sequência 3-byte foi re-encodada outra vez)
  // â€" duplicado → bytes c3 a2 e2 82 ac e2 80 9d → '—'
  [[0xC3, 0xA2, 0xE2, 0x82, 0xAC, 0xE2, 0x80, 0x9D], '—'],
  // â€" duplicado → bytes c3 a2 e2 82 ac e2 80 9c → '–' (en-dash)
  [[0xC3, 0xA2, 0xE2, 0x82, 0xAC, 0xE2, 0x80, 0x9C], '–'],
  // â€¦ duplicado → '…'
  [[0xC3, 0xA2, 0xE2, 0x82, 0xAC, 0xC2, 0xA6], '…'],
  // â€¢ duplicado → '•'
  [[0xC3, 0xA2, 0xE2, 0x82, 0xAC, 0xC2, 0xA2], '•'],
  // ã + outras combos (Ã£ → "ã" → quando re-encodado: c3 83 c2 a3)
  [[0xC3, 0x83, 0xC2, 0xA3], 'ã'],
  [[0xC3, 0x83, 0xC2, 0xA7], 'ç'],
  [[0xC3, 0x83, 0xC2, 0xA9], 'é'],
  [[0xC3, 0x83, 0xC2, 0xA1], 'á'],
  [[0xC3, 0x83, 0xC2, 0xB3], 'ó'],
  [[0xC3, 0x83, 0xC2, 0xB4], 'ô'],
  [[0xC3, 0x83, 0xC2, 0xAA], 'ê'],
  [[0xC3, 0x83, 0xC2, 0xAD], 'í'],
  [[0xC3, 0x83, 0xC2, 0xBA], 'ú'],
  [[0xC3, 0x83, 0xC2, 0xA2], 'â'],
  [[0xC3, 0x83, 0xC2, 0xA0], 'à'],
  [[0xC3, 0x83, 0xC2, 0xB5], 'õ'],
  // Símbolos (â + X)
  [[0xE2, 0x9C, 0x93], '✓'],   // ✓
  [[0xE2, 0x9C, 0x95], '✕'],   // ✕
  [[0xE2, 0x98, 0x85], '★'],   // ★
  [[0xE2, 0x96, 0xB6], '▶'],   // ▶
  [[0xE2, 0x97, 0x8F], '●'],   // ●
  [[0xE2, 0x89, 0x8B], '≋'],   // ≋
  [[0xE2, 0x96, 0xA6], '▦'],   // ▦
  [[0xE2, 0x96, 0xA3], '▣'],   // ▣
  [[0xE2, 0x99, 0xAC], '♬'],   // ♬
  [[0xE2, 0x9A, 0x99], '⚙'],   // ⚙
  [[0xE2, 0x9A, 0xA0], '⚠'],   // ⚠
  // Emojis (ð + 3 bytes)
  [[0xF0, 0x9F, 0x94, 0x8A], '🔊'],   // 🔊
  [[0xF0, 0x9F, 0x8E, 0xA7], '🎧'],   // 🎧
  [[0xF0, 0x9F, 0x8E, 0x99], '🎙'],   // 🎙
  [[0xF0, 0x9F, 0x8E, 0xB5], '🎵'],   // 🎵
  [[0xF0, 0x9F, 0x8E, 0xB8], '🎸'],   // 🎸
  [[0xF0, 0x9F, 0x93, 0xA2], '📢'],   // 📢
];

// Converte cada par [bytes, char] em [stringMojibake, char].
// O mojibake string é cada byte como char individual (cp1252 → utf8 single char).
function bytesToMojibakeString(bytes) {
  // Cada byte vira o char correspondente em Latin-1 quando re-encodado
  // Ex: byte 0xC3 → char U+00C3 ('Ã')
  return bytes.map(b => String.fromCharCode(b)).join('');
}

// Mojibake "twice-encoded" — quando o arquivo já tá em UTF-8 válido mas com chars Unicode que VISUALMENTE parecem mojibake.
// Mapeio sequências de codepoints diretos.
const CHAR_MAP = [
  // U+00E2 + U+20AC + U+????
  [String.fromCodePoint(0x00E2, 0x20AC, 0x201D), '—'],   // em-dash duplo
  [String.fromCodePoint(0x00E2, 0x20AC, 0x201C), '–'],   // en-dash duplo
  [String.fromCodePoint(0x00E2, 0x20AC, 0x00A6), '…'],   // ellipsis
  [String.fromCodePoint(0x00E2, 0x20AC, 0x00A2), '•'],
  [String.fromCodePoint(0x00E2, 0x20AC, 0x017E), '✓'],
  [String.fromCodePoint(0x00E2, 0x20AC, 0x0153), '“'],
  [String.fromCodePoint(0x00E2, 0x20AC, 0x009D), '”'],
  // Ã + xyz duplo
  [String.fromCodePoint(0x00C3, 0x0192, 0x00C2, 0x00A7), 'ç'],
  [String.fromCodePoint(0x00C3, 0x0192, 0x00C2, 0x00A3), 'ã'],
  [String.fromCodePoint(0x00C3, 0x0192, 0x00C2, 0x00A9), 'é'],
  [String.fromCodePoint(0x00C3, 0x0192, 0x00C2, 0x00A1), 'á'],
  [String.fromCodePoint(0x00C3, 0x0192, 0x00C2, 0x00B3), 'ó'],
];

const FINAL_MAP = [
  ...CHAR_MAP,
  ...MAP.map(([bytes, target]) => [bytesToMojibakeString(bytes), target]),
];
// Ordena por tamanho decrescente pra match das sequências longas primeiro
FINAL_MAP.sort((a, b) => b[0].length - a[0].length);

let totalFixed = 0;
for (const rel of FILES) {
  const file = path.resolve(__dirname, rel);
  if (!fs.existsSync(file)) { console.log('skip:', rel); continue; }
  let content = fs.readFileSync(file, 'utf8');
  let fileFixed = 0;
  for (const [bad, good] of FINAL_MAP) {
    if (content.indexOf(bad) === -1) continue;
    const re = new RegExp(bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const n = (content.match(re) || []).length;
    if (n) { content = content.replace(re, good); fileFixed += n; }
  }
  if (fileFixed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(rel, '->', fileFixed, 'fixes');
    totalFixed += fileFixed;
  } else {
    console.log(rel, '-> clean');
  }
}
console.log('Total:', totalFixed);
