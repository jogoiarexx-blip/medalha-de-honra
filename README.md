# Medalha de Honra

FPS histórico de espionagem em Three.js/WebGL, distribuído pelo GitHub Pages.

## Estrutura

- `index.html`: documento HTML, telas, menus e referências a arquivos externos.
- `css/game.css`: estilos da interface, menus, HUD e acessibilidade.
- `js/`: sistemas e campanhas divididos por responsabilidade, carregados em ordem numérica (`00a-diagnostics`, `02a-resource-scope` e `08a-save-guard` entram logo após os módulos que complementam).
- `qa/`: testes automáticos (ver **Testes**).
- `audio/menu-principal.mp3`: música nova do menu, otimizada para MP3 estéreo de 96 kbps (~1,8 MB).
- `audio/trilha_sombras_de_paris.mp3`: amostra antiga, não reproduzida no menu. A trilha das missões continua sintetizada pelo jogo.
- `assets/images/`: pasta para futuras texturas e artes.
- `assets/models/`: pasta para futuros modelos GLB.
- `js/modelos/soldado-meshy-dados.js`: o soldado 3D (modelo feito no Meshy) já otimizado para o jogo — carregado antes dos outros módulos.

## Compatibilidade

Os módulos são scripts clássicos, **não** ES Modules, porque o jogo original usa um ambiente compartilhado. A ordem em `index.html` é importante e precisa ser mantida. Não adicione `async` às tags. O estado de campanha e os saves continuam em `localStorage` nas mesmas chaves.

Não é necessário npm, Vite ou compilação. Execute por um servidor HTTP local, por exemplo `python -m http.server 8000`, e abra `http://localhost:8000`. Para publicar, envie toda a estrutura para o branch `main` e use GitHub Pages com raiz `/`.

**Three.js r128 agora é servido localmente** por `js/vendor/three-r128.min.js` (licença MIT); o `GLTFLoader-r128.js` também fica no projeto. Isso evita os avisos de bloqueio de armazenamento do `cdnjs` para o motor 3D. As fontes externas ainda podem exigir rede, portanto o jogo completo não deve ser anunciado como offline sem testes específicos.

## Testes

Os testes ficam em `qa/` e cada um diz, na própria saída, o que cobre e o que **não** cobre.

```bash
for f in js/*.js; do node --check "$f"; done      # sintaxe de todos os módulos
node qa/run_all.cjs                                 # suíte completa (≈ 15–25 min)
node qa/run_all.cjs --rapido                        # sem a matriz das 27 fases e sem a captura de desempenho
node qa/test_operation_progress.cjs 01 09 S1        # matriz só das fases indicadas
QA_PERF_SECONDS=120 node qa/test_performance_scene.cjs   # protocolo de 2 min por cena
```

Os testes de navegador usam o Chromium do Playwright (`npm install --no-save playwright` + `npx playwright install chromium`) e sobem um servidor estático próprio (`qa/lib/harness.cjs`); não é preciso abrir servidor à parte. Os relatórios vão para `qa-report/` (`RESUMO.md`, `operacoes.md`, `desempenho.md`) e as capturas para `qa-shots/`. O workflow `.github/workflows/qa-campanha.yml` roda tudo no GitHub Actions e guarda esses relatórios.

| Teste | O que verifica |
|---|---|
| `test_registry_27.cjs` | Contrato estrutural das 24 + 3 operações (campos, objetivos, IDs, equipamento, final). |
| `test_operation_progress.cjs` | Por fase: início, 10 s de simulação, sair do lugar, checkpoint, load, morte → recomeçar, conclusão **forçada** → relatório → próxima, menu. |
| `test_save_migration.cjs` | Saves vazios, truncados, antigos (v1/v2), de versão futura e com campos corrompidos; backup do checkpoint; menu com `localStorage` estragado. |
| `test_frame_pacing.cjs` | Passo fixo: todo o tempo real é simulado, fica pendente ou é descartado **com registro** — nunca some em silêncio. |
| `test_state_transitions.cjs` | Menu → dossiê → jogo → documento → pausa → opções → checkpoint → relatório → menu, clicando nos botões. |
| `test_reloads_memory.cjs` | 10 trocas de fase, 10 reinícios, 10 idas ao menu e 30 trocas de estilo sem crescimento de geometrias/texturas; imagem da 01 idêntica antes/depois. |
| `test_hardware_profiles.cjs` | Baixo/Médio/Alto × três estilos de personagem, 5 formatos de tela, falha simulada do pós-processamento, primeiro uso em toque. |
| `test_audio_states.cjs` | Autoplay, limitador, 30 alternâncias menu/fase, volumes, mudo, rajada de sons. |
| `test_ai_budget.cjs` | Custo medido do passo com 10/25/40 inimigos alertas. |
| `test_glb_assets.cjs` | Todo `.glb`: contêiner, índices, UV, pesos de skin, ossos e animações. |
| `test_performance_scene.cjs` | FPS, p50/p95/p99, 1% low, draw calls e memória por cena. Em headless a renderização é por **software**: serve para comparar revisões, não como FPS de aparelho. |

