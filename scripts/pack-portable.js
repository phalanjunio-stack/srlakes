#!/usr/bin/env node
/**
 * Empacota o app em um .zip portátil pra rodar em outro PC sem instalar.
 * Inclui só os arquivos necessários (sem node_modules pesado).
 *
 * Roda: npm run pack
 * Saída: dist/sr-lakes-stage-sync-portable.zip
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const STAGING = path.join(DIST, 'staging');
const ZIP = path.join(DIST, 'sr-lakes-stage-sync-portable.zip');

const INCLUDE = [
  'index.html',
  'server.js',
  'manifest.webmanifest',
  'sw.js',
  'icon.svg',
  'package.json',
  'package-lock.json',
  'assets',
  'fonts',
  'README.md',
];

function rmrf(p) { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); }
function cp(src, dst) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const f of fs.readdirSync(src)) cp(path.join(src, f), path.join(dst, f));
  } else fs.copyFileSync(src, dst);
}

console.log('Limpando dist/staging…');
rmrf(STAGING);
fs.mkdirSync(STAGING, { recursive: true });

console.log('Copiando arquivos…');
for (const f of INCLUDE) cp(path.join(ROOT, f), path.join(STAGING, f));

// Inclui um script de start standalone (Windows + Unix)
fs.writeFileSync(path.join(STAGING, 'start.bat'), '@echo off\r\ncd /d "%~dp0"\r\nif not exist node_modules (echo Instalando deps...&npm install --omit=dev) else echo Deps ok\r\nnode server.js\r\npause\r\n');
fs.writeFileSync(path.join(STAGING, 'start.sh'), '#!/usr/bin/env bash\ncd "$(dirname "$0")"\n[ ! -d node_modules ] && npm install --omit=dev\nnode server.js\n');

console.log('Zipando…');
rmrf(ZIP);
process.chdir(STAGING);
try {
  // PowerShell Compress-Archive (Windows) ou zip (Unix)
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Compress-Archive -Path * -DestinationPath '${ZIP}' -Force"`, { stdio: 'inherit' });
  } else {
    execSync(`zip -r "${ZIP}" .`, { stdio: 'inherit' });
  }
} catch (e) {
  console.error('Falha ao zipar:', e.message);
  process.exit(1);
}
process.chdir(ROOT);

const size = (fs.statSync(ZIP).size / 1024 / 1024).toFixed(2);
console.log(`\n✓ ${path.relative(ROOT, ZIP)} (${size} MB)`);
console.log(`No outro PC: extraia, dê 2 cliques em start.bat (Windows) ou start.sh (Mac/Linux).`);
console.log(`Precisa Node.js 18+ instalado no destino.`);
