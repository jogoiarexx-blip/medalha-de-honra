# Medalha de Honra — análise, melhorias e checkpoint

Atualizado em **14/11/2026 (Brasil)**. Documento de continuidade: ler antes de cada nova alteração e atualizar ao encerrar o trabalho.

## 1. Onde paramos

| Campo | Estado |
|---|---|
| Repositório correto | https://github.com/jogoiarexx-blip/medalha-de-honra |
| Base analisada | `edca70c8f74a736921939ca149e9e83e9decea50` (`main`) |
| Build atual | `cp02a-2026-11-14` |
| Entrega atual | CP-02A: alturas de aliados e feedback de armadura/capacete; CP-01 preservado |
| Mudança de gameplay nesta revisão | Altura de aliados, feedback de armadura e neutralização via capacete corrigidos; ver CP-02A ao final |
| Etapa atual | CP-02A ENTREGUE; CP-02B pendente; CP-01 com percurso/aparelho pendentes |
| Próximo trabalho | CP-02B: colisão vertical e restauração de altura do aliado; percurso completo e Android seguem pendentes |
| Campanha | 24 operações principais + 3 secretas registradas |
| Fases com percurso humano comprovado | Nenhuma |
| Integração da operação 01 | Objetivos, save/load e extração aprovados no Chromium com posições controladas; percurso normal pendente |

**Ponto de retomada:** CP-02A entregue e validado automaticamente. Próximo desenvolvimento: CP-02B, começando por raios verticais em `03-world.js` e altura do aliado ao restaurar save em `08-mission-framework.js`. MH-04 (percurso completo) e Android físico continuam pendentes; não refazer correções de CP-01/02A.

## 2. O que já existe e deve ser preservado

O jogo é um FPS histórico de espionagem em Three.js r128/WebGL, com scripts clássicos em ambiente compartilhado. Não exige build npm. A ordem dos scripts em `index.html` faz parte do funcionamento.

O código já contém combate por regiões do corpo, capacete destacável, ferimentos nos membros, desarme, rendição, cobertura e supressão, aliado, disfarce/credenciais, fotografia, documentos, veículos e operações secretas. A existência desses sistemas não comprova o acabamento nem todas as combinações em jogo.

A revisão anterior implementou validação/migração de saves, backup de checkpoint, descarte de recursos, LOD dos soldados, resolução adaptativa, orçamento de IA e diagnóstico F3. Não refazer esses sistemas do zero; medir e estender os existentes.

Preservar:

- Chaves de persistência existentes, incluindo `sdp_settings`, `sdp_campaign`, `sdp_checkpoint` e `sdp_checkpoint_bak`; validar compatibilidade de saves antigos.
- As 27 operações, desbloqueios, objetivos opcionais e final da campanha.
- Perfis Baixo/Médio/Alto, personagens alternativos e fallbacks de modelos/áudio.
- Fluxo de menu, dossiê, missão, pausa, documento, relatório e retorno ao menu.
- Estilo histórico de espionagem e desempenho no celular.

## 3. Diagnóstico com evidências

Esta seção descreve a base original analisada. Para o estado após as correções, consultar o registro CP-01 ao final; não repetir tarefas já implementadas.

### MH-01 — estado de entrada no celular (P0, risco identificado por leitura)

Em `js/17-input-ui.js`, o callback `pointermove` da área de olhar verifica ponteiro e `G`, mas não verifica `playing()`, `UI.frozen()` ou morte. O `blur` limpa teclado e disparo, porém não zera `touchState.move/look/fire/use`; a pausa automática nesse evento exclui toque.

**Consequência possível:** câmera mudar com tela sobreposta ou movimento/disparo persistir ao alternar de aplicativo. Falta reproduzir no navegador e em Android; não registrar como bug corrigido apenas pela leitura.

**Trabalho:** centralizar limpeza das entradas transitórias, revisar pausa/retomada, cancelamento de ponteiro e perda de foco. Ao retornar, exigir nova intenção do jogador antes de andar/atirar.

**Aceite:** mover, mirar e atirar simultaneamente; abrir pausa/documento; cancelar toque; alternar aplicativo; retomar sem movimento, tiro ou câmera presos. Repetir com teclado e controle para evitar regressão.

