# Checklist - Timeline da Musica

## Fase 1 - Base funcional
- [x] Criar mockup visual da Timeline da Musica.
- [x] Servir o mockup por HTTP local.
- [x] Integrar a Timeline como aba real do editor do app.
- [x] Carregar timeline salva quando a musica ja tiver timeline.
- [x] Gerar timeline inicial a partir dos blocos quando ainda nao houver timeline.
- [x] Salvar timeline junto com a musica pelo endpoint `/api/songs`.
- [x] Marcar alteracoes da timeline como alteracoes pendentes do editor.

## Fase 2 - Editor musical
- [x] Snap configuravel por compasso, tempo e subdivisao.
- [x] Arrastar blocos entre trilhas compativeis.
- [x] Redimensionar blocos pelas bordas com duracao minima.
- [x] Painel de propriedades do bloco selecionado.
- [x] Comandos de duplicar, excluir, alinhar e quantizar bloco.
- [x] Mini mapa da estrutura da musica.

## Fase 3 - Audio e palco
- [ ] Importar arquivo VS/audio guia.
- [ ] Gerar waveform real do arquivo importado.
- [ ] Tocar audio guia sincronizado com compasso/tempo.
- [ ] Metrônomo com acento no tempo 1 e subdivisoes.
- [ ] Roteamento PA/fone/off por trilha.
- [ ] Validar suporte a saidas separadas no Electron.

## Fase 4 - Sincronizacao
- [ ] Publicar posicao da timeline via Socket.IO.
- [ ] Enviar acorde, letra, cue, compasso e tempo atuais para receptores.
- [ ] Criar modo receptor baseado na timeline.
- [ ] Medir latencia e compensacao de delay por dispositivo.

## Fase 5 - Show pronto
- [ ] Importar/exportar timeline.
- [ ] Backup local automatico.
- [ ] Atalhos de teclado.
- [ ] Testes em notebook e celulares reais.
- [ ] Revisao visual final em tema dark premium.
