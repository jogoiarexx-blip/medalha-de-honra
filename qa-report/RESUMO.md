# Resumo da suíte de QA

Gerado por `qa/run_all.cjs` em 2026-11-11T18:13:02.028Z.

| Teste | Tipo | Cobre | Status | Tempo |
|---|---|---|---|---:|
| `qa/test_three_local.js` | Estrutural | Three.js r128 local e ordem dos scripts | TESTE AUTOMÁTICO PASSOU | 0.1 s |
| `qa/test_menu_principal.js` | Estrutural | Música do menu (arquivo e integração) | TESTE AUTOMÁTICO PASSOU | 0.2 s |
| `qa/test_material_paris.js` | Estrutural | Materiais das fachadas de Paris | TESTE AUTOMÁTICO PASSOU | 0.0 s |
| `qa/test_fase9_lancha_refinada2.js` | Estrutural | Lancha da operação 09 | TESTE AUTOMÁTICO PASSOU | 0.0 s |
| `qa/test_pastor_visibilidade.js` | Estrutural | Pastor-alemão: GLB e integração | TESTE AUTOMÁTICO PASSOU | 0.0 s |
| `qa/test_glb_assets.cjs` | Estrutural | Arquivos GLB: contêiner, índices, UV, pesos, animações | TESTE AUTOMÁTICO PASSOU | 0.1 s |
| `qa/test_registry_27.cjs` | Navegador | Contrato das 27 operações | TESTE AUTOMÁTICO PASSOU | 5.5 s |
| `qa/test_save_migration.cjs` | Navegador | Saves: validação, migração, backup, menu com dados corrompidos | TESTE AUTOMÁTICO PASSOU | 72.9 s |
| `qa/test_frame_pacing.cjs` | Navegador | Passo fixo: sem perda silenciosa de tempo | TESTE AUTOMÁTICO PASSOU | 5.8 s |
| `qa/test_state_transitions.cjs` | Navegador | Telas: menu, dossiê, jogo, documento, pausa, relatório | TESTE AUTOMÁTICO PASSOU | 152.0 s |
| `qa/test_reloads_memory.cjs` | Navegador | Memória de GPU em reinícios e trocas | TESTE AUTOMÁTICO PASSOU | 114.5 s |
| `qa/test_hardware_profiles.cjs` | Navegador | Perfis gráficos, estilos, formatos de tela, toque | TESTE AUTOMÁTICO PASSOU | 65.7 s |
| `qa/test_audio_states.cjs` | Navegador | Estados de áudio | TESTE AUTOMÁTICO PASSOU | 39.6 s |
| `qa/test_ai_budget.cjs` | Navegador | Orçamento da IA (10/25/40 inimigos) | TESTE AUTOMÁTICO PASSOU | 8.3 s |
| `qa/browser_pastor_diagnostico.cjs` | Navegador | Pastor-alemão no menu e na S1 (regressão existente) | TESTE AUTOMÁTICO PASSOU | 13.3 s |
| `qa/test_operation_progress.cjs` | Navegador | Matriz por operação (27 fases) | TESTE AUTOMÁTICO PASSOU | 382.5 s |
| `qa/test_performance_scene.cjs` | Navegador | Captura de desempenho por cena | TESTE AUTOMÁTICO PASSOU | 62.9 s |

## O que esta suíte NÃO executa

- Playthrough humano das 27 operações (objetivos jogados até a extração, segredos, chefes, créditos assistidos). Status: `NÃO TESTADO`.
- FPS em aparelhos reais (Android físico, PC fraco, PC médio com GPU) e memória por 60 minutos.
- Qualidade visual das animações quadro a quadro e mixagem de áudio ouvida por uma pessoa.