### MH-02 — dicas por dispositivo e controle (P1, limitação confirmada no código)

`updateInteraction()` escolhe apenas `USAR` no toque ou `E` nos demais dispositivos. O controle usa botão 0 para interação, mas o texto continua sendo de teclado. A operação 01 também orienta `G` para chamar Lucien, inclusive quando outros dispositivos estão em uso.

**Trabalho:** identificar último dispositivo ativo e apresentar comando correspondente; revisar os textos de rádio/tutorial e a ajuda. Sensibilidade de mira e zona morta configuráveis entram depois do fluxo básico validado.

**Aceite:** alternar teclado → controle → toque atualiza a dica, sem perder ação nem mostrar botões indisponíveis. A ação de seguir/aguardar aliado precisa ser descoberta no celular.

### MH-03 — callbacks após mudança de missão (P0, risco identificado por leitura)

Em `js/09-paris-operations-01-03.js`, abrir a garagem agenda `checkpoint()` após 2,3 s verificando apenas se `G` existe; a dica da extração também altera `G.flags` depois de 8 s. Como `G` é global e muda entre missões, um callback antigo pode atuar na nova sessão.

**Trabalho:** inventariar timers de gameplay; associá-los à identidade da missão/sessão e cancelar ou ignorar tarefas antigas. Preservar timers de interface que tenham ciclo de vida diferente.

**Aceite:** abrir garagem e sair/reiniciar/trocar fase antes do callback; nenhum checkpoint ou flag da nova missão deve ser alterado pelo callback antigo.

### MH-04 — conclusão real das fases ainda sem comprovação (P0)

`qa-report/operacoes.md` registra início, movimento, save/load e transição automática. O próprio relatório informa que a conclusão é forçada e que OBJETIVOS/EXTRAÇÃO permanecem NÃO TESTADO para as 27 operações.

**Trabalho:** criar evidência de progressão pelos objetivos reais, começando pela operação 01. Testes automatizados podem acionar entradas/interações normais, mas não chamar conclusão diretamente para declarar uma fase terminável.

**Aceite:** menu → dossiê → objetivos reais → extração → relatório → próxima operação, com save/load durante o percurso e sem console de trapaça.

### MH-05 — custo de desenho dos cenários (P1, medição histórica)

O relatório de 11/11 registra 735 draw calls na operação 01, 1.954 na 09 e 798 na 21 (perfil Médio). Os FPS desse relatório são de SwiftShader por software e não representam Android/PC real.

**Trabalho:** estabelecer cena/câmera de referência; agrupar geometria estática por material, instanciar peças repetidas, avaliar atlas de fachadas e setores de cenário. Manter portas, peças destrutíveis e objetos interativos separados.

**Meta proposta, ainda não validada:** reduzir pelo menos 25% das draw calls na cena de referência da 09 sem alteração visual relevante; buscar 30 FPS estáveis no perfil Baixo em Android de referência e 60 FPS em PC com GPU definido para teste. Registrar aparelho, resolução, p95 e memória antes/depois.

### MH-06 — animações e feedback (P1/P2, acabamento a avaliar)

O soldado já usa rig/animação do jogo, portanto não presumir que esteja sem animações. O pastor usa quatro amostras de caminhada e poses derivadas; não há animação capturada completa para mordida/alerta/deitar.

**Trabalho:** comparar andar/correr/mirar/agachar/ferir/morrer em três distâncias e nos três estilos; ajustar transições, pé deslizando e sincronização com velocidade apenas onde observados. Melhorar poses do pastor mantendo geometria compartilhada.

**Aceite:** vídeo/capturas de comparação, sem braço atravessando arma, salto de pose no LOD ou aumento contínuo de memória. Avaliar visualmente e registrar o que permanece aproximado.

## 4. Plano de entregas pequenas

As prioridades e soluções são recomendações desta análise. O GDD continua referência de design; este arquivo acompanha o estado real e não transforma checklists antigos em tarefas concluídas.

