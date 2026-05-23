# Inventário de eventos Socket.IO

Lista completa dos eventos trocados entre o servidor (`server.js`) e os clientes (`index.html`).

## Cliente → Servidor

| Evento | Payload | Quem emite | O que faz |
|--------|---------|------------|-----------|
| `identify` | `{ name, mode: 'tx'\|'rx' }` | Todo cliente ao conectar | Registra nome e modo no roster da sala |
| `state` | `{ songId, partIdx, beat, rep, bar, playing, elapsedSec, bpm }` | Só Transmissor | Atualiza o estado vivo (servidor faz broadcast pros receptores) |
| `time:ping` | `clientTs` (number, ms) | Qualquer cliente | Calibração de latência (servidor responde com `time:pong`) |
| `beat:tick` | `{ beat, ts }` | (Opcional) Transmissor | Tick síncrono se quiser metrônomo central |

## Servidor → Cliente

| Evento | Payload | Quando dispara | O que faz |
|--------|---------|----------------|-----------|
| `snapshot` | `{ state, clients, serverTime }` | Imediatamente após `connection` | Catch-up pra quem entra tarde — manda estado atual + relógio do servidor |
| `state` | `{ ...liveState }` | Quando TX emite `state` | Receptores aplicam no próprio state |
| `clients:count` | `n` (number) | A cada connect/disconnect | Sidebar atualiza "Conectados: X" |
| `clients:list` | `Array<{ name, mode, joinedAt }>` | A cada connect/disconnect/identify | Roster completo dos músicos |
| `songs:changed` | `Array<Song>` | Após POST/PUT/DELETE em /api/songs | Cliente refaz a biblioteca |
| `setlists:changed` | `Array<Setlist>` | Após POST/PUT/DELETE em /api/setlists | Cliente refaz repertórios |
| `time:pong` | `{ clientTs, serverTs }` | Resposta de `time:ping` | Cliente calcula offset/RTT |
| `room:password-changed` | `{ enabled }` | Após POST /api/room/password | Cliente desconecta ou avisa pra reconectar com senha |

## REST endpoints

### Songs
| Método | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/songs` | Lista todas |
| POST | `/api/songs` | Cria (auto-incrementa id + num) |
| PUT | `/api/songs/:id` | Atualiza |
| DELETE | `/api/songs/:id` | Remove |

### Setlists
Mesma estrutura, em `/api/setlists`.

### Sala
| Método | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/info` | IP, porta, contagem clientes, senha habilitada |
| GET | `/api/health` | Health check |
| GET | `/api/qr?url=` | SVG do QR Code apontando pro URL informado (default: IP local) |
| POST | `/api/room/password` | Body `{ password: "1234" }` — `""` desliga |
| POST | `/api/room/check` | Body `{ password }` — valida senha (401 se errada) |

## Validações ativas

Servidor rejeita com `400 Bad Request`:
- Song sem `title` ou com >200 chars
- BPM fora de 20-300
- `parts` não-array ou >100 itens
- Payload >5 MB
- Setlist sem `name`

## Backup automático

Cada `POST/PUT/DELETE` em songs/setlists copia o arquivo atual pra `data/backups/<base>_<timestamp>.json` antes de gravar. Mantém os 5 mais recentes por arquivo.

## Mojibake / Encoding

O projeto usa UTF-8 puro. Se aparecer mojibake (Ã§, â€", etc):
```bash
npm run fix-encoding
```

## Como TX/RX se diferenciam

- **Transmissor** (`mode: 'tx'`): emite `state` quando muda música/parte/beat. Não escuta `state`.
- **Receptor** (`mode: 'rx'`): escuta `state` e atualiza state local. Não emite.

O toggle fica no canto superior esquerdo da sidebar e persiste em `localStorage['mode']`.
