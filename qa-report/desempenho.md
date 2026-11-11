# Captura de desempenho por cena

Build `rev-abc-2026-11-11` · perfil medio · 1280×720 · DPR 1 · 8 s por cena após 2 s de aquecimento · sem entrada.

**Renderizador:** ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

> **Renderização por software.** FPS e tempos de quadro abaixo NÃO representam aparelhos reais; servem só para comparar revisões nesta mesma máquina. Chamadas de desenho, triângulos e contagem de recursos independem da GPU.

| Cena | FPS médio | 1% low | p50 ms | p95 ms | p99 ms | sim ms/quadro | descartado ms | draw calls | triângulos | geometrias | texturas | programas | LOD longe |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Menu (porão, Modelo 3D) | 2.6 | 2.5 | 383.3 | 400.0 | 400.0 | 0.00 | 0 | 181 | 53112 | 136 | 20 | 13 | 0/10 |
| Operação 01 — rua de Paris | 1.1 | 1.1 | 883.4 | 916.6 | 916.6 | 2.83 | 5566 | 735 | 119010 | 474 | 78 | 33 | 7/10 |
| Operação 09 — porto e lancha | 1.7 | 1.1 | 566.7 | 883.3 | 883.3 | 3.46 | 6583 | 1954 | 313327 | 551 | 72 | 41 | 13/16 |
| Operação 21 — Levante Final | 1.1 | 1.1 | 899.8 | 933.4 | 933.4 | 3.07 | 5650 | 798 | 218571 | 565 | 84 | 53 | 14/17 |
| Secreta S1 — cães (pastor GLB) | 2.6 | 1.4 | 366.6 | 400.0 | 716.7 | 2.04 | 6166 | 561 | 257496 | 414 | 55 | 58 | 9/14 |

Pendente (não medido aqui): Android físico, PC fraco e PC médio com GPU; memória ao longo de 60 minutos.