| Checkpoint | Escopo | Arquivos principais | Condição para fechar | Estado |
|---|---|---|---|---|
| CP-00 | Análise e continuidade | Este arquivo, README | Evidências, prioridades e retomada registradas | CONCLUÍDO — documentação |
| CP-01 | Entradas/estados e operação 01 | `17-input-ui.js`, `09-paris-operations-01-03.js`, `08-mission-framework.js`, QA | MH-01/02/03 tratados conforme reprodução + percurso real da 01 | EM ANDAMENTO |
| CP-02 | Combate e IA legíveis | `06-actors.js`, `07-player-combat.js`, `12-combat-extensions.js`, `05-effects.js` | Acerto/parede/capacete/desarme/rendição testados sem dano duplicado | CP-02A entregue; CP-02B pendente |
| CP-03 | Paris com acabamento | `03-world.js`, `09-paris-operations-01-03.js`, `11-paris-operation-04.js`, CSS | Operações 01–04 jogadas; iluminação, navegação e props revisados | PROPOSTO |
| CP-04 | Desempenho e opções | `02-renderer.js`, `02a-resource-scope.js`, cenários, QA | Medição comparável; otimização sem regressão de colisão/interação | PROPOSTO |
| CP-05 | Campanhas restantes | Módulos das operações 05–24 | Cada operação validada até extração; chefes/veículos e créditos incluídos | PROPOSTO |
| CP-06 | Secretas e entrega geral | `24-secret-operations.js`, `24a-dog-meshy.js`, QA | S1–S3, replay, áudio e sessão longa verificados | PROPOSTO |

### CP-01 — roteiro concreto da próxima sessão

- [x] Confirmar HEAD atual e reler este checkpoint e os arquivos afetados.
- [x] Disponibilizar Chromium no GitHub Actions para executar a infraestrutura de navegador existente.
- [x] Reproduzir MH-01 e MH-03 antes de implementar correção; registrar passos e resultados.
- [x] Ajustar dicas de controle/toque de MH-02 e conferir ação de aliado (fixture automatizada).
- [ ] Iniciar operação 01 e encontrar Lucien na praça da fonte.
- [ ] Obter a chave no posto; repetir variante em que a chave é pega antes da conversa.
- [ ] Sabotar rádio antes do alarme e repetir com alarme acionado, sem exigir o opcional para terminar.
- [ ] Obter Sten e ler documento; retornar ao jogo sem ficar preso em telas.
- [ ] Abrir garagem; testar Lucien seguindo, aguardando e caído/reanimado.
- [ ] Salvar/carregar antes e depois dos objetivos; verificar chave, porta, rádio, munição e aliado.
- [ ] Chegar ao caminhão com Lucien e concluir pela condição real da missão.
- [ ] Conferir relatório, operação 02, retorno ao menu e retomada do progresso.
- [ ] Executar verificações pertinentes e registrar resultado por dispositivo.

### Melhorias de sensação de jogo para CP-02/03

1. **Armas:** revisar recarga, recuo e recuperação já existentes; diferenciar pistola, silenciada e Sten pelo som e movimento, mantendo mira legível.
2. **Impactos:** reforçar contraste entre parede, metal, vidro, corpo e capacete; limitar partículas/decal por perfil, com feedback básico no Baixo.
3. **IA:** avaliar a investigação, perda de contato e cobertura existentes; evitar respostas instantâneas injustas e aliados travando em gargalos.
4. **Cenários:** fachadas menos repetidas, sinalização de rotas, interiores com objetos úteis e luz direcionando o percurso; evitar iluminação que esconda itens críticos.
5. **Narrativa:** rádio curto e contextual, sem mensagens repetidas após load; revisar trechos de disfarce/fotografia conforme as campanhas forem testadas.
6. **Veículos/chefes:** padrões claros, aviso antes de ataques e checkpoint antes de sequências longas; começar pela lancha 09 e sidecar 20 quando suas campanhas entrarem em revisão.

## 5. Matriz de campanha para atualizar

A operação 01 tem integração automatizada aprovada com posicionamento controlado; seu percurso normal ainda está pendente. As demais operações continuam sem comprovação de objetivos/extração nesta revisão. Relatórios de transição forçada não comprovam partida concluída.

