# Medalha de Honra

FPS histórico de espionagem em Three.js/WebGL, distribuído pelo GitHub Pages.

## Estrutura

- `index.html`: documento HTML, telas, menus e referências a arquivos externos.
- `css/game.css`: estilos da interface, menus, HUD e acessibilidade.
- `js/`: sistemas e campanhas divididos por responsabilidade, carregados em ordem numérica.
- `audio/trilha_sombras_de_paris.mp3`: demonstração da trilha sonora. A música adaptativa do jogo é sintetizada pelo JavaScript.
- `assets/images/`: pasta para futuras texturas e artes.
- `assets/models/`: pasta para futuros modelos GLB.

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
