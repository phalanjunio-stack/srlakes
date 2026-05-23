# Checklist - Fontes e Melhorias

## A. URGENTE - Consertar fontes
- [x] Bundlar Inter, Bebas Neue e JetBrains Mono em /fonts (deixar de depender do Google Fonts CDN). 15 woff2, 308KB.
- [x] Adicionar @font-face local com font-display: swap. 56 declaracoes em fonts/fonts.css.
- [x] Garantir fallback decente (system-ui, serif, monospace) enquanto carrega. Bebas->Impact/Arial Narrow, Inter->Segoe UI/Roboto, JetBrains->Consolas/Cascadia.
- [x] Cachear as fontes no Service Worker pra funcionar 100% offline. sw.js v2 inclui /fonts/fonts.css.
- [x] Script npm run fetch-fonts pra baixar e atualizar quando precisar. scripts/fetch-fonts.js.
- [ ] Testar em Electron, navegador local e celular sem internet.

## B. UX e Polimento Visual
- [x] Confirmacoes destrutivas em modal estilizado em vez de confirm(). confirmAction() com kind danger/info.
- [x] Indicador visual claro de conexao Socket.IO (verde/amarelo/vermelho). Pill fixo top-right com 4 estados.
- [x] Reconexao automatica com toast amigavel. Socket.IO reconnect + transitions de pill.
- [x] Skeleton loading com shimmer animado (classe .skeleton + keyframes).
- [ ] Empty states bonitos (parcialmente — biblioteca tem mensagem).
- [ ] Undo (Ctrl+Z) no editor de blocos e no timeline.
- [ ] Tooltips com atalhos em todos os botoes principais.
- [ ] Animacao suave ao trocar de tela.
- [ ] Modo daltonico (paleta alternativa pra cifra/letra/click/cue).

## C. Funcionalidade Pendente
- [x] Tap Tempo realmente funcional (medio dos ultimos 4 toques, atualiza BPM da musica).
- [x] Pre-roll de contagem (4 cliques antes do play, com beat visual).
- [x] Modo ensaio (loop infinito numa parte selecionada, botao no transport).
- [x] Senha de sala (4 digitos) via POST /api/room/password.
- [ ] Fase 3 do timeline: importar VS/audio guia + waveform real + sync.
- [ ] Fase 4 do timeline: receptor segue timeline via Socket.IO.
- [ ] Fase 5 do timeline: import/export JSON + backup automatico + testes reais.
- [ ] Auto-Voz com matching melhor (fonemas em vez de letras).

## D. Audio
- [x] Pre-roll configuravel implementado via countIn().
- [ ] Sample real de wood block no metronomo (depende de arquivo).
- [ ] Subdivisoes audiveis (colcheia/semicolcheia ligando ao snap).
- [ ] Ducking simples entre tracks PA e fone.
- [ ] Calibracao automatica de latencia (RTT real medido em tempo de play).

## E. Mobile
- [x] Trocar mousedown por pointerdown nos drags (suporte touch).
- [x] Botoes maiores em telas pequenas (44x44 minimo). @media max 780px.
- [ ] Letras do receptor ainda maiores em modo horizontal.
- [ ] Vibrar nao so no downbeat - confirmar suporte iOS.
- [ ] PWA install prompt customizado.

## F. Robustez
- [x] Validar payload em /api/songs (titulo, BPM 20-300, parts array, max 5MB).
- [x] Backup automatico rotativo de data/songs.json (mantem 5 ultimos).
- [x] Limite de tamanho de payload com mensagem amigavel (400 + json).
- [ ] Tratamento de erros consistente (toast sempre, console como fallback).
- [ ] Tela de "servidor caiu" quando socket desconectar (pill ja mostra).
- [ ] Modo offline-only no celular se servidor sumir.

## G. Performance
- [x] Lazy-load do tuner so quando entrar na tela (mic so liga em tuner.start()).
- [x] Debounce no markDirty/renderEditorPreview (120ms).
- [ ] Separar timeline em arquivo .js proprio (index.html ta com 3400+ linhas).
- [ ] Minificar CSS/JS pra build de producao.
- [ ] Virtualizar listas longas (biblioteca com 100+ musicas).

## H. Acessibilidade
- [x] Foco visivel em todos os botoes (:focus-visible com outline gold).
- [x] aria-label nos botoes so com icone (topbar, transport).
- [x] aria-live na pill de conexao (role status).
- [x] aria-modal + role dialog no confirm modal.
- [ ] Labels semanticos (input/label) em todos os forms.
- [ ] Navegacao por teclado em todas as telas (parcial).
- [ ] Contraste minimo AA em todos os textos (verificar com tool).

## I. Distribuicao
- [x] Versao portable (.zip) pra notebook de show. scripts/pack-portable.js + npm run pack.
- [x] Start.bat e start.sh embutidos no portable.
- [ ] Build do .exe Electron testado em maquina limpa.
- [ ] Auto-updater (electron-updater).
- [ ] Splash screen na abertura.

## J. Documentacao
- [x] Inventario de eventos Socket.IO. docs/SOCKET_EVENTS.md.
- [x] README atualizado com scripts, atalhos, troubleshooting.
- [ ] JSDoc nas funcoes principais (tl.*, audio.*, tuner.*).
- [ ] Guia "primeira vez no palco" pro vocalista/lider.
- [ ] Video curto de demonstracao.