| Operação | Nome | Objetivos reais | Extração/final | Evidência nova |
|---|---|---|---|---|
| 01 | Encontro à Meia-Noite | PASSOU — fixture | PASSOU — fixture | `qa/test_cp01_browser.cjs`; percurso normal pendente |
| 02 | Entre os Mortos | NÃO TESTADO | NÃO TESTADO | — |
| 03 | Sem Deixar Rastro | NÃO TESTADO | NÃO TESTADO | — |
| 04 | Pise com Cuidado | NÃO TESTADO | NÃO TESTADO | — |
| 05 | O Hotel da Medina | NÃO TESTADO | NÃO TESTADO | — |
| 06 | Acendendo a Tocha | NÃO TESTADO | NÃO TESTADO | — |
| 07 | Areias em Chamas | NÃO TESTADO | NÃO TESTADO | — |
| 08 | Uma Aliada no Deserto | NÃO TESTADO | NÃO TESTADO | — |
| 09 | A Matéria do Porto | NÃO TESTADO | NÃO TESTADO | — |
| 10 | O Que Há em Cnossos | NÃO TESTADO | NÃO TESTADO | — |
| 11 | Labirinto | NÃO TESTADO | NÃO TESTADO | — |
| 12 | Subida a Schwarzfels | NÃO TESTADO | NÃO TESTADO | — |
| 13 | Valhala Sombrio | NÃO TESTADO | NÃO TESTADO | — |
| 14 | Círculo Vicioso | NÃO TESTADO | NÃO TESTADO | — |
| 15 | O Desvio | NÃO TESTADO | NÃO TESTADO | — |
| 16 | Prisioneiros de Guerra | NÃO TESTADO | NÃO TESTADO | — |
| 17 | Caos no Mosteiro | NÃO TESTADO | NÃO TESTADO | — |
| 18 | Planos de Destruição | NÃO TESTADO | NÃO TESTADO | — |
| 19 | Sabotagem! | NÃO TESTADO | NÃO TESTADO | — |
| 20 | Fuga de Sidecar | NÃO TESTADO | NÃO TESTADO | — |
| 21 | Levante Final | NÃO TESTADO | NÃO TESTADO | — |
| 22 | Rua por Rua | NÃO TESTADO | NÃO TESTADO | — |
| 23 | Operação Mercado | NÃO TESTADO | NÃO TESTADO | — |
| 24 | Fim da Linha | NÃO TESTADO | NÃO TESTADO | — |
| S1 | Onde os Cães Ousam | NÃO TESTADO | NÃO TESTADO | — |
| S2 | Podre até o Osso | NÃO TESTADO | NÃO TESTADO | — |
| S3 | Eu, Ferrolho | NÃO TESTADO | NÃO TESTADO | — |

## 6. Verificação realizada nesta análise

Em 14/11/2026, sobre a base informada no início:

| Verificação | Resultado | Limite |
|---|---|---|
| `node --check` em todos os `js/*.js` | PASSOU | Sintaxe; não valida execução das fases |
| `qa/test_three_local.js` | PASSOU | Motor local, ordem e fallback |
| `qa/test_menu_principal.js` | PASSOU | Estrutura/integração da música |
| `qa/test_material_paris.js` | PASSOU | Regressão estrutural de fachadas |
| `qa/test_fase9_lancha_refinada2.js` | PASSOU | Estrutura da lancha/cais/objetivo |
| `qa/test_pastor_visibilidade.js` | PASSOU | Estrutura do asset e integração; não é avaliação visual |
| `qa/test_glb_assets.cjs` | PASSOU | Um GLB, 12.245 triângulos, 27 ossos, 81 canais íntegros |
| `qa/test_registry_27.cjs` | BLOQUEADO | Chromium headless shell requerido pelo Playwright ausente; não iniciou o navegador |
| `qa/test_frame_pacing.cjs` | BLOQUEADO | Mesmo impedimento de ambiente |
| Suíte completa de navegador / partida real / Android físico | NÃO EXECUTADO | Não inferir aprovação a partir dos testes estruturais |

Os resultados de navegador em `qa-report/RESUMO.md`, datados de **11/11/2026**, foram lidos como histórico e não foram reexecutados nem sobrescritos nesta análise.

