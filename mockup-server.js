const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 7474);
const root = __dirname;
const dataDir = path.join(root, 'data');
const songsFile = path.join(dataDir, 'songs.json');
const setlistsFile = path.join(dataDir, 'setlists.json');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        reject(new Error('Payload muito grande'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body ? JSON.parse(body) : {}));
    req.on('error', reject);
  });
}

function readJson(file, fallback = []) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), 'application/json; charset=utf-8');
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  if (req.url === '/health') {
    return send(res, 200, JSON.stringify({ ok: true, mockup: true }), 'application/json; charset=utf-8');
  }

  if (urlPath === '/api/health') {
    return sendJson(res, 200, { ok: true, lite: true, ts: Date.now() });
  }

  if (urlPath === '/api/info') {
    return sendJson(res, 200, { ip: '127.0.0.1', port, url: `http://127.0.0.1:${port}`, clients: 0, lite: true });
  }

  if (urlPath === '/socket.io/socket.io.js') {
    return send(res, 200, `
      window.io = function(){
        return {
          id: 'lite-server',
          emit(){},
          on(event, fn){ if(event === 'connect') setTimeout(fn, 0); return this; }
        };
      };
    `, 'text/javascript; charset=utf-8');
  }

  if (urlPath === '/api/songs') {
    if (req.method === 'GET') return sendJson(res, 200, readJson(songsFile));
    if (req.method === 'POST') {
      return readBody(req).then(song => {
        const songs = readJson(songsFile);
        const id = Math.max(0, ...songs.map(s => s.id || 0)) + 1;
        const saved = { ...song, id, num: song.num || String(id).padStart(2, '0') };
        songs.push(saved);
        writeJson(songsFile, songs);
        sendJson(res, 200, saved);
      }).catch(err => sendJson(res, 400, { error: err.message }));
    }
  }

  const songMatch = urlPath.match(/^\/api\/songs\/(\d+)$/);
  if (songMatch) {
    const id = Number(songMatch[1]);
    const songs = readJson(songsFile);
    const index = songs.findIndex(song => song.id === id);
    if (index < 0) return sendJson(res, 404, { error: 'not found' });
    if (req.method === 'PUT') {
      return readBody(req).then(song => {
        songs[index] = { ...songs[index], ...song, id };
        writeJson(songsFile, songs);
        sendJson(res, 200, songs[index]);
      }).catch(err => sendJson(res, 400, { error: err.message }));
    }
    if (req.method === 'DELETE') {
      songs.splice(index, 1);
      writeJson(songsFile, songs);
      return sendJson(res, 200, { ok: true });
    }
  }

  if (urlPath === '/api/setlists') {
    if (req.method === 'GET') return sendJson(res, 200, readJson(setlistsFile));
    if (req.method === 'POST') {
      return readBody(req).then(setlist => {
        const setlists = readJson(setlistsFile);
        const id = Math.max(0, ...setlists.map(s => s.id || 0)) + 1;
        const saved = { ...setlist, id };
        setlists.push(saved);
        writeJson(setlistsFile, setlists);
        sendJson(res, 200, saved);
      }).catch(err => sendJson(res, 400, { error: err.message }));
    }
  }

  const setlistMatch = urlPath.match(/^\/api\/setlists\/(\d+)$/);
  if (setlistMatch) {
    const id = Number(setlistMatch[1]);
    const setlists = readJson(setlistsFile);
    const index = setlists.findIndex(set => set.id === id);
    if (index < 0) return sendJson(res, 404, { error: 'not found' });
    if (req.method === 'PUT') {
      return readBody(req).then(setlist => {
        setlists[index] = { ...setlists[index], ...setlist, id };
        writeJson(setlistsFile, setlists);
        sendJson(res, 200, setlists[index]);
      }).catch(err => sendJson(res, 400, { error: err.message }));
    }
    if (req.method === 'DELETE') {
      setlists.splice(index, 1);
      writeJson(setlistsFile, setlists);
      return sendJson(res, 200, { ok: true });
    }
  }

  const cleanPath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  const filePath = path.join(root, cleanPath ? cleanPath : 'index.html');

  if (!filePath.startsWith(root)) return send(res, 403, 'Forbidden');

  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    send(res, 200, data, types[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Sr Lakes Stage Sync lite: http://localhost:${port}`);
  console.log(`Timeline mockup: http://localhost:${port}/timeline-musica-mockup.html`);
});
