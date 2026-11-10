# Medalha de Honra

FPS histórico de espionagem em Three.js/WebGL, distribuído pelo GitHub Pages.

## Estrutura

- `index.html`: documento HTML, telas, menus e referências a arquivos externos.
- `css/game.css`: estilos da interface, menus, HUD e acessibilidade.
- `js/`: sistemas e campanhas divididos por responsabilidade, carregados em ordem numérica.
- `audio/trilha_sombras_de_paris.mp3`: demonstração da trilha sonora. A música adaptativa do jogo é sintetizada pelo JavaScript.
- `assets/images/`: pasta para futuras texturas e artes.
- `assets/models/`: pasta para futuros modelos GLB.
- `js/modelos/soldado-meshy-dados.js`: o soldado 3D (modelo feito no Meshy) já otimizado para o jogo — carregado antes dos outros módulos.

## Compatibilidade

Os módulos são scripts clássicos, **não** ES Modules, porque o jogo original usa um ambiente compartilhado. A ordem em `index.html` é importante e precisa ser mantida. Não adicione `async` às tags. O estado de campanha e os saves continuam em `localStorage` nas mesmas chaves.

Não é necessário npm, Vite ou compilação. Execute por um servidor HTTP local, por exemplo `python -m http.server 8000`, e abra `http://localhost:8000`. Para publicar, envie toda a estrutura para o branch `main` e use GitHub Pages com raiz `/`.

**Atenção:** Three.js r128 e as fontes ainda vêm de CDN e exigem rede na primeira execução. Os demais sistemas e a música adaptativa ficam no código local do projeto.

## Testes

`node --check js/00-core.js` valida a sintaxe de um arquivo; verifique todos os módulos após mudanças. Teste o menu, primeira fase, combate, salvamento/carregamento e as 27 operações.

## Fonte de inspiração

Projeto independente inspirado em jogos históricos de espionagem. Para redistribuição, verifique os direitos sobre nomes e marcas de terceiros.

## Música original e ativação

- A trilha original é **gerada pelo próprio jogo** com o sistema MUS/Web Audio em `js/01-audio.js`: menu, exploração, tensão e combate, com variações por região.
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
- O modelo e a textura são compartilhados entre as instâncias; cada cão recebe um esqueleto e AnimationMixer próprios para caminhar independentemente.
- Se o GLB estiver ausente ou não carregar, o visual procedural anterior permanece como fallback. A tela inicial e a fase S1 continuam operacionais.
- Para depuração pelo console: `window.__PASTOR_MESHY.status` (loading/ready/fallback), `mounted` e `error`.
- Conferência estática executada: estrutura GLB válida, 27 ossos, 81 canais de animação, textura embutida, carregador r128 e ordem dos scripts. **A animação e aparência no navegador ainda exigem playtest visual.**