## 7. Como usar este arquivo como checkpoint

Estados permitidos: **PROPOSTO**, **PENDENTE**, **EM ANDAMENTO**, **BLOQUEADO**, **IMPLEMENTADO — NÃO VALIDADO**, **VALIDADO**, **CONCLUÍDO — documentação**. Não marcar uma melhoria de jogo como VALIDADA sem implementação e evidência.

No início: conferir commit atual e diferenças desde a base; ler “Onde paramos”; escolher o próximo item pendente com dependências resolvidas. Em pedidos como “próxima”, usar o próximo checkpoint aberto, sem reiniciar a auditoria inteira.

No fim: atualizar estado, arquivos, teste e próximo passo. Registrar commit verificável depois da publicação. Se interrompido, descrever a alteração parcial e o comando para reproduzir; não deixar apenas “continuar melhorias”. O checkpoint de desenvolvimento deste MD é diferente do save de gameplay do jogador.

### Modelo de atualização

```md
### CP-XX — título — DD/MM/AAAA
- Base/commit da implementação:
- IDs tratados:
- Estado:
- Comportamento anterior e resultado atual:
- Arquivos alterados:
- Testes executados e resultados:
- Dispositivo/navegador/perfil gráfico:
- Pendências e riscos:
- Próximo passo exato:
```

### Histórico

- **14/11/2026 — CP-00:** repositório identificado, GDD/código/relatórios analisados, seis testes estruturais e sintaxe aprovados; navegador bloqueado por Chromium ausente. Plano CP-01 a CP-06 criado. Nenhuma melhoria de gameplay implementada nesta entrega. Próximo passo: CP-01, começando por entradas/estados e ciclo real da operação 01.

### Plano de execução CP-01 (autorizado em 14/11/2026)

- [x] Reproduzir entradas presas, câmera em pausa e callback de missão antiga; regressões isoladas antes das correções e integração Chromium depois.
- [x] Limpar entradas nas transições, aguardar soltar controle na retomada e impedir ações de toque fora do jogo.
- [x] Dicas por último dispositivo, botão ALIADO e orientações da operação 01.
- [x] Vincular timers de gameplay à sessão e ao tempo de simulação; inventariar demais callbacks.
- [x] Validar interações/objetivos da operação 01 sem chamar conclusão diretamente; distinguir fixture automatizada de partida humana.
- [x] Executar suíte, revisar diff e atualizar checkpoint; integrar pela PR #1 após aprovação dos testes.

Arquitetura: manter scripts clássicos e saves; centralizar limpeza em `17-input-ui.js`, filas de tarefas por missão em `08-mission-framework.js` e executar tarefas no passo de simulação. Testes em `qa/`, sem dependências de produção novas.

Foco de revisão: toque cancelado/perda de foco, controle mantido ao retomar, documento sobre pausa, reinício da mesma fase e callbacks agendados antes da conclusão.

### CP-01 — controles, foco e tarefas de missão — 14/11/2026

