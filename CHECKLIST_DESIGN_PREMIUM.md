# Checklist - Design Premium / Luxuoso

## Principios de elevacao
Diferenca entre "bonito" e "luxuoso":
1. **Profundidade real** - sombras em camadas (1px + 4px + 20px), nao chapado.
2. **Tipografia com personalidade** - display serif/condensed pra titulos, mono refinado pra dados, sans neutro pro corpo.
3. **Cores com narrativa** - dourado/champanhe como acento, dark com matiz quente, nao cinza neutro.
4. **Microdetalhes** - hairlines com gradiente, hover spring, transicoes 200-300ms com cubic-bezier.
5. **Espaco respira** - menos elementos, mais espaco entre eles, alinhamento rigoroso ao grid.
6. **Textura sutil** - noise grain 2-3% opacidade, brilho difuso, blur saturado.
7. **Consistencia obsessiva** - mesmos radiuses, mesmas larguras de borda, mesmo timing de animacao.

## A. Sistema de design (uplift global)
- [x] Adicionar token --gold (#c8a356) e --sage (#a8c4be) alinhados a marca da banda.
- [x] Refinar paleta dark: bg-0 #15151a charcoal quente (em vez de azulado).
- [x] Sombras em camadas: shadow-1/2/3 + shadow-gold.
- [x] Adicionar token --grain pra noise SVG sutil (overlay global em body::before).
- [x] Padronizar transicoes: --ease-out, --ease-spring, --dur-fast 140ms, --dur 240ms, --dur-slow 420ms.
- [x] Padronizar radiuses: 10/14/20/26.
- [ ] Borders com gradiente sutil (border-image: linear-gradient).
- [ ] Hairline borders: 1px solid rgba(255,255,255,.06) com inner highlight em algumas cards. (parcial)
- [x] Logo SR LAKES BANDA recriada em SVG, integrada no sidebar e favicon.

## B. Tipografia
- [ ] Adicionar fonte display serif (Playfair Display ou Fraunces) pra titulos principais.
- [ ] Manter Bebas pra numeros grandes (BPM, tom, parte).
- [ ] Inter pro corpo, com tracking de -0.015em em titulos.
- [ ] Letter-spacing rigoroso em labels (0.2em pra ALL CAPS).
- [ ] Tamanhos em escala matematica (12/14/16/20/28/40/56/80).
- [ ] Italics serifa pra detalhes especiais (letra de musica, dicas).

## C. Componentes - cards
- [ ] Gradient interior sutil (160deg, lighter top-left).
- [ ] Inner shadow no topo (highlight) e na base (depth).
- [ ] Hover lift suave (-2px translateY + sombra maior).
- [ ] Border com gradient (mais claro no topo).
- [ ] Padding consistente: 18/22/28 conforme densidade.

## D. Componentes - botoes
- [ ] Primary com gradient + glow + inner highlight (1px branca topo).
- [ ] Secondary ghost com border sutil + hover background fade.
- [ ] Danger com gradient vermelho + glow vermelho.
- [ ] Estado :active com scale(0.98) + sombra menor (pressao).
- [ ] Estado :disabled com opacity 0.4 e cursor not-allowed.

## E. Componentes - inputs
- [ ] Border 1px var(--border), hover var(--border-2).
- [ ] Focus: ring 3px com cor da acao + border colorida.
- [ ] Placeholders com cor --text-3 e leve italic.
- [ ] Selects com chevron custom (SVG inline) em vez do default.

## F. Sidebar
- [ ] Logo com leve glow ambient + animacao subtle no carregamento.
- [ ] Items do menu com gradient ativo + hairline a esquerda.
- [ ] Indicador de live com pulse refinado.
- [ ] QR card como destaque (champagne accent na borda).

## G. Tela Ao Vivo
- [ ] Hero da musica com gradient mais rico no fundo.
- [ ] Numeros do BPM/Tom/Compasso com glow proprio.
- [ ] Acordes ativos com particle shimmer (subtle).
- [ ] Beat indicators com transicao spring (scale 1.0 -> 1.15 -> 1.0).
- [ ] Lyrics box com left border em gradient.
- [ ] Transport buttons com micro-animacoes de feedback.
- [ ] Phone preview com molde mais realista (notch, bezel mais fino).

## H. Tela Afinador (modelo do mockup)
- [ ] Arc meter circular com gradient na linha (verde -> amarelo -> vermelho).
- [ ] Note display gigante com glow halo difuso quando proximo da nota.
- [ ] Badge "AFINADO!" animado com bounce ao acertar.
- [ ] Toggle "Som da nota" no topo direito.
- [ ] Badge "AUTO" no topo esquerdo.
- [ ] Waveform em tempo real (mesma linha do meter, mais sutil).
- [ ] Sidebar direita com:
  - Instrumento (4 cards com icones SVG: guitarra, violao, baixo, violao 12c)
  - Afinacao atual com lista de cordas + nota esperada
  - Outras afinacoes (Drop D, Drop C, 5 cordas, custom)
  - Visual (Classico / Estrobo / Ondas)
  - Historico das ultimas notas detectadas
- [ ] Bottom info bar: precisao, entrada (-dB), latencia (ms).
- [ ] Adicionar modo "Estrobo" e "Ondas" como visualizacoes alternativas.

## I. Tela Repertorio
- [ ] Cards com gradient + numero/letra grande de identificacao.
- [ ] "AO VIVO" badge com pulse champagne.
- [ ] Hover lift mais expressivo (+ box shadow gold).
- [ ] Lista ordenada com numeracao monospace e mini bullet colorido.

## J. Tela Biblioteca
- [ ] Cards com hover preview de partes (mini timeline).
- [ ] Botoes de acao (edit/dup/del) com revelacao slide-in.
- [ ] Search com icone animado ao focar.
- [ ] Filter pills com gradient ativo e contagem dentro do pill.

## K. Tela Editor / Blocos
- [ ] Block cards com gradient sutil + accent colorido na esquerda (vermelho/verde/azul conforme tipo).
- [ ] Chord chips com sombra colorida sutil.
- [ ] Sugestoes de acorde com hover ring.
- [ ] Drag handle com hover refinado.
- [ ] Editor sticky footer com depth (sombra pra cima).

## L. Tela Timeline
- [ ] Tracks com cor lateral + label vertical estilizada.
- [ ] Clips com leve inner shadow e gradient.
- [ ] Playhead com triangulo dourado em vez de verde puro.
- [ ] Ruler com major beats em gold sutil.
- [ ] Mini mapa como "painting" da musica - mais artistico.
- [ ] Toolbar contextual flutuante com glassmorphism intenso.

## M. Tela Metronomo
- [ ] BPM gigante com efeito de respirar sincronizado.
- [ ] Big play button com gradient mais rico + ripple no click.
- [ ] Compass options com tags refinadas.
- [ ] Preset list com micro detalhes (faixa de BPM no hover).

## N. Tela Configuracoes
- [ ] Toggles refinados (iOS-style mas com glow ativo).
- [ ] Sections com headers de label discretos.
- [ ] Selects com chevron custom.
- [ ] Hint texts com icone i circular.

## O. Animacoes globais
- [ ] Page transition fade + slide (200ms).
- [ ] Hover springs em todos cards/botoes.
- [ ] Loader skeleton com shimmer dourado.
- [ ] Toast com slide + glow.
- [ ] Modal com backdrop blur intenso + scale entrada.

## P. Detalhes finais
- [ ] Favicon refinado.
- [ ] Splash screen com logo animada.
- [ ] Scrollbar customizada com gradient.
- [ ] Selection (::selection) com gold tint.
- [ ] Focus ring custom em todos focusable.
- [ ] Cursor hover em areas clicaveis.
- [ ] Smooth scroll global.

## Q. Limpeza
- [ ] Corrigir mojibake nos comentarios e strings (Â, Ã, etc).
- [ ] Padronizar todos emojis (usar SVG inline).
- [ ] Remover CSS duplicado / nao usado.
- [ ] Consolidar fallbacks de fonte.
