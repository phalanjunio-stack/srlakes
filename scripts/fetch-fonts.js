#!/usr/bin/env node
/**
 * Baixa as fontes do Google Fonts pra fonts/ localmente.
 * Roda: npm run fetch-fonts
 *
 * Pra mudar as fontes, edite FONT_QUERY abaixo.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const FONT_QUERY = 'family=Inter:wght@400;500;600;700;800;900&family=Bebas+Neue&family=JetBrains+Mono:wght@500;700&display=swap';
const CSS_URL = 'https://fonts.googleapis.com/css2?' + FONT_QUERY;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const OUT_DIR = path.resolve(__dirname, '..', 'fonts');

function get(url) {
  return new Promise((resolve, reject) => {
    const opts = { headers: { 'User-Agent': UA } };
    https.get(url, opts, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(res.headers.location));
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode + ' ' + url));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('Baixando CSS do Google Fonts…');
  const cssBuf = await get(CSS_URL);
  let css = cssBuf.toString('utf8');

  const urls = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com[^)]+\.woff2/g) || [])];
  console.log(`Encontradas ${urls.length} fontes .woff2`);

  for (const url of urls) {
    const fname = path.basename(url);
    const dest = path.join(OUT_DIR, fname);
    if (fs.existsSync(dest)) { console.log('  - já existe: ' + fname); continue; }
    process.stdout.write('  ↓ ' + fname + '… ');
    const buf = await get(url);
    fs.writeFileSync(dest, buf);
    console.log(buf.length + ' bytes');
  }

  // Reescreve URLs pra paths locais
  css = css.replace(/https:\/\/fonts\.gstatic\.com[^)]*\/([^/)]+\.woff2)/g, './$1');
  fs.writeFileSync(path.join(OUT_DIR, 'fonts.css'), css, 'utf8');
  console.log('✓ fonts/fonts.css escrito (' + (css.match(/@font-face/g) || []).length + ' @font-face)');
  console.log('Pronto.');
})().catch(e => { console.error(e); process.exit(1); });