- Estado: CORREÇÕES VALIDADAS AUTOMATICAMENTE. CP-01 permanece aberto para percurso normal e teste em aparelho.
- MH-01: limpeza central ao abrir telas, iniciar/reiniciar missão, ir ao menu e perder foco/visibilidade; toque não altera câmera nem ativa ações em pausa/documento. Teclas e controle mantidos precisam ser liberados antes da retomada.
- MH-02: interação mostra E, A / ✕ ou USAR conforme último dispositivo; tutoriais da 01 adaptados; botão de aliado no toque passou de G para ALIADO. Toque inativo não anula mais disparo do controle.
- Revisão adicional: desconectar controle com gatilho pressionado deixava tiro/mira ativos; regressão reproduzida e corrigida, reconexão aguarda neutro.
- MH-03: fila de tarefas em cada sessão (`missionAfter`/`tickMissionTasks`), executada no tempo simulado. Garagem/dicas da 01 e mensagens/conclusões atrasadas das operações 07/08/09/23 migradas. Reiniciar a mesma fase também descarta tarefas anteriores; pausa/documento suspendem contagem.
- Timers de UI permanecem em tempo real; falha por morte já captura identidade da sessão. Tarefas não entram no formato de save.
- Arquivos: módulos de entrada/estados, estrutura de missão, operações citadas, index, diagnóstico, QA e workflow. Saves mantêm as mesmas chaves e versão.
- Evidência local: oito regressões em Node VM aprovadas (handlers de produção com DOM/gamepad mínimos); seis testes estruturais e sintaxe aprovados. Novas regressões foram observadas falhando antes das correções.
- Limite local: Chromium instalado no sistema, mas execução bloqueada por `socket() failed: Operation not permitted`. Integração de navegador executada e aprovada no GitHub Actions.
- Teste novo `qa/test_cp01_browser.cjs`: telas/entrada/sessão e objetivos da 01 por interações reais com posicionamento controlado. Não representa percurso humano, navegação sem teleporte, avaliação visual ou Android físico.
- Próximo passo exato: testar o percurso normal da 01 (incluindo alarme, aliado caído, carregamento e extração) e desempenho Android. Correções de entrada e sessão não devem ser refeitas. Depois, iniciar CP-02 (combate e IA legíveis).

### Registro de revisão e diagnóstico de QA

- Revisão independente do diff: nenhum defeito importante novo identificado; foi encontrado um defeito herdado no escopo de entrada (controle desconectado deixava gatilhos ativos). Teste adicional reproduziu a falha e passou após a correção.
- Limitação menor mantida: dispositivos híbridos com atividade contínua no controle podem priorizá-lo sobre o toque; verificar ergonomia em aparelho real.
- Tentativa local da suíte rápida: sete entradas de teste passaram, dez entradas de navegador não iniciaram por Chromium do Playwright ausente. Tentativa com Chromium do sistema também bloqueada por restrição de socket. Resultados locais não substituem a execução de CI.
- Primeira execução de CI `43659271922`: CP-01 e contrato das 27 operações passaram; migração de saves parou por cancelamento do stream MP3 durante recarga. O harness foi corrigido para registrar a causa e aceitar apenas `net::ERR_ABORTED` do MP3 do menu enquanto a navegação está em andamento. Outras URLs, causas e cancelamentos fora da navegação continuam como erro; regressão isolada adicional aprovada (9 testes Node no total).
- Segunda execução de CI `43659575335`: CP-01, registro de operações, saves/migração/backup e passo fixo aprovados; demais resultados serão registrados ao concluir.
- Segunda execução: também encontrou um limite de tempo frágil no teste de retomada (400 ms, menor que um quadro em renderização por software). `test_state_transitions.cjs` passou a aguardar avanço real da simulação, com timeout de 10 s e estado/stack no diagnóstico; a terceira execução aprovou a transição.
- Terceira execução `43659803130`, commit de código `7c1acd4b9ac46619a7e39e6c6f1c4e5a639f462c`: CP-01, contrato, saves, passo fixo, telas, memória, perfis gráficos, áudio e IA aprovados. Matriz das 27 operações e captura comparativa de desempenho também APROVADAS. Jobs estrutural e navegador concluídos com sucesso.

### Resultado final automatizado — CP-01

- Código testado: `7c1acd4b9ac46619a7e39e6c6f1c4e5a639f462c`; a atualização posterior deste checkpoint altera somente documentação.
- CI aprovado: https://github.com/jogoiarexx-blip/medalha-de-honra/actions/runs/43659803130
- Integração/publicação: PR https://github.com/jogoiarexx-blip/medalha-de-honra/pull/1

