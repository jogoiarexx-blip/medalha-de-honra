# Sombras de Paris

FPS de espionagem na Segunda Guerra Mundial (Paris ocupada e Norte da África), feito em Three.js.
Arquivo único: `index.html` — sem build, sem dependências locais.

## Publicar no GitHub Pages
1. Crie um repositório (por exemplo `sombras-de-paris`) e envie **`index.html`** e **`.nojekyll`** para a raiz.
2. No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, pasta `/ (root)` → **Save**.
3. Em 1–2 minutos o jogo fica em `https://SEU-USUARIO.github.io/sombras-de-paris/`.

Para atualizar, é só substituir o `index.html` e fazer commit.

## Controles (teclado e mouse)
WASD mover · Shift correr · C agachar · Espaço pular · Botão esquerdo atirar · Botão direito mirar ·
R recarregar · 1–4 armas · E interagir (segure quando pedido) · V câmera · G/X granada · H guardar a arma ·
M planta · J diário · Esc pausa. Também funciona com controle e em tela de toque.

## Requisitos
Navegador moderno com WebGL (Chrome, Edge, Firefox, Safari). Se ficar lento, use Opções → Qualidade baixa.
O progresso e os checkpoints ficam salvos no próprio navegador (localStorage).

Bibliotecas carregadas por CDN: three.js r128 (cdnjs) e fontes do Google Fonts.
Versão gerada em 2026-11-08.
