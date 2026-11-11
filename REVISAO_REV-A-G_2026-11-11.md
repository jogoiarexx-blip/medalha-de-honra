# Revisão REV-A a REV-G — execução da Auditoria-Mestra (11/11/2026)

Build: `rev-abc-2026-11-11` (aparece no painel F3 e em `__SDP.build`).

Este documento liga cada item da auditoria ao que foi feito, ao arquivo alterado e ao teste que comprova. Status usados: **FEITO + TESTE AUTOMÁTICO**, **FEITO (verificação visual)**, **PARCIAL**, **NÃO FEITO**. Nada aqui declara fase "zerada" nem FPS de aparelho real.

## Itens P0 e P1 da seção 3

| Item | O que foi feito | Arquivos | Comprovação | Status |
|---|---|---|---|---|
| **P0-01** Save não validado | `validateCheckpoint()` (nunca lança; devolve motivo e lista de consertos), migração v1/v2 → v3, limites numéricos, armas/munição/dificuldade/missão conferidas contra o jogo, inimigos de reforço só com definição válida. Backup automático do último checkpoint íntegro (`sdp_checkpoint_bak`). Menu: Continuar só para save válido; aviso legível + "Descartar checkpoint" para save ilegível; uso do backup avisado. Ajustes (`sdp_settings`) e campanha (`sdp_campaign`) consertados ao iniciar. Checkpoint em memória deixou de ser alterado pelo jogo (listas eram compartilhadas). Falha ao aplicar um save recomeça a missão em vez de travar. | `08a-save-guard.js` (novo), `00-core.js`, `08-mission-framework.js`, `18-menu-system.js`, `24-secret-operations.js`, `15-africa-…`, `index.html`, `game.css` | `test_save_migration.cjs`: 14 payloads reprovados com motivo, 14 consertados **e carregados em jogo**, 7 menus com `localStorage` corrompido, backup e descarte | FEITO + TESTE AUTOMÁTICO |
| **P0-02** Acumulador perde tempo | Teto de 5 passos/quadro; o atraso que sobra é recuperado nos quadros seguintes; só o excedente acima de 100 ms é descartado e somado em `PERF.droppedSimMs`. Câmera e atores interpolados entre passos (sem interpolar teleporte). | `17-input-ui.js`, `00a-diagnostics.js` | `test_frame_pacing.cjs`: em 7 padrões de quadro, simulado + pendente + descartado = tempo real (±1 ms); zero descarte em 60/144/30 Hz e no padrão 16,7/40/80 ms da auditoria | FEITO + TESTE AUTOMÁTICO |
| **P0-03** Troca de missão sem descarte | Escopo de recursos "marca e varre": anota o que a cena antiga usava e, depois de montar a nova, libera só o que não está em nenhuma cena viva nem em cache global registrado. Troca de perfil de qualidade também libera os materiais antigos. | `02a-resource-scope.js` (novo), `08-mission-framework.js`, `25-boot.js` | `test_reloads_memory.cjs`: 10 fases, 10 reinícios, 10 idas ao menu sem tendência de crescimento; imagem da 01 igual antes/depois (sem rosa/preto) | FEITO + TESTE AUTOMÁTICO |
| **P0-04** Alternar modelos no menu | `MENU3D.destroy()` desmonta a sala, solta os cães e varre recursos depois da nova sala montada; falha ao montar a sala vira diagnóstico e menu sem cenário, não tela quebrada. Pastor: capacete com geometria/material compartilhados; lista de instâncias só com cães em cena viva. | `18-menu-system.js`, `24a-dog-meshy.js`, `24-secret-operations.js` | `test_reloads_memory.cjs`: 30 trocas de estilo sem crescimento, número de luzes constante, um único cão vivo | FEITO + TESTE AUTOMÁTICO |
| **P0-05** Testes não comprovam campanha | Matriz por operação com colunas explícitas (início, simulação, movimento, checkpoint, load, morte → recomeçar, conclusão forçada → próxima, menu). OBJETIVOS e EXTRACAO ficam `NÃO TESTADO`. Contrato estrutural das 27 operações. | `qa/test_operation_progress.cjs`, `qa/test_registry_27.cjs` | `qa-report/operacoes.md` | PARCIAL (a parte automatizável; playthrough humano continua pendente) |
| **P1-06** Pós-processo em tela inteira | Blur por perfil: Médio 1 sequência (5 passes), Alto 2 (7 passes), Baixo sem pós. Resolução adaptativa com histerese (Opções → Resolução adaptativa). Primeiro uso em aparelho de toque começa em Baixo. | `02-renderer.js`, `00-core.js`, `index.html` | `test_hardware_profiles.cjs` | FEITO + TESTE AUTOMÁTICO (ganho real em GPU: não medido) |
| **P1-07** LOD do soldado Meshy | LOD distante (≥ 44 m, corrigido pelo zoom, volta < 38 m): caixas clássicas fundidas numa malha presa ao mesmo esqueleto, 1 draw call e ~190 triângulos; cores conferidas contra a malha completa. Culling por frustum ligado nos corpos (antes desligado) com esfera que cobre em pé, agachado e caído. | `04-characters.js`, `06-actors.js` | Capturas comparativas; perfil Modelo 3D em `test_hardware_profiles.cjs` | FEITO (verificação visual) |
| **P1-08** Pintura de atlas em tempo real | Pré-aquecimento dos uniformes da operação (inimigos + reforços) durante o dossiê e o carregamento; limite de 8 atlas em cache com descarte dos que não estão em cena; pintura durante o combate fica registrada como `MZ_LATE_PAINT`. | `04-characters.js`, `06-actors.js` (`enemyLook`), `24-secret-operations.js` | `test_performance_scene.cjs` falha se houver pintura tardia | FEITO + TESTE AUTOMÁTICO |
| **P1-09** Alocações em caminhos quentes | Vetores de rascunho em viewmodel, `distPointSeg`, disparo inimigo e pesos do pastor; matriz de projeção só refeita quando FOV/proporção mudam; consultas `#id` memorizadas; HUD limitado a 60 Hz em monitores rápidos. | `17-input-ui.js`, `03-world.js`, `06-actors.js`, `02-renderer.js`, `00-core.js`, `18-menu-system.js`, `24a-dog-meshy.js` | Indireto (perfil de IA e de quadro) | FEITO |
| **P1-10** IA sem orçamento | Custo do laço de inimigos medido por passo; acima de 4 ms só o intervalo de "pensar" de quem está a > 30 m é alongado (até ×2,2). Rajadas de tiro não recalculam a rota de cada inimigo a cada disparo (era o maior pico medido). | `06-actors.js`, `17-input-ui.js` | `test_ai_budget.cjs` (10/25/40 inimigos alertas) | FEITO + TESTE AUTOMÁTICO |
| **P1-11** Documentação do pastor | README descreve o mecanismo real: 4 quadros da caminhada do GLB + 4 poses derivadas (repouso, deitado, mordida, alerta) em morph targets compartilhados; sem `AnimationMixer` por cão. | `README.md` | — | FEITO |
| **P1-12** Falhas sem feedback | `DIAG.report()` com código, estado, fase e versão; avisos discretos ao jogador quando algo muda o que ele vê (save, pós-processo, perda de contexto WebGL). Painel F3 ampliado. | `00a-diagnostics.js`, `02-renderer.js`, `25-boot.js`, `17-input-ui.js` | Falha simulada do pós em `test_hardware_profiles.cjs` | FEITO + TESTE AUTOMÁTICO |