**Status honesto:** nenhum teste automático declara uma fase "zerada". Jogar os objetivos até a extração, FPS em Android/PC reais e memória por 60 minutos continuam `NÃO TESTADO` até haver registro humano.

## Robustez, diagnóstico e desempenho (REV-A a REV-G, 11/11/2026)

- **Saves validados** (`js/08a-save-guard.js`): todo checkpoint passa por `validateCheckpoint()` antes de entrar no jogo. Campos opcionais ausentes (v1/v2) são migrados; campos essenciais inválidos reprovam o save com motivo legível. O checkpoint anterior íntegro fica em `sdp_checkpoint_bak`. Se o principal estiver ilegível, o menu avisa e oferece a cópia; se nenhum servir, avisa e oferece "Descartar checkpoint" — a campanha concluída nunca é apagada. Ajustes e registro de campanha também são consertados ao iniciar.
- **Passo fixo sem perda silenciosa** (`js/17-input-ui.js`): até 5 passos por quadro; o atraso que sobra é recuperado nos quadros seguintes e só o que passa de 100 ms é descartado, somado em `droppedSimMs`. Câmera e inimigos são desenhados interpolados entre passos.
- **Memória de GPU** (`js/02a-resource-scope.js`): ao trocar de fase ou reconstruir a sala do menu, o que a cena antiga usava é liberado se não estiver mais em uso em nenhuma cena viva nem em caches globais. Atlas do soldado 3D limitados a 8 e pré-aquecidos durante o dossiê/carregamento.
- **Soldado 3D com LOD**: a partir de ~44 m (corrigido pelo zoom, com histerese) a malha completa dá lugar a uma versão de caixas fundidas presa ao mesmo esqueleto — 1 draw call, ~190 triângulos. Corpos têm esfera de recorte, então quem está fora da câmera não é desenhado.
- **Pós-processamento por perfil**: Baixo sem pós; Médio com 1 sequência de blur (5 passes); Alto com 2 (7 passes). Falha no pós vira render direto com aviso, nunca tela preta.
- **Resolução adaptativa** (Opções, ligada por padrão): mede janelas de 2 s e reduz a escala em degraus de 10% até 60% quando o quadro passa do orçamento; volta em degraus de 5% após folga sustentada, com espera crescente a cada recaída. No primeiro uso em aparelho de toque o perfil inicial é Baixo.
- **IA com orçamento medido**: o custo do laço de inimigos é medido a cada passo; se passar de 4 ms, só o intervalo de "pensar" de quem está a mais de 30 m é alongado. Uma rajada de tiros não refaz mais a rota de cada inimigo a cada disparo.
- **Diagnóstico** (`js/00a-diagnostics.js`): falhas recebem código, estado e versão (`BUILD_ID`) e aparecem no console e no painel **F3**, que agora mostra p50/p95/p99, 1% low, tempo descartado, memória de vídeo, escala de resolução, atlas e LOD. No console: `__SDP.perf()` e `__SDP.DIAG.log`.
- Correções encontradas pelos testes: ID de reforço duplicado na operação 10 (`n1`); música do menu marcada como "falha" quando a missão começava antes de a faixa tocar; limitador no barramento mestre de áudio.

## Fonte de inspiração

Projeto independente inspirado em jogos históricos de espionagem. Para redistribuição, verifique os direitos sobre nomes e marcas de terceiros.

## Música original e ativação