| Verificação nova | Resultado | Escopo comprovado |
|---|---|---|
| 9 regressões Node + sintaxe + 6 testes estruturais | PASSOU | Entradas/tarefas, diagnóstico de requisições e estrutura de assets |
| CP-01 Chromium | PASSOU | Toque/documentos/foco, controle híbrido, reinício e objetivos/save/extração da 01 em fixture |
| Contrato das 27 operações | PASSOU | Registro e consistência estrutural |
| Saves/migração/backup | PASSOU | 14 payloads rejeitados, 14 reparados/carregados, 7 menus com dados corrompidos |
| Passo fixo e telas | PASSOU | Contabilização do tempo; menu/documento/pausa/retomada/checkpoint/relatório |
| Memória e perfis gráficos | PASSOU | Recarregamentos/trocas, 3 perfis × 3 estilos, 5 formatos e primeiro uso em toque simulado |
| Áudio e orçamento da IA | PASSOU | Estados de áudio e cenários de IA da suíte existente |
| Matriz de 27 operações | PASSOU | Início, simulação, movimento, save/load, morte/reinício, transição forçada e menu |
| Captura de desempenho | PASSOU | Comparação por software; não certifica FPS de aparelhos reais |
| Percurso completo sem posicionamento controlado / Android físico | PENDENTE | Nenhuma alegação de campanha zerada ou desempenho real |

**Checkpoint de retomada:** CP-01 — validação de percurso/aparelho pendente; código de MH-01/02/03 entregue. Evitar reiniciar esta auditoria ou refazer os handlers. Se o teste real apontar falha, registrar reprodução e corrigir antes de CP-02.

### Plano CP-02A — combate e IA em diferentes alturas — 14/11/2026

Escopo desta entrega: corrigir alturas de percepção/colisão dos aliados; distinguir acerto em armadura de corpo; indicar quando o dano transferido pelo capacete neutraliza o alvo. Preservar dano, dificuldade, hitboxes anatômicas, saves e três estilos de personagem. CP-01 continua com percurso/aparelho pendentes; avançar nesta parte isolada de CP-02 não certifica essas validações.

- [x] Reproduzir em testes: aliado elevado atingido no ar errado; feedback de armadura sobrescrito; neutralização via capacete sem marcador de neutralização.
- [x] Corrigir coordenadas verticais em `06-actors.js` e feedback em `07-player-combat.js` sem mudar balanceamento.
- [x] Verificar cenários de parede/vidro, regiões sobrepostas, capacete, armadura, arma/desarme e alturas; usar Three.js real nos testes isolados e inimigos reais no Chromium.
- [x] Rodar regressões de CP-01 e suíte pertinente, revisar, publicar e registrar resultado/próximo passo neste arquivo.

Critérios: uma aplicação de dano por projétil/ator, parede antes do alvo bloqueia tiro, armadura mantém marcador metálico, alvo neutralizado não aparece como simples absorção, tiros não atingem aliado em uma altura onde ele não está. `qa/test_combat.cjs` será isolado e `qa/test_cp02_browser.cjs` fará integração. Não declarar percurso de campanha nem FPS Android a partir desses testes.

### CP-02A — implementação e evidências locais

- Base: `ddf35ee1c9fa1b6c6761e52f46e5519300a75e40`.
- Bugs reproduzidos antes da correção: cabeça/peito do aliado informados sem altura do piso; colisão de tiro inimigo contra aliado fixada no intervalo vertical do chão; marcador de armadura sobrescrito por corpo; morte por dano transferido no capacete mostrada só como absorção.
- Correção: percepção e cilindro do aliado usam posição Y absoluta; marcador metálico é preservado e não conta headshot em placa; impacto de armadura não toca áudio de carne por cima do metal; capacete retorna o resultado real da neutralização. Cores/anel de equipamento distinguem neutralização metálica.
- Valores de dano, cadência, precisão, dificuldade, formato/chaves de save e desenho das fases preservados.
- Testes locais: 11 cenários novos de combate com Three.js/raycast real + 9 regressões anteriores = 20 testes isolados aprovados; seis verificações estruturais e sintaxe aprovadas. Quatro regressões dos cenários novos foram vistas falhando antes da correção.
- Integração nova: `qa/test_cp02_browser.cjs`, com Enemy/Ally e hitboxes reais nos estilos Modelo 3D/Detalhados/Clássicos; cobertura, dano único, armadura, capacete, rendição e alturas. Usa posições controladas e não comprova trajetória de missão.
- Estado: VALIDADO AUTOMATICAMENTE E PUBLICADO — CP-02A. Avaliação visual humana e aparelho real seguem pendentes.
- Próximo passo: CP-02B — reproduzir e corrigir tiros exatamente verticais (`rayCylinder`, `03-world.js`) e aliado restaurado em Y=0 (`applySave`, `08-mission-framework.js`), com testes antes da mudança. Depois revisar clareza de recarga/bloqueio de arma e reações por cobertura/supressão. Manter percurso humano e Android como pendentes.