## Medição antes × depois — memória de vídeo (mesmo roteiro, mesma máquina)

Roteiro: abrir a 01; passar por 05, 09, 13, 21 e S1; reabrir a 01; reiniciar a 01 mais 10 vezes; ir ao menu e trocar o estilo de personagem 30 vezes. Contagem do `renderer.info.memory` (geometrias / texturas na GPU).

| Momento | Original | Revisão |
|---|---:|---:|
| 01 aberta pela primeira vez | 330 / 66 | 330 / 59 |
| 01 de novo, após 5 outras fases | 1.758 / 233 | 345 / 77 |
| 01 após mais 10 reinícios | 3.650 / 486 | 345 / 77 |
| Menu após 30 trocas de estilo | 5.774 / 820 | 184 / 59 |

No original a memória crescia a cada troca e nunca voltava; na revisão estabiliza.

## Defeitos encontrados pelos testes novos e corrigidos

- **Operação 10:** reforço com ID `n1`, o mesmo da patrulha norte — ao carregar um checkpoint, um dos dois era tratado como o outro. Renomeado para `n4`.
- **Música do menu:** começar uma missão antes de a faixa tocar gerava `AbortError`, que marcava a música como "falha" e trocava o tema pelo sintetizado pelo resto da sessão.
- **Áudio:** sem limitador no mestre; várias explosões somadas podiam estourar a saída. Adicionado compressor/limitador.
- **`qa/test_three_local.js`:** falhava por não aceitar `?v=` nas tags de script. Corrigido para comparar o caminho.

## Suíte e CI

`node qa/run_all.cjs` executa tudo e grava `qa-report/RESUMO.md`. O workflow `.github/workflows/qa-campanha.yml` roda os testes estruturais e de navegador no GitHub Actions e publica `qa-report/` e `qa-shots/` como artefato.

## O que NÃO foi feito nesta revisão (e por quê)

- **REV-E (pele e poses do pastor), REV-H (combate polido), REV-I/J (narrativa), REV-K (veículos e chefes):** são trabalho de conteúdo e arte; a auditoria pede para não começá-los antes de estabilidade e memória (seção 13, "Não fazer agora").
- **Playthrough das 27 operações**, FPS em Android/PC reais e memória por 60 minutos: dependem de pessoa e aparelho. A captura deste ambiente usa renderização por software (SwiftShader) e serve só para comparar revisões.
- **Chunking de cenário, atlas de fachada e sombras por perfil (parte de REV-F):** não iniciados.