- **Menu principal:** reproduz em loop `audio/menu-principal.mp3` após um clique/toque/tecla. O menu deixa de tocar a melodia sintetizada por cima.
- **Missões:** continuam usando MUS/Web Audio em `js/01-audio.js` (exploração, tensão e combate). Em caso de erro de carregamento, o menu usa o tema sintetizado anterior.
- `js/01a-menu-track.js` conecta o MP3 ao controle de volume de música existente.
- Clique em **Ativar trilha sonora** no menu ou interaja com uma tecla/click em qualquer opção para liberar o áudio após a primeira interação. Essa exigência vem dos navegadores.
- Em **Opções**, ajuste **Volume da música** acima de zero. Se estiver no mudo, a trilha permanece silenciosa por preferência do jogador.
- `audio/trilha_sombras_de_paris.mp3` é uma **amostra de referência** e não substitui a composição dinâmica.
- Todos os arquivos JavaScript e os áudios estão fora da pasta `assets/`. A pasta `assets/` contém somente imagens/modelos.

Verifique o comportamento em um navegador com áudio: abrir menu, clicar Ativar trilha sonora, iniciar missão, aproximar-se de um inimigo e testar combate, volume e retorno ao menu.

## Soldado 3D (modelo do Meshy)

- O soldado enviado pelo autor (GLB com rig Mixamo, ~230 mil triângulos) foi reduzido para **~12 mil triângulos**, mantendo as UVs e a textura.
- O esqueleto Mixamo (66 ossos) foi convertido para os **16 ossos do jogo**; braços, pernas e tronco foram ajustados às proporções do jogo, então todas as animações existentes (andar, mirar, agachar, deitar, render-se, morrer) funcionam sem mudanças.
- **Textura por fase:** a textura original é repintada no navegador a partir das cores de cada inimigo (`uniform`, `pants`, `helmetColor`, `skin`): cinza-campo em Paris, cáqui no deserto, uniformes italianos, branco na neve, oficiais escuros etc. Uma máscara separa túnica, calça e capacete; pele, botas e cinto ficam como no original. Peles "não humanas" (zumbi, robô) também são tingidas.
- O capacete é uma peça separada: quando um tiro derruba o capacete, ele voa e aparece o cabelo. Oficiais e soldados de quepe/boina usam o mesmo corpo com o quepe do jogo.
- Em **Opções → Personagens** dá para escolher entre *Modelo 3D (soldado novo)*, *Detalhados* e *Clássicos (blocos)*.
- As caixas de acerto não mudaram: tiros na cabeça, capacete, desarme e rendição funcionam como antes.


## Pastor alemão — GLB animado otimizado (10/11/2026)

- O arquivo `assets/models/pastor-alemao-animado.glb` é um modelo autoral fornecido pelo projeto, otimizado para ~438 KB (12.245 triângulos; antes 12,4 MB e 163.975 triângulos).
- Preservados os 27 ossos e a animação de caminhada original (81 canais de animação). Textura convertida para JPEG 512×512, com pesos de skin compactados.
- O `js/24a-dog-meshy.js` carrega esse GLB com `js/vendor/GLTFLoader-r128.js` após os módulos do jogo e antes do `boot`.
- Substitui **apenas a apresentação visual** do cachorro do menu e dos cães da fase secreta S1; lógica de movimentação, ataques, dano, hitboxes e objetivos continuam inalterados.
- **Como o cão anima (modelo "poses assadas")**: ao carregar, o `js/24a-dog-meshy.js` toca a animação de caminhada do GLB uma única vez e grava **4 quadros** dela como alvos de morph (poses 0–3). As poses 4–7 **não existem no arquivo** e são derivadas: 4 = repouso neutro, 5 = deitado/morto (repouso achatado a 64% da altura), 6 = mordida (cabeça e focinho avançados 12 cm), 7 = alerta (cabeça erguida 6 cm). Não há esqueleto nem `AnimationMixer` por cão em jogo: todos compartilham uma geometria com 8 morph targets, e cada cão só mistura os pesos (caminhada interpolada entre os 4 quadros conforme a velocidade). Por isso a caminhada é uma aproximação de 4 quadros, e mordida/alerta/deitar são deformações simples — não animações capturadas.
- Modelo, textura, material e capacete são compartilhados entre as instâncias; a lista interna de cães só mantém os que estão em cena (missão atual ou menu).
- Se o GLB estiver ausente ou não carregar, o visual procedural anterior permanece como fallback. A tela inicial e a fase S1 continuam operacionais.
- Para depuração pelo console: `window.__PASTOR_MESHY.status` (loading/ready/fallback), `mounted` e `error`.
- Conferência: `qa/test_glb_assets.cjs` valida o arquivo (contêiner, índices, UV, pesos, 27 ossos, 81 canais) e `qa/browser_pastor_diagnostico.cjs` valida o carregamento no menu e na S1. **A naturalidade do movimento ainda exige avaliação visual humana.**