### Revisão CP-02A

- Revisão independente: nenhum defeito importante novo identificado no diff.
- Ampliação de testes após revisão: vidro quebra uma única vez e deixa o tiro atingir o alvo; colisão respeita aliado agachado e piso negativo; log da neutralização no capacete conferido. Esses cenários adicionais passaram localmente, sem alterar código de produção.
- Limitações menores mantidas: a fixture do navegador isola algumas malhas e duplica referência de tórax; não cobre toda a competição de proxies/anatomia/equipamento do personagem completo. Audio é conferido por chamadas nos testes isolados, não por escuta humana; aparência CSS exige avaliação visual.
- Limitação herdada registrada para CP-02B: `rayCylinder()` não resolve raios exatamente verticais/tampas do cilindro; revisar com teste específico antes de ampliar o escopo vertical. Conferir também save/load de aliado em piso elevado (restauração atual coloca Y=0). Nenhuma dessas regras foi alterada nesta entrega.
- CI em andamento: https://github.com/jogoiarexx-blip/medalha-de-honra/actions/runs/43663003832 — CP-02A nos três estilos, CP-01 e contrato de operações já aprovados; resultado completo pendente.

- Primeira execução CP-02A (`43663003832`): combate, CP-01, saves, telas e memória passaram. O teste de perfis encontrou proporção de câmera ainda antiga em duas mudanças rápidas de viewport; o código de resize de produção não mudou nesta revisão. Removida espera fixa de 150 ms do teste: agora aguarda canvas/câmera acompanharem o viewport real em até 10 s e registra timeout/valores se não acompanharem. Nova execução deve comprovar o resultado.
- QA de navegador dividido em três grupos independentes (estado, recursos, campanha) em runners separados, sem cancelar os demais grupos quando um falha. Todos os testes são mantidos, com artefatos separados por grupo.

- Segunda execução CP-02A (`43663684257`): o grupo de estado detectou instabilidade da fixture de capacete no estilo Modelo 3D (sem interseção, nenhum dano/hit contabilizado). A mira usava a origem do objeto, que pode ficar fora do casco. A fixture passou a mirar o centro da bounding box transformado para o mundo e exige uma interseção antes de conferir dano; código de produção não alterado.

### Resultado final — CP-02A — 14/11/2026

- Código e testes validados: `bce8c3b05da79c85f06245e0ddea86a2664a11de`.
- CI completo aprovado: https://github.com/jogoiarexx-blip/medalha-de-honra/actions/runs/43663915464 — estrutural, estado, recursos e campanha concluídos com sucesso.
- Publicação: PR https://github.com/jogoiarexx-blip/medalha-de-honra/pull/2 — commit de integração `c6b202264d8074413a2ece692fd03b3f5edac349`. A atualização final deste MD altera somente documentação.

| Verificação | Resultado | Escopo |
|---|---|---|
| 20 testes isolados + sintaxe + 6 verificações estruturais | PASSOU | 11 cenários de combate e 9 regressões anteriores; assets/integrações existentes |
| Combate CP-02A no Chromium | PASSOU | Modelo 3D/Detalhados/Clássicos; cobertura, dano único, armadura, capacete, rendição e alturas em posições controladas |
| CP-01, saves, telas e passo fixo | PASSOU | Regressões da primeira entrega, migração/backup e retomada |
| Memória, perfis gráficos, áudio, IA e pastor | PASSOU | Grupos independentes; resize por condição real e diagnóstico de falha mantido |
| Matriz de 27 operações e desempenho | PASSOU | Estrutura/progressão técnica com conclusão forçada; captura por software |
| Percurso humano, qualidade visual/áudio ouvidos e Android físico | PENDENTE | Não inferir esses resultados a partir das fixtures e do SwiftShader |

**Entrega encerrada:** CP-02A. **Próximo checkpoint:** CP-02B, nas duas lacunas verticais registradas acima.
