# MEDAL OF HONOR: UNDERGROUND (2000)
## Documento de referência, auditoria de design e GDD técnico para FPS moderno inspirado no clássico

> **Versão:** 2.0 — 06/11/2026 (ampliação de mecânicas, HUD, membros, capacetes, IA e física)  
> **Referência principal:** *Medal of Honor: Underground*, versão PlayStation (2000).  
> **Finalidade:** documentar o jogo clássico e servir de base técnica para desenvolver um FPS histórico inspirado em seus princípios, inclusive em Three.js/WebGL.  
> **Status:** **documentação e especificação**; nenhuma funcionalidade descrita aqui deve ser interpretada como já implementada.  
> **Convenção importante:** `[ORIGINAL]` = característica identificada no jogo de PS1; `[PROPOSTA]` = ampliação sugerida para um novo projeto; `[VALIDAR]` = detalhe que exige comparação com captura ou versão jogável antes de ser considerado reprodução fiel.

---

## Guia rápido de leitura

- **Parte I (capítulos 1–19):** referência ao jogo do PS1, campanhas, 27 fases, fundamentos, arquitetura inicial, QA e roadmap.
- **Parte II (capítulos 20–39):** implementação proposta de **tiros localizados em cabeça, braços, mãos, pernas e equipamentos**, capacetes que caem com física, IA e ferimentos, novas armas, HUD refinado, animações, cenários reativos, navegação, áudio, dados, testes e prioridades.
- Tudo que está marcado **[PROPOSTA]** constitui especificação de design: **não foi implementado ou testado como jogo**.
- **Princípio histórico:** tiros em cabeça e membros já existiam como elemento de jogabilidade no original; a v2 refina o sistema, em vez de apresentá-lo como invenção inteiramente nova.

---

## 1. Identidade do jogo

| Campo | Referência original |
|---|---|
| Título | Medal of Honor: Underground |
| Lançamento | 2000, PlayStation |
| Desenvolvedora da versão PS1 | DreamWorks Interactive |
| Publicadora | Electronic Arts |
| Gênero | FPS militar, espionagem, ação e sabotagem |
| Ambientação | Segunda Guerra Mundial, sobretudo de 1942 a 1944 |
| Protagonista da campanha principal | Manon Batiste, combatente da Resistência Francesa |
| Estrutura | 7 campanhas principais, **24 fases**; campanha extra com **3 fases** |
| Quantidade documentada | **27 fases**, contando as 3 secretas |
| Trilha sonora original | Michael Giacchino |
| Modos | Campanha solo e multiplayer local |
| Perfil | Missões de curta/média duração com objetivos explícitos, cenários variados e combate deliberado |

**Distinção de versões:** este arquivo retrata a **versão de PlayStation**, não a adaptação para Game Boy Advance, que possui diferenças significativas.

### 1.1. Proposta central

**[ORIGINAL]** Jogar como uma integrante da Resistência em missões especiais que combinam combate de infantaria, operações clandestinas, infiltração, coleta de informações, sabotagem, ajuda de aliados e defesa contra veículos. O senso de progressão vem das ordens da missão, da história e da passagem por países e frentes de guerra.

**[PROPOSTA]** Uma releitura independente pode preservar essa estrutura sem copiar sua propriedade intelectual: protagonista e enredo originais, identidade própria, mapas próprios, materiais gráficos licenciados ou autorais, música original e briefings históricos reescritos.

---

## 2. História e arco dramático — campanha original

### 2.1. A ocupação

A França foi ocupada pelas forças nazistas, e parte da administração local passou a colaborar com o regime. Manon Batiste participa da Resistência Francesa ao lado de seu irmão Jacques. Uma operação inicial se transforma em tragédia: Jacques morre, criando para Manon um motivo pessoal para continuar lutando.

### 2.2. De combatente local a agente internacional

Manon gradualmente se afasta de pequenos golpes de guerrilha para atuar em operações de inteligência vinculadas ao **OSS**, o serviço de inteligência norte-americano precursor da CIA. As missões expandem o cenário: Paris ocupada, Norte da África, Creta, Alemanha e Itália.

### 2.3. O encerramento

Após espionagem, resgates e sabotagens, Manon retorna a Paris em 1944 para apoiar a insurreição e a libertação da cidade. O encerramento da história principal está em **The End of the Line**, última fase da sétima campanha. O conteúdo secreto que vem depois não é um oitavo ato da jornada principal de Manon.

### 2.4. Personagens e funções narrativas

| Personagem / grupo | Papel |
|---|---|
| **Manon Batiste** | Protagonista jogável da campanha de sete operações |
| **Jacques Batiste** | Irmão de Manon; a perda que marca o início da campanha |
| **OSS** | Organização de inteligência que estrutura operações posteriores |
| **Resistência Francesa** | Aliados, contatos, agentes clandestinos e combatentes da libertação |
| **Forças alemãs** | Inimigos, patrulhas, oficiais, guarnições e tropas especiais |
| **Milice / colaboradores** | Oponentes presentes especialmente nas operações em território francês |
| **Jimmy Patterson** | Personagem jogável da campanha secreta, fora do arco central de Manon |

**Tom narrativo:** humanizar a guerra pelo custo da ocupação e do sacrifício pessoal. A missão é mais importante que a quantidade de inimigos eliminados, mesmo quando a avaliação do jogo recompense neutralizações.

---

## 3. Estrutura integral das campanhas e fases

### Campanha 1 — **Occupied!** (Paris ocupada)

**[ORIGINAL]** Introduz Manon, Jacques, o movimento clandestino e a repressão nas ruas de Paris. Começa com recursos limitados e evolui para fugas e combates mais pesados.

| ID | Fase original | Experiência central para reconstrução |
|---|---|---|
| 1-1 | **Midnight Rendez-Vous** | Encontro com Jacques perto da Torre Eiffel, movimentação clandestina, obtenção de suprimentos e abertura de uma garagem |
| 1-2 | **Amongst the Dead** | Sobrevivência e deslocamento por espaços ligados aos mortos e rotas clandestinas da cidade |
| 1-3 | **Without a Trace** | Evitar que operações da Resistência sejam rastreadas e atravessar setores vigiados |
| 1-4 | **Tread Carefully** | Encerramento de alto risco da fuga, com forte pressão inimiga e presença de blindados |

**Elementos de design:** becos estreitos, postes e lâmpadas, cercas, parques, interiores acessíveis, subterrâneos, patrulhas francesas e alemãs, veículos e máquina de guerra em meio à arquitetura parisiense.

**[PROPOSTA]** A primeira fase funciona como tutorial orgânico: movimentar, mirar, disparar, agachar, interagir com Jacques, acompanhar personagem, acionar portão e chegar ao veículo. A segunda introduz leitura de mapa e ambientes escuros. A terceira testa infiltração. A quarta comprova domínio do combate e de cobertura.

**Condição de sucesso do ato:** objetivos obrigatórios concluídos, extração registrada e transição narrativa funcional para o Norte da África.

### Campanha 2 — **Hunting the Desert Fox** (Norte da África)

**[ORIGINAL]** Manon trabalha para enfraquecer linhas de apoio das forças alemãs na África e apoiar as operações aliadas.

| ID | Fase original | Experiência central para reconstrução |
|---|---|---|
| 2-1 | **Casablanca** | Escapar de hotel sob ameaça, recuperar dossiê de logística e descobrir rota até instalação de suprimentos |
| 2-2 | **Lighting the Torch** | Operação sob disfarce, acesso por credenciais, uso de câmera/documentação e comunicação com forças aliadas |
| 2-3 | **Burning Sands** | Infiltrar depósito, acessar arsenal, fotografar livro de cifras e destruir quatro caminhões de combustível |
| 2-4 | **Ally in the Desert** | Fechamento da operação africana, deslocamento em área árida, confronto e retirada por zona de transporte |

**Elementos de design:** hotéis, pátios, portões, cidade quente, galpões, depósitos, desertos, aeródromo e rotas de comboio. A sensação deve alternar disfarce social com violência explosiva quando a infiltração fracassa.

**[PROPOSTA]** Sistema de reconhecimento por uniforme ou credencial; suspeita crescente em função da distância, comportamento e testemunhas; câmera de espionagem que salva uma fotografia como prova de objetivo; explosivos em depósitos e veículos.

**Condição de sucesso do ato:** cadeia de inteligência rastreável, instalação sabotada e cena de retirada executada.

### Campanha 3 — **Undercover in Crete** (Creta, Grécia)

**[ORIGINAL]** Uma investigação clandestina sobre fortificações costeiras, acompanhada de operações em locais associados à arqueologia e às ruínas de Cnossos.

| ID | Fase original | Experiência central para reconstrução |
|---|---|---|
| 3-1 | **Getting the Story** | Conseguir permissões de circulação, fotografar mapa, encontrar programação logística e embarcar em transporte para Cnossos |
| 3-2 | **What Lies at Knossos** | Infiltração e investigação arqueológica, coleta de evidências e sabotagem de recursos inimigos |
| 3-3 | **Labyrinth** | Travessia de fortificação e combate para neutralizar posições de artilharia |

**Elementos de design:** porto mediterrâneo, barcos, casarios de pedra, ruas secas, ruínas, depósitos, corredores de templo, passagens fechadas, metralhadoras e canhões costeiros.

**[PROPOSTA]** Duas facções hostis com relações próprias; caminhos alternativos de infiltração; documentos que habilitam acessos; indicadores de que um objetivo foi identificado, mas ainda não executado.

**Condição de sucesso do ato:** informações coletadas, artilharia neutralizada e evacuação.

### Campanha 4 — **Wewelsburg: Dark Camelot** (castelo na Alemanha)

**[ORIGINAL]** Episódio de atmosfera sinistra, relacionado ao interesse ficcionalizado das forças da SS por rituais, artefatos e simbolismo. Mistura cenários militares com castelo e cavaleiros armados, sem que isso deva ser confundido com reconstituição histórica rigorosa.

| ID | Fase original | Experiência central para reconstrução |
|---|---|---|
| 4-1 | **Ascent to the Castle** | Usar besta silenciosa, obter ferramentas, destruir rádio e tomar teleférico até o castelo |
| 4-2 | **Dark Valhalla** | Investigar o interior, atravessar galerias, enfrentar guardas e inimigos de armadura, recuperar evidências e artefatos |
| 4-3 | **A Vicious Cycle** | Fugir pela encosta, destruir ponte de acesso ao quartel, inutilizar sirenes e alcançar uma casa segura |

**Elementos de design:** mata fechada, trilhos, cabos de teleférico, muros grossos, salões, escadarias, armaduras decorativas, museu, passagens e estrada de montanha.

**[PROPOSTA]** A atmosfera vem de arquitetura, luz, reverb e surpresa, não de sobrenatural apresentado como fato. Um soldado disfarçado entre armaduras pode gerar um susto, mas o comportamento deve ser consistente e testado.

**Condição de sucesso do ato:** entrada, descoberta e fuga completadas, com estado da sabotagem preservado na narrativa.

### Campanha 5 — **Last Rites at Monte Cassino** (Itália)

**[ORIGINAL]** Operação em torno do complexo de Monte Cassino, com rotas de suprimento, prisioneiros e instalações religiosas utilizadas como cenário de combate.

| ID | Fase original | Experiência central para reconstrução |
|---|---|---|
| 5-1 | **Roundabout** | Neutralizar torre de guarda, destruir caminhão/depósito de suprimentos e localizar acesso à cripta |
| 5-2 | **Prisoners of War** | Libertação de prisioneiros, proteção de aliado e circulação por corredores com portas e celas |
| 5-3 | **Mayhem in the Monastery** | Confronto final nas instalações e conclusão dos objetivos da operação |

**Elementos de design:** trilhas florestais, estradas sinuosas, mirantes defensivos, claustros, criptas, corredores de pedra, salas interligadas, grades e pontos de patrulha.

**[PROPOSTA]** Missão de escolta com comportamento robusto: o aliado espera quando há ameaça, só atravessa portas liberadas e nunca desaparece sem evento claro. Introduzir um comando simples de **seguir/aguardar** para evitar travamentos de progressão.

**Condição de sucesso do ato:** personagens necessários resgatados e rota de saída desbloqueada.

### Campanha 6 — **A Mittelwerk Saboteur** (instalação de foguetes V-1)

**[ORIGINAL]** Campanha de sabotagem de capacidade industrial inimiga, percorrendo a aproximação, o complexo fabril e a fuga com perseguição veicular.

| ID | Fase original | Experiência central para reconstrução |
|---|---|---|
| 6-1 | **Plans for Destruction** | Obter explosivos e plantas, ativar gerador e alcançar transporte que conduz à fábrica |
| 6-2 | **Sabotage!** | Recuperar chave, operar controles, destruir maquinário e acervo de peças de bombas voadoras V-1 |
| 6-3 | **Sidecar Shootout** | Sequência de ação e fuga envolvendo motocicletas com sidecar |

**Elementos de design:** vilarejo, encosta montanhosa, centro de força, transporte de acesso, galeria industrial, maquinário, trilhos, caixas e pontos de fuga.

**[PROPOSTA]** Objetivos baseados em evidências e sabotagem por etapas: sem chave não há abertura do setor; sem explosivos não há destruição; explosão final inicia evento de evacuação com temporizador e rota claramente comunicada. A perseguição deve operar como modo especial de combate sobre veículo, separado da física de locomoção a pé.

**Condição de sucesso do ato:** fábrica inutilizada e fuga concluída sem violação de sequência.

### Campanha 7 — **Liberation!** (retorno a Paris)

**[ORIGINAL]** Conclusão do arco de Manon durante a insurreição de Paris. O cenário conecta a ocupação do começo do jogo à reação coletiva de 1944.

| ID | Fase original | Experiência central para reconstrução |
|---|---|---|
| 7-1 | **Final Uprising** | Recuperar material incendiário, destruir veículos semilagartas, vencer guardas e entrar na Prefeitura de Polícia de Paris |
| 7-2 | **Street by Street** | Avançar por setores urbanos com apoio da Resistência e neutralizar bloqueios inimigos |
| 7-3 | **Operation Marketplace** | Operação urbana com múltiplas ameaças e objetos estratégicos na região de mercado |
| 7-4 | **The End of the Line** | Missão final da campanha principal e desfecho narrativo da trajetória de Manon |

**Elementos de design:** ruas, barricadas, blindados, postes, sacadas de atiradores, edifícios públicos, praças, fachadas destruídas e aliados participando de batalhas de rua.

**[PROPOSTA]** O retorno a Paris deve ser visivelmente reconhecível como o mesmo universo do início: arquitetura e bairros semelhantes, porém com barricadas, iluminação diferente, danos da guerra, cartazes alterados, civis abrigados e maior número de combatentes aliados. Não é necessário conectar todas as fases em um mundo aberto.

**Condição de sucesso do ato:** objetivo final concluído, cena de encerramento, créditos, desbloqueio de replay e apresentação da classificação da campanha.

### Conteúdo secreto — **Panzerknacker Unleashed!**

**[ORIGINAL]** Conteúdo bônus não canônico e deliberadamente absurdo, separado do drama histórico. O personagem jogável é **Jimmy Patterson**; surgem cães armados, soldados mortos-vivos, cavaleiros e soldados mecânicos. A existência desse modo não altera o desfecho da história principal.

| ID | Fase original | Experiência central |
|---|---|---|
| S-1 | **Where Beagles Dare** | Castelo com inimigos caninos caricatos e revelação de experimento secreto |
| S-2 | **Rotten to the Corps** | Combate contra inimigos anômalos e mortos-vivos em cenário de terror cômico |
| S-3 | **I, Panzerknacker** | Montagem/participação de um autômato aliado e confronto final com versões hostis |

**[PROPOSTA]** Tratar como modo arcade desbloqueável, totalmente opcional e visualmente identificado como fantasia. Em um jogo autoral, o bônus deve ganhar personagens, robôs e inimigos próprios.

### Quadro geral de produção

| Campanha | Fases | Ênfase | Pilares de tecnologia |
|---|---:|---|---|
| Occupied! | 4 | Resistência, escolta, fuga | FPS básico, NPC aliado, ambiente urbano |
| Hunting the Desert Fox | 4 | Disfarce, documentos, sabotagem | Suspeita, fotografia, explosivos, veículos |
| Undercover in Crete | 3 | Investigação e fortificação | Acessos, facções, objetivos múltiplos |
| Wewelsburg | 3 | Infiltração e castelo | Arma silenciosa, atmosfera, inimigos especiais |
| Monte Cassino | 3 | Suprimentos e prisioneiros | Escolta, portas, caminho de fuga |
| Mittelwerk | 3 | Fábrica e perseguição | Eventos encadeados, explosões, combate veicular |
| Liberation! | 4 | Retomada de Paris | Batalhas urbanas e aliados em grupos |
| Panzerknacker (bônus) | 3 | Arcade surreal | IA especial e companheiro mecânico |
| **Total** | **27** | | |

---

## 4. Loop central de gameplay

1. Assistir/ler briefing da campanha: contexto, local, ordens e inteligência disponível.
2. Entrar na fase com equipamento definido por sua missão.
3. Explorar o ambiente, patrulhas, portas e rotas possíveis.
4. Lutar, infiltrar-se, fotografar, coletar itens ou interagir com aliados.
5. Atualizar os objetivos pela conclusão de eventos reais.
6. Chegar à saída válida após concluir **todos os requisitos obrigatórios**.
7. Exibir avaliação, recompensas, evolução da história e próxima fase.

### 4.1. Princípios de desenho de fase

- **Linearidade inteligível, não corredor vazio:** caminhos principais claros, atalhos e pequenas áreas secundárias.
- **Objetivos comprováveis:** fotografar deve gerar foto; destruir deve destruir objeto; resgatar deve atualizar estado do prisioneiro.
- **Preparação antes do perigo:** o jogador deve poder reconhecer e lidar com novas armas e veículos.
- **Escassez moderada:** munição e vida importam, mas o jogo não pode ficar impossível por não oferecer recursos mínimos.
- **Confrontos memoráveis:** uma sala, um blindado, uma fuga ou uma mudança de música deve ser o clímax de cada fase.
- **História ambiental:** cartazes, mobiliário, rádios, mapas e documentos sugerem o mundo sem interromper o combate.

### 4.2. Tipos de objetivo

| Tipo | Exemplo | Critério verificável |
|---|---|---|
| Buscar | Dossiê, chave, mapa, explosivo | Item registrado no inventário |
| Fotografar | Livro de códigos, posição inimiga | Alvo corretamente enquadrado e captura validada |
| Interagir | Alavanca, porta, rádio, gerador | Estado mudou e animação foi executada |
| Destruir | Rádio, combustível, fábrica | HP do alvo chegou a zero e evento concluiu |
| Proteger | Agente, prisioneiro, contato | NPC necessário sobreviveu até o destino |
| Alcançar | Casa segura, veículo, saída | Jogador entrou no trigger autorizado |
| Eliminar ameaça | Guarda, blindado, canhão | Alvo necessário foi neutralizado |
| Fuga cronometrada | Escapar após sabotagem | Alcançou área segura antes do tempo-limite |

---

## 5. Combate, controles e movimentação

### 5.1. Base original

**[ORIGINAL]** Tiro em primeira pessoa com mira, tiro, recarga, troca de arma, salto e agachamento. O PS1 usa configurações próprias de controle, incluindo botões de deslocamento lateral. Há apoio de mira e retículo configurável. Granadas, coquetéis incendiários, armas de fogo e armas antiblindado exigem ritmos diferentes.

### 5.2. Adaptação moderna — PC e controle

| Ação | Teclado e mouse | Gamepad |
|---|---|---|
| Mover | WASD | Analógico esquerdo |
| Olhar | Mouse | Analógico direito |
| Atirar | Botão esquerdo | RT/R2 |
| Mirar | Botão direito | LT/L2 |
| Recarregar | R | X/Quadrado |
| Interagir | E | A/Cruz |
| Agachar | Ctrl/C | B/Círculo |
| Pular | Espaço | Y/Triângulo |
| Trocar arma | Scroll / 1–5 | Direcional / LB-RB |
| Objetivos | Tab | View/Select |
| Pausar | Esc | Start/Options |

**[PROPOSTA]** Movimentação de soldado convencional, sem corrida infinita, deslize ou parkour moderno. Opcionalmente oferecer corrida curta, mas sua velocidade não deve permitir ignorar toda a lógica das patrulhas.

### 5.3. Sensação das armas

> **Ver especificação expandida nos capítulos 21, 22, 23 e 24:** balística, dano por regiões, capacetes físicos e estados de arma.


- Recuo visual e funcional por disparo, distinto em pistola, SMG e rifle.
- Cadência correta por categoria, com efeitos sonoros em camadas (tiro próximo, reverberação do local e eco externo).
- Recarga com estados `start`, `mag_out`, `mag_in`, `chamber`, `complete` e cancelamento seguro.
- Projéteis ou hitscan conforme o caso; projéteis reais para foguetes, granadas e coquetéis.
- Multiplicadores de dano por cabeça, tronco e membros; teste de justiça dos valores.
- Metralhadora fixa com ângulo de rotação limitado, munição ou superaquecimento configurado por cena.
- Explosões com raio, oclusão física, dano a veículos e perigo ao próprio jogador.

### 5.4. Saúde, munição e dificuldade

**[ORIGINAL]** Há três dificuldades; na campanha original a saúde transportada de uma fase à próxima se comporta de forma diferente em cada uma delas. O modo difícil é mais punitivo; a avaliação pós-fase mede desempenho e concede classificações como **Average**, **Good** e **Excellent**.

**[PROPOSTA]** Adotar um sistema explícito e testável:

| Dificuldade | Vida na entrada da fase | IA e recursos |
|---|---|---|
| Recruta | Reposição completa | Inimigos menos precisos, mais suprimentos |
| Soldado | Garantia de 50% do máximo ou vida transportada, se maior | Equilíbrio padrão |
| Veterano | Carrega a vida sobrevivente | Menos recursos e inimigos mais perigosos |

Separar dificuldade de número de inimigos: aumentar artificialmente a quantidade pode prejudicar desempenho e fidelidade. Não permitir *softlock* por munição insuficiente em objetivo obrigatório.

---

## 6. Arsenal do universo de referência

Lista de armas associadas à versão PS1 e ao seu conteúdo de campanha/multiplayer. A disponibilidade exata depende de fase e modo, e deve ser validada em capturas antes de representar fielmente cada armamento.

| Categoria | Exemplos identificados | Função de design |
|---|---|---|
| Pistolas | Walther P38, pistola com silenciador, Colt .45 no multiplayer | Precisão inicial, segurança discreta |
| Submetralhadoras | Sten, MP40 | Combate de curta/média distância |
| Arma automática | StG 44 | Ritmo de tiro e precisão intermediários |
| Metralhadora leve | Browning Automatic Rifle (BAR) | Poder de fogo elevado, munição limitada |
| Rifle de precisão | Gewehr 43 com luneta | Eliminação de alvos distantes |
| Escopeta | Shotgun | Alta eficiência em ambientes fechados |
| Arma especial | Besta experimental **Big Joe** | Disparo silencioso e recarga lenta |
| Explosivos | Granada de cabo alemã, coquetel incendiário, cargas de demolição | Área, sabotagem e armadura |
| Antiblindado | Panzerfaust; bazuca disponível em modos específicos | Veículos e posições fortificadas |
| Objetos não bélicos | Câmera, documentação, credenciais | Identificação, investigação e disfarce |

**[PROPOSTA]** Criar dados para cada arma (`damage`, `rpm`, `magSize`, `reserveMax`, `reloadMs`, `spread`, `recoil`, `soundRadius`, `damageType`). Não copiar áudio, modelos 3D ou ícones proprietários sem permissão.

---

## 7. Inimigos, aliados e inteligência artificial

### 7.1. Arquétipos de inimigos

| Arquétipo | Equipamento | Comportamento esperado |
|---|---|---|
| Miliciano/colaborador | Pistola ou submetralhadora | Patrulha, guarda passagem, chama reforços |
| Soldado de infantaria | Rifle ou SMG | Alterna cobertura, avanço e tiro |
| Oficial | Pistola/SMG | Reage à descoberta, coordena alarme |
| Metralhador fixo | Metralhadora montada | Área de negação e arco de tiro definido |
| Atirador de elite | Rifle com luneta | Ocupa janela, torre ou sacada |
| Granadeiro | Granada | Tenta desalojar jogador de posição |
| Antiblindado | Lançador de foguetes | Ataque explosivo com aviso visual/sonoro justo |
| Cavaleiro da campanha de Wewelsburg | Armadura/arma corpo a corpo | Emboscada e aproximação agressiva |
| Guarnição de veículo | Armamento montado | Atua em tanque, semilagarta ou sidecar |
| Inimigos bônus | Cães fictícios, mortos-vivos e robôs | **Somente** no conteúdo secreto não canônico |

### 7.2. Máquina de estados proposta

```text
PATROL -> INVESTIGATE -> ALERT -> SEARCH -> COMBAT
   |            |          |         |         |
   v            v          v         v         v
IDLE          RETURN      CALL       RETURN    FLANK/COVER
                         BACKUP                  |
                                                 v
                                               RETREAT

Estados transversais: STUNNED, HURT, DEAD, SCRIPTED, DISABLED.
```

### 7.3. Percepção e reação

> **Detalhamento implementável no capítulo 25:** percepção, cobertura, supressão, dano em membros e IA tática.


- Visão por campo angular, distância, linha de visão e iluminação contextual.
- Audição com intensidade diferente para arma silenciada, pisadas, explosões, portas e rádio.
- Investigação no último ponto conhecido, não localização telepática.
- Compartilhamento de alerta **entre soldados capazes de se comunicar**, limitado por alcance/rádio.
- Inteligência de granada: procurar saída do raio explosivo sem ler informações invisíveis.
- Cobertura em posições predefinidas; evitar que todos os inimigos se amontoem na mesma porta.
- Regras explícitas de aparição e reforço; nunca criar inimigo atrás da câmera sem aviso/justificativa.
- Facções hostis podem combater entre si em cenas específicas, como no contexto de Creta.

### 7.4. Aliados

**[PROPOSTA]** `FOLLOW`, `WAIT`, `UNLOCK`, `ESCORT`, `COMBAT`, `TAKE_COVER`, `SCRIPTED_EXIT`.

Os aliados devem: alcançar portas liberadas, não ficar presos em batentes, evitar ocupar a posição do jogador, respeitar escadas e não disparar contra companheiros. Se um aliado indispensável ficar sem rota, o sistema deve tentar replanejar; ao falhar, recuperar em posição segura visível, em vez de quebrar a missão.

---

## 8. Veículos e objetos de missão

**[ORIGINAL]** O jogo utiliza tanques, motocicletas com sidecar, caminhões e veículos semilagartas em diferentes trechos; o ataque a blindados é um elemento marcante.

### 8.1. Implementação proposta

| Sistema | Requisito |
|---|---|
| Tanques | Casco, torre, canhão, deslocamento e zonas de dano independentes |
| Semilagartas | Rota de patrulha, arma montada, destruição e colisões |
| Sidecar | Movimento com trilho/spline e sequências de disparo |
| Caminhões | Entrega de suprimentos, fuga, combustível e cargas destruíveis |
| Teleférico/transporte | Ponto de entrada, animação de deslocamento, bloqueios de evento |
| Portas e grades | Estados persistentes, chaves, travas e animação sincronizada |
| Cargas explosivas | Colocação, armamento, detonação e gatilho do próximo objetivo |

### 8.2. Regras de segurança da jogabilidade

- Blindados não podem atravessar paredes ou bloquear permanentemente o único caminho.
- Explosões devem acontecer uma única vez por gatilho e não duplicar pontos de objetivo.
- Um veículo destruído deve manter colisão coerente até sua remoção; se desaparecer, somente após o jogador entender o resultado.
- Passageiro/atirador do sidecar não deve disparar enquanto a câmera estiver transicionando.
- Fases veiculares precisam permitir concluir a fase usando controle, teclado e mouse.

---

## 9. Direção artística

### 9.1. Linguagem visual do PS1

**[ORIGINAL]** Ambientes 3D de geometrias relativamente simples, forte orientação espacial, texturas de baixa resolução, espaços segmentados e atmosferas históricas distintas por região.

**[PROPOSTA]** Estilo **low-poly realista estilizado, PS1 refinado**: manter a leitura de formas do original, mas elevar coerência de proporção, animação, iluminação e textura. Evitar tanto o fotorrealismo pesado quanto personagens excessivamente cartunizados.

| Região | Paleta/ambiente | Elementos obrigatórios |
|---|---|---|
| Paris ocupada | Cinza, verde gasto, amarelo de lampião | Fachadas, ruas, monumentos, portões, pátios |
| Norte da África | Ocre, areia, terracota, azul desbotado | Comércio, hotéis, depósitos, fortalezas |
| Creta | Calcário, verde-oliva, mar e céu | Porto, ruínas, colinas e bateria costeira |
| Wewelsburg | Pedra escura, névoa, verde profundo | Castelo, teleférico, muralhas e mata |
| Monte Cassino | Pedra fria, oliva, poeira | Abadia, cripta, bosque e estradas |
| Fábrica V-1 | Cinza industrial, ferrugem, luz técnica | Tubulações, estruturas, maquinário, trilhos |
| Paris libertação | Cinza urbano, fumaça, fogo e bandeiras | Barricadas, edifícios públicos e ruas de guerra |
| Bônus | Contraste lúdico deliberado | Castelo fantasioso e inimigos caricatos |

### 9.2. Proporções de produção

- Personagem adulto padrão: referência de altura humana consistente (por exemplo, 1,70–1,85 m).
- Portas, mesas, escadas e coberturas com medidas coerentes; colisores não devem ser maiores que a geometria.
- Paredes com espessura real para evitar tiros por paredes sem intenção.
- Armas visíveis em primeira pessoa com escala apropriada e animação ancorada na câmera.
- Texturas e luzes diferentes para ambientes noturnos ou diurnos; não oferecer troca arbitrária de horário numa fase fixa.

### 9.3. LOD e imagens de fundo

**[PROPOSTA]** Distâncias maiores podem usar impostores WebP/planos de fundo, trocados por GLB ou geometria procedural quando necessário. A substituição só será permitida se o impostor:

1. Tiver **mesma silhueta, altura, largura, posição e orientação** do objeto real.
2. Preservar tom/iluminação para não aparecer mudança brusca de cor.
3. Trocar com histerese e, quando possível, pequena transição visual.
4. Não representar cobertura destrutível ou colisão ativa enquanto for somente imagem.
5. Usar LOD específico para veículo, edificação, vegetação e decoração.

---

## 10. Animações

### 10.1. Jogador em primeira pessoa

| Estado | Requisitos |
|---|---|
| Idle | Respiração discreta e peso da arma |
| Walk | Balanço natural, sem enjoo excessivo |
| Sprint (opcional) | Arma abaixa, não dispara acidentalmente |
| Aim | Transição suave para mira, sem atravessar rosto/câmera |
| Fire | Recuo e recuperação por arma |
| Reload | Braços, carregador e munição sincronizados |
| Melee (opcional) | Ataque curto quando sem munição |
| Crouch | Altura da câmera e colisor mudam juntos |
| Hurt | Feedback temporário que não destrói visibilidade |
| Vehicle | Estado próprio para metralhadora fixa ou sidecar |

### 10.2. NPCs

Idle, walk, run, aim, shoot, reload, turn-left, turn-right, alert, investigate, cover-enter, cover-exit, hit-front, hit-back, death-front, death-back, open-door, climb e scripted-interaction.

**Critério crítico:** o personagem anda para a direção correta, sem *foot sliding*, sem mãos invertidas, sem arma atravessando corpo e sem perda de animação após carregar um save.

---

## 11. Áudio e música

### 11.1. Referência sonora

**[ORIGINAL]** Música orquestral cinematográfica de Michael Giacchino, tensão militar, melodias melancólicas, tiros e efeitos ambientais que ajudam a criar atmosfera de missão.

### 11.2. Projeto sonoro independente

- **Trilha original:** composições próprias inspiradas em linguagem orquestral da época, **sem copiar melodias, gravações ou arranjos do jogo**.
- **Estados musicais:** briefing, exploração, suspeita, combate, clímax, êxito e derrota.
- **Transições:** crossfade com intensidade controlada e prioridade ao disparo/diálogo.
- **Ambiente:** tráfego distante, vento, água, passos, máquinas, sirenes, rádio e eco interno.
- **Vozes:** dublagem opcional em português brasileiro com legendas acessíveis, mantendo contexto histórico.
- **Mixer:** volumes separados de música, efeitos, vozes e interface; pausa deve congelar sons relevantes.
- **3D:** atenuação e oclusão suaves; evitar que som de um inimigo em outro cômodo pareça estar ao lado do jogador.

---

## 12. Interface e progressão

### 12.1. Menus

```text
MENU PRINCIPAL
├── Continuar
├── Nova campanha
├── Registro de missões
│   ├── Campanhas
│   ├── Fases desbloqueadas
│   ├── Estatísticas
│   └── Recordações / medalhas
├── Multiplayer local (quando implementado)
├── Opções
│   ├── Gráficos
│   ├── Áudio
│   ├── Controles
│   ├── Acessibilidade
│   └── Idioma
└── Créditos
```

### 12.2. HUD

> **Wireframe e comportamento detalhados no capítulo 27:** presets Clássico/Dinâmico/Cinematográfico, hit markers, direção de dano, estados contextuais, responsividade e integração com pause/documentos.


- Saúde atual, munição no carregador e reserva, arma selecionada.
- Retículo configurável e indicação sutil de direção de dano.
- Texto temporário ao concluir objetivo; registro consultável sem sair da missão.
- Ícone de interação somente quando objeto estiver realmente alcançável.
- Sem sobrecarregar a tela com inventários e indicadores permanentes desnecessários.

### 12.3. Briefing, documentos e pausa

**[PROPOSTA]** Separar estritamente os modos de interface. A leitura de documentos **não deve abrir o menu de pausa**. Se o tempo do mundo tiver de parar durante a leitura, usar uma razão de suspensão independente que não exija sair duas vezes.

```text
PLAYING
 ├── INTERACTION_VIEW (documento, fotografia, mapa ou registro)
 │    └── fechar -> PLAYING
 ├── PAUSE_MENU
 │    └── continuar -> PLAYING
 └── MISSION_END
      └── relatório -> CAMPAIGN_MENU
```

Também impedir perda do `pointer lock` sem indicação clara de como voltar ao jogo; `Esc` fecha a sobreposição atual antes de abrir o menu de pausa, com regra única e testada.

### 12.4. Avaliação e desbloqueios

**[ORIGINAL]** A avaliação considera porcentagem de oponentes neutralizados e vida restante; o registro também mostra precisão, objetivos e outras estatísticas. A classificação **Excellent** está associada a bônus e lembranças/desbloqueios.

**[PROPOSTA]** Manter a avaliação clássica como modo de referência, mas adicionar um relatório opcional mais inclusivo de estilo de jogo: objetivos, civis protegidos, tempo, alertas, dano recebido e munição usada. **Não** classificar sigilo como fracasso porque poucos inimigos morreram, quando a fase foi planejada como infiltração.

---

## 13. Especificação técnica para recriação em Three.js

> Abaixo é uma **arquitetura proposta**, não uma descrição da engine original do PlayStation.

### 13.1. Objetivos de plataforma

- Navegador desktop, inclusive GitHub Pages, e versão instalável PWA quando viável.
- Compatibilidade com Windows por empacotamento offline em fase posterior.
- Sem servidor obrigatório para campanha solo.
- Suporte a teclado/mouse e Gamepad API.
- Metas de desempenho de projeto: **60 FPS** em desktop intermediário, com qualidade adaptativa; manter jogabilidade aceitável em equipamento mais fraco.

### 13.2. Organização recomendada

```text
public/
  audio/{music,sfx,voice}/
  assets/{characters,weapons,vehicles,props,architecture}/
  textures/{atlases,impostors,ui}/
src/
  main.js
  core/{App,SceneManager,InputRouter,EventBus,SaveSystem}.js
  gameplay/{PlayerController,WeaponSystem,DamageSystem,Inventory}.js
  gameplay/{MissionRuntime,ObjectiveManager,InteractionSystem}.js
  ai/{AgentBrain,Perception,NavAgent,CoverSystem,SquadDirector}.js
  world/{LevelLoader,Doors,Vehicles,Destructibles,Triggers}.js
  render/{LODManager,LightingManager,EffectsPool}.js
  audio/{AudioManager,MusicDirector}.js
  ui/{HUD,PauseMenu,DocumentViewer,Briefing,ResultsScreen}.js
  data/{campaigns,weapons,enemies,settings}/
  tests/{unit,integration,e2e,playtest}/
```

### 13.3. Estados globais

```text
BOOT -> MAIN_MENU -> BRIEFING -> LOADING -> PLAYING
                                          |   |
                                          |   +-> DOCUMENT_VIEW -> PLAYING
                                          +------> PAUSED -> PLAYING
                                          +------> MISSION_FAILED -> RESTART
                                          +------> MISSION_COMPLETE -> RESULTS
                                                               |
                                                               v
                                                        NEXT_BRIEFING
```

**Invariantes de estado:** uma transição deve ser atômica, interromper os inputs antigos e nunca mostrar menus concorrentes. `DOCUMENT_VIEW` e `PAUSED` são distintos.

### 13.4. Dados de missão — exemplo fictício de implementação

```json
{
  "id": "01-01",
  "title": "Midnight Rendez-Vous",
  "referenceOnly": true,
  "scene": "paris_night_01",
  "startEquipment": ["pistol", "petrol_bomb"],
  "objectives": [
    {
      "id": "meet_contact",
      "type": "interact_npc",
      "target": "contact_01",
      "required": true
    },
    {
      "id": "open_garage",
      "type": "activate",
      "target": "garage_main_switch",
      "requires": ["meet_contact"],
      "required": true
    }
  ],
  "extraction": {
    "zone": "garage_exit",
    "requiresAllRequiredObjectives": true
  }
}
```

O JSON ilustra um **contrato de dados**, não corresponde a arquivos extraídos do jogo original. IDs, recursos e eventos devem corresponder à cena efetivamente construída.

### 13.5. Eventos e integração

```text
player/interact
mission/objective-started
mission/objective-completed
npc/alerted
npc/escort-ready
world/door-opened
world/object-destroyed
vehicle/destroyed
mission/extraction-armed
mission/completed
save/committed
```

**Regra:** cada objetivo é marcado como completo somente por um evento válido do objeto correto; repetir esse evento não concede progresso nem recompensa duplicados.

### 13.6. Salvamento

```json
{
  "saveVersion": 1,
  "campaignId": "main",
  "currentMission": "01-01",
  "completedMissions": [],
  "missionState": {
    "objectives": {},
    "interactables": {},
    "destroyedObjects": [],
    "allies": {}
  },
  "player": {
    "health": 100,
    "ammo": {},
    "equipment": [],
    "checkpointId": "start"
  },
  "settings": {}
}
```

Usar IndexedDB como armazenamento preferencial e fallback apropriado quando necessário. Suportar migração de versões, exportar/importar save e separar dados de campanha de opções. Recarregar deve restaurar a missão de modo reproduzível, inclusive objetos destruídos e portas abertas.

### 13.7. Performance

- Cena dividida por setores e ambientes; descarregar o que não é usado.
- Geometrias repetidas com instancing e atlas de textura.
- Materiais compartilhados e sombras seletivas; baked lighting onde possível.
- Pools para projéteis, estojos, partículas, impactos e sons.
- Limites de distância e custo de atualização da IA; inimigos fora de vista podem pensar com menor frequência, sem congelar eventos necessários.
- GLB compactado, texturas WebP/KTX2 quando adequado e carregamento assíncrono.
- Disparos, colisões e objetivos executados com passo temporal previsível, desacoplado de variações de FPS.
- Tela de carregamento real enquanto GLBs, animações e shaders necessários são preparados; nunca entrar em fase com inimigo/arma invisível por carregamento pendente.

---

## 14. Fidelidade versus modernização

| Subsistema | Preservar do original | Modernizar sem perder a identidade |
|---|---|---|
| Campanha | Ordem das 7 operações e clímax | Briefings e transições legíveis |
| Fases | Objetivos e progressão em missões | Navegação, colisões e checkpoints confiáveis |
| Combate | Ritmo deliberado e escassez | Feedback, mira e controle responsivo |
| IA | Patrulhas, alarmes e uso de cobertura | Visão/áudio coerentes e menos comportamentos injustos |
| Veículos | Combates marcantes contra blindados | Física e colisores consistentes |
| Espionagem | Disfarces, credenciais e fotografia | Suspeita explicável e inventário de provas |
| Áudio | Tensão orquestral e espacialidade | Música original adaptativa e mixer completo |
| Visual | Geometria legível e variedade de cenários | Low poly refinado, LOD, iluminação otimizada |
| Recompensas | Avaliação e recordações | Replays, desafios e registros claros |
| Acessibilidade | Alternância de funções de mira | Remapeamento, legendas, ajuste de FOV e sensibilidades |

**Aviso de propriedade intelectual:** o documento serve para estudo e planejamento. Um produto público independente deve evitar redistribuir ROM, código, músicas, vozes, mapas idênticos, logotipos, personagens e assets do jogo original sem autorização.

---

## 15. Plano de implementação — prioridade por impacto

### P0 — Base jogável e estável

- [ ] Inicialização, menu, loading real e seleção de campanha.
- [ ] Controles FPS com mouse e gamepad, colisões e câmera estável.
- [ ] Uma arma de pistola e uma automática com munição/recarga verdadeiras.
- [ ] NPC com patrulha, percepção, combate e morte.
- [ ] Sistema de objetivos, interação, portas e extração.
- [ ] HUD, pausa, leitura de documentos e persistência.
- [ ] Um mapa funcional de referência para **1-1**; terminar a fase do início ao fim.
- [ ] Teste de fluxo: `menu -> briefing -> gameplay -> resultados -> próxima fase`.

### P1 — Vertical slice convincente

- [ ] Fase 1-1 completa, com contato aliado, objetivos e veículos de cenário.
- [ ] Armas, pickups, explosivos e adversários variados.
- [ ] Sons 3D, música adaptativa, animações e efeitos.
- [ ] Save/load no meio da missão e reinício sem erro.
- [ ] Fases 1-2, 1-3 e 1-4 completas e conectadas pela progressão.
- [ ] Blindado funcional e ponto de fuga da primeira campanha.

### P2 — Espionagem e diversidade

- [ ] Sistema de identidade/disfarce, câmera, documento e credencial.
- [ ] Quatro fases da campanha 2, incluindo depósito, caminhões e retirada.
- [ ] Facções hostis e reconhecimento de credencial para Creta.
- [ ] Entradas e saídas coerentes para todas as fases de Creta.

### P3 — Sistemas especiais

- [ ] Besta e infiltração do castelo.
- [ ] Teleférico, sirene, ponte e casa segura.
- [ ] Resgate e escolta confiáveis de Monte Cassino.
- [ ] Fábrica V-1 com etapas de sabotagem e explosão final.
- [ ] Perseguição de sidecar com câmera e colisões testadas.

### P4 — Encerramento da campanha

- [ ] Quatro fases de Liberation! com continuidade narrativa.
- [ ] IA aliada em batalhas urbanas e blindados na cidade.
- [ ] Desfecho, créditos e relatório final.
- [ ] Replay de missões, classificações e recompensas.
- [ ] Campanha inteira jogável sem comandos de desenvolvimento.

### P5 — Extras e acabamento

- [ ] 3 fases secretas separadas do cânone histórico.
- [ ] Multiplayer local somente se tecnicamente sustentável.
- [ ] Opções avançadas de controle, acessibilidade e vídeo.
- [ ] Conteúdo histórico contextual e documentação de fontes.
- [ ] Qualidade adaptativa, PWA/offline e empacotamento para PC.

---

## 16. Auditoria e critérios de aceitação

### 16.1. Testes obrigatórios de cada uma das 27 fases

- [ ] Abre a partir do menu de missões e do avanço normal de campanha.
- [ ] Carrega todos os objetos e animações necessários.
- [ ] Não há armas, mãos ou inimigos invisíveis.
- [ ] O jogador não nasce dentro de cenário, trava ou cai fora do mapa.
- [ ] Objetivos exibem estado correto e mudam somente quando realmente cumpridos.
- [ ] Chaves, fotos e documentos são reconhecidos no alvo certo.
- [ ] Interação com documentos não ativa um menu de pausa extra.
- [ ] Portas não abrem sem condição nem ficam trancadas após condição satisfeita.
- [ ] Inimigos patrulham, percebem, combatem e terminam seus estados corretamente.
- [ ] Companheiros indispensáveis não ficam presos e podem completar a missão.
- [ ] Veículos não atravessam cenário nem bloqueiam a progressão.
- [ ] Audio não continua disparando ao reiniciar e não duplica sons.
- [ ] Save/load restaura posição, equipamentos, IA essencial e destruição persistente.
- [ ] Fase pode ser concluída na dificuldade padrão sem truques ou teleporte.
- [ ] Fase registra avaliação, desbloqueia continuação e não duplica medalha.
- [ ] Pausar/reanudar e perder/recuperar foco não travam controles.
- [ ] Ao reentrar em fase concluída, resultados anteriores não são corrompidos.

### 16.2. Testes de campanha completa

- [ ] Todas as **24 fases principais** jogáveis e concluíveis em ordem.
- [ ] Cena final após **7-4**, sem confundir bônus com final principal.
- [ ] Conteúdo extra de **3 fases** acessível por desbloqueio específico.
- [ ] Nenhum objetivo pendente sem local, alvo ou mecanismo de conclusão.
- [ ] Nenhuma arma necessária indisponível durante fase crítica.
- [ ] Todos os tipos de inimigos têm animação de entrada, dano e eliminação.
- [ ] Dificuldades fácil/normal/difícil funcionam, inclusive transporte de saúde.
- [ ] Gamepad não inverte eixos nem troca botões de maneira involuntária.
- [ ] Testes de baixa performance não tornam a física injusta.
- [ ] Uma campanha completa pode ser concluída sem console de debug.

### 16.3. Relatório técnico por revisão

Cada revisão deve informar:

```text
Versão/revisão:
Fases implementadas: __/24 campanha; __/3 bônus
Fases realmente concluídas em playtest: __/27
P0 abertos: __ | P1 abertos: __ | P2 abertos: __
FPS mínimo/médio nos cenários de teste:
Problemas corrigidos com reprodução:
Testes executados e evidências:
Testes apenas declarados (não reproduzidos):
Regressões encontradas:
Próxima prioridade:
URL da versão publicada, se houver:
```

Não considerar uma fase **pronta** por ter cenário e inimigos visíveis: deve ser possível terminar seus objetivos, transitar e salvar progresso.

---

## 17. Ficha padrão para expandir cada fase

Duplicar este modelo para a especificação detalhada de cada nível durante o desenvolvimento:

```markdown
### [ID] Nome da fase
- Campanha / ano / local:
- Referência histórica (com fonte):
- Resumo narrativo:
- Objetivos obrigatórios:
- Objetivos opcionais:
- Equipamento inicial:
- Itens e armamentos disponíveis:
- Inimigos e posições de patrulha:
- Aliados e riscos de escolta:
- Veículos e objetos destrutíveis:
- Salas e conexões do mapa:
- Eventos de entrada, clímax e extração:
- Música, ambiente e iluminação:
- Condições de falha:
- Checkpoints e dados de save:
- Alvos de performance:
- Bugs conhecidos:
- Testes executados:
- Critérios de aprovação:
```

---

## 18. Fontes e validação

Consulta realizada para este documento em **06/11/2026**. As listas de campanhas/fases, o enquadramento narrativo, o arsenal e aspectos de mecânica foram contrastados em mais de uma referência. Algumas descrições breves de fase são **sínteses de design**, não transcrições literais de objetivos oficiais. Para reprodução exata, comparar o jogo de PS1 em funcionamento, seus briefings e capturas de cada fase.

1. **GameFAQs — Medal of Honor Underground: Guide and Walkthrough (odino, 2009):**  
   https://gamefaqs.gamespot.com/ps/914389-medal-of-honor-underground/faqs/56088
2. **PlayStation Universe — *Medal of Honor Underground Retrospective – History In The Making*:**  
   https://www.psu.com/news/medal-of-honor-underground-history/
3. **MobyGames — Medal of Honor: Underground (descrição e metadados):**  
   https://www.mobygames.com/game/4761/medal-of-honor-underground/
4. **Medal of Honor Wiki — Medal of Honor: Underground (campanhas/armas):**  
   https://medalofhonor.fandom.com/wiki/Medal_of_Honor:_Underground
5. **Registro de playthrough completo com marcadores de cada fase (Dfactor Longplays):**  
   https://www.youtube.com/watch?v=Z8ZtdR3Spjg
6. **Visão geral histórica e produção:**  
   https://en.wikipedia.org/wiki/Medal_of_Honor:_Underground

### Observações de precisão

- Nomes de fases conservados em inglês para facilitar comparação com a edição de PS1.
- O nome **Dark Valhalla** aparece nas listas de fase; algumas gravações abreviam para **Valhalla**.
- O nome **Monte Cassino** aparece em algumas fontes como **Mount Cassino**.
- A campanha extra também é descrita como **From the files of the OSRD** em certos guias.
- As mecânicas e os cenários do bônus surreal não devem ser tratados como eventos históricos.
- Lembranças/desbloqueios podem depender de avaliações; regras exatas devem ser confirmadas por versão/região antes da implementação.

---

## 19. Decisão de produto recomendada

**Construir primeiro a campanha 1 como um jogo verticalmente completo**, em vez de gerar 27 mapas incompletos. A avaliação de qualidade deve priorizar: combate fluido, objetivos que funcionam, interação confiável com portas/documentos, IA correta e conclusão real de cada fase. Depois, reutilizar esses sistemas para escalar para as campanhas seguintes.

**O que torna Underground memorável não é apenas o cenário da Segunda Guerra:** é a alternância entre Resistência, espionagem, sabotagem, momentos cinematográficos e o retorno emocional a Paris. Essa variedade deve orientar cada decisão de desenvolvimento.

---

# PARTE II — GDD DE MECÂNICAS APRIMORADAS (VERSÃO 2.0)

> **Natureza desta parte:** `[PROPOSTA]`. As regras a seguir especificam um jogo moderno **inspirado no ritmo e na estrutura** de *Underground* e **não** descrevem sistemas já implementados nem garantem equivalência histórica. Valores numéricos são **parâmetros iniciais de balanceamento**, a validar por playtest. Onde se menciona acerto em cabeça e reação a tiro nos membros, trata-se de um princípio já associado ao original, aqui aprofundado em subsistemas próprios.
>
> **Meta de produção:** não basta desenhar os recursos; cada mecânica deve ter dados, animação, interface, feedback, persistência, testes e fallback de desempenho.

## 20. Visão jogável da versão aprimorada

### 20.1. Pilares inegociáveis

1. **Cada tiro tem consequência legível.** Um disparo que atinge ombro, perna, capacete, arma ou cobertura deve produzir feedback correspondente, nunca uma animação aleatória indiferenciada.
2. **Soldados reagem de forma humana e previsível.** Procuram cobertura, hesitam sob fogo, podem perder a precisão ou a mobilidade por curto período e ajudam companheiros quando a situação permite.
3. **Objetivos continuam no centro do jogo.** A vitória depende de fotografar provas, sabotar, resgatar, atravessar e escapar, não só de eliminar soldados.
4. **HUD militar cinematográfico sem poluição.** Informações essenciais visíveis; detalhes aparecem quando necessários; documentos e pausa são telas independentes.
5. **Cenários reagem ao combate.** Capacetes, objetos soltos, vidros, madeira leve, lâmpadas e equipamentos respondem aos impactos dentro de um orçamento previsível.
6. **O PS1 é uma direção estética, não uma limitação funcional.** Silhuetas low poly, materiais coerentes, animações fluidas, colisão honesta, som posicional e desempenho sólido.
7. **Sem efeitos injustos ou bugs de continuidade.** Um soldado sem capacete não o recupera após sair da câmera; um documento não aciona pause; um inimigo caído não volta a atirar; a missão não fica bloqueada por um objeto decorativo.

### 20.2. Loop de combate de 10–30 segundos

```text
IDENTIFICAR ameaça e rotas
  -> escolher arma / cobertura / abordagem
  -> mirar (quadril ou ADS)
  -> disparar e registrar material + região atingida
  -> inimigo responde: reação localizada / supressão / movimento / alarme
  -> avaliar: recarga, reposição, fuga ou avanço
  -> atualizar objetivos, munição e situação tática
  -> repetir, até conclusão da seção
```

**Regra de ouro:** cada reação visual tem de ocorrer **depois da confirmação de acerto**, jamais somente porque a mira passou sobre um inimigo. A confirmação é feita pela simulação, não pelo HUD.

### 20.3. Modos de experiência

| Modo | Combate | Interface | Objetivo |
|---|---|---|---|
| **Clássico refinado** | Rápido, headshots recompensados, munição relativamente abundante | Bússola/saúde e contagem de munição | Referência ao ritmo do PS1 |
| **Tático (padrão)** | Mira mais deliberada, consequências localizadas moderadas, IA cooperativa | HUD dinâmico | Campanha principal recomendada |
| **Sobrevivência (opcional)** | Menos recursos, cura limitada, mira mais exigente | HUD mínimo | Replay desafiador sem multiplicar inimigos |

Mudança de modo **não** altera as condições básicas dos objetivos ou a geometria do mapa. Opções de dificuldade (`Recruta`, `Soldado`, `Veterano`) podem combinar com os modos, desde que o jogador entenda o que cada configuração altera.

## 21. Sistema de disparos e balística

### 21.1. Pipeline determinístico de um tiro

```text
Input de tiro
 -> verificar estado da arma (equipada, ferrolho, munição, recarga)
 -> consumir munição e registrar ID do disparo
 -> reproduzir animação e som
 -> calcular origem da câmera + vetor de mira + dispersão
 -> fazer raycast ou simular projétil
 -> ordenar impactos por distância
 -> resolver obstrução, espessura e material
 -> identificar receptor: mundo / NPC / veículo / equipamento
 -> despachar evento de dano uma única vez por receptor atingido
 -> mostrar efeito correto (impacto, faísca, poeira, madeira, sangue opcional)
 -> avisar IA pelo som e pela passagem próxima do projétil
 -> atualizar precisão/estatísticas apenas uma vez
```

**Invariantes:** não pode haver dois danos pelo mesmo raycast por conta de malhas sobrepostas do inimigo; todos os resultados devem ser reproduzíveis com semente de dispersão, entrada e cena equivalentes; o tiro não atravessa uma parede só porque uma hitbox estava atrás dela.

### 21.2. Origem e direção

- **Origem de aquisição:** raio central da câmera determina o ponto de mira, com alcance de trabalho configurável.
- **Origem física:** boca do cano cria o tiro que se dirige ao ponto adquirido, evitando disparos que saem de dentro de paredes quando a arma está perto de um obstáculo.
- **Obstrução curta:** se o cano estiver encostado numa parede, o disparo atinge a parede; não pode partir magicamente da câmera.
- **ADS:** alinha arma, centro visual e trajetória com transição configurada por classe de arma.
- **Hip-fire:** usa cone de dispersão maior e retículo que representa incerteza; não usar sorte invisível que contradiga o retículo.
- **Distâncias grandes:** a resolução balística utiliza coordenadas de mundo; o efeito cosmético pode ter LOD, sem alterar a colisão.

### 21.3. Tipos de trajetória

| Tipo | Aplicação | Simulação proposta |
|---|---|---|
| Hitscan instantâneo | Pistolas, submetralhadoras, fuzis e metralhadoras | Raycast com alcance e perda de energia |
| Hitscan multipellets | Escopeta | Número fixo de pellets com semente por disparo |
| Projétil físico | Besta, foguetes, granadas e coquetéis | Passo fixo, gravidade/arrasto e varredura contínua |
| Explosão | Granada, Panzerfaust, carga | Sobreposição esférica + oclusão por obstáculos |
| Supressão | Todos os projéteis ruidosos | Distância mínima até a trajetória, não somente hits |

Um efeito de rastro (*tracer*) é decorativo; sua renderização atrasada não muda o instante do dano. Granadas/foguetes jamais usam raycast instantâneo disfarçado de projétil.

### 21.4. Dispersão e recuo

- **Dispersão base** em graus por arma; cresce com movimento, salto e tiro contínuo; reduz em ADS e agachado.
- **Recuo funcional** altera a orientação da arma/câmera dentro de limites; **recuo visual** anima mãos e cano separadamente.
- **Recuperação** começa após cessar fogo, suavizada; não retorna instantaneamente ao centro como se o disparo não tivesse ocorrido.
- **Arma pesada** tem entrada em ADS mais lenta e maior balanço quando em pé.
- **Rifle de precisão** pode usar retenção breve de respiração (até 3 s, com cooldown de 4 s), sem virar mecânica obrigatória.
- **Sem mira magnética automática** no mouse; gamepad pode ter assistência moderada, desligável e sem travar na cabeça.

**Tuning inicial (em graus, não valores físicos históricos):**

| Classe | Cone parado/ADS | Cone andando/quadril | Tendência de recuo |
|---|---:|---:|---|
| Pistola | 0,35° | 1,6° | Vertical leve |
| SMG | 0,55° | 2,5° | Vertical + deriva lateral |
| Rifle | 0,18° | 2,2° | Impulso alto, recuperação lenta |
| Automática pesada | 0,7° | 3,2° | Forte, exige rajadas |
| Escopeta | Espalhamento por pellet | Espalhamento por pellet | Alta animação, tiro único |
| Besta | 0,12° | 1,5° | Quase nulo, recarga demorada |

### 21.5. Materiais atingíveis

| Material | Áudio/efeito | Penetração proposta | Interação |
|---|---|---|---|
| Alvenaria/pedra | Poeira, pequenas lascas | Não | Decal de impacto |
| Metal espesso | Faíscas, ricochete sonoro | Não | Marca superficial |
| Chapa fina | Som metálico, partículas | Condicional | Deforma painel visualmente |
| Madeira fina | Farpas | Condicional | Pode romper barricada planejada |
| Vidro | Estilhaço simplificado | Sim | Quebra painel e altera oclusão |
| Terra/areia | Poeira | Não | Impacto sem decal permanente |
| Tecido/saco de areia | Partículas leves | Depende da espessura | Cobertura preserva função tática |
| Corpo/equipamento | Reação localizada | Regras de dano/equipamento | Sem perfuração gráfica obrigatória |

**Penetração:** modelo simplificado por `energiaRestante - custo(material, espessura)`. Sem simular perfuração ilimitada através de múltiplas paredes. Ricochetes somente em superfícies autorizadas e ângulos definidos; não gerar acerto aleatório impossível de prever.

### 21.6. Modelo de dano proposto

```text
DanoFinal = DanoBase
          × MultiplicadorRegiao
          × QuedaPorDistancia
          × Protecao
          × MultiplicadorDificuldade
```

- Dano base por **arma**; região e proteção são aplicadas uma vez.
- Queda por distância configurável; não reduzir dano de explosão por distância duas vezes.
- Cálculo de dano em um módulo puro; animação, áudio e HUD apenas consomem o resultado.
- O projétil pode bater em equipamento antes da pele: primeiro resolver o equipamento atingido e **só depois** eventual transferência de dano.
- Armas de fogo não geram *knockback* físico exagerado: usam reação animada e impulso pequeno e limitado.

## 22. Sistema anatômico de acertos nos membros

### 22.1. Hitboxes independentes do visual

O inimigo usa uma **hitbox de locomoção** (cápsula principal) e **hitboxes anatômicas auxiliares** presas ao esqueleto ou atualizadas por matrizes de ossos. Um raycast de tiro usa as auxiliares; locomoção e navegação usam a cápsula. A máscara `CHARACTER_HITBOX` não deve colidir com cápsula e mesh cosmética no mesmo disparo.

| ID técnico | Região | Multiplicador inicial | Reação primária |
|---|---|---:|---|
| `head` | Cabeça sem proteção | 3,0× | Reação crítica e alta chance de neutralização |
| `neck` | Pescoço | 2,0× | Forte desequilíbrio; área menor |
| `chest` | Peito | 1,0× | Contração/retrocesso leve |
| `abdomen` | Abdômen | 1,1× | Curvar, recuperar postura |
| `pelvis` | Quadril/pelve | 1,15× | Desequilíbrio e perda temporária de velocidade |
| `upperArm_L/R` | Braço superior | 0,65× | Ombro recua do lado atingido |
| `forearm_L/R` | Antebraço | 0,55× | Braço abaixa, piora temporária da mira |
| `hand_L/R` | Mão | 0,35× | Reação rápida; chance controlada de soltar arma |
| `thigh_L/R` | Coxa | 0,8× | Passo falho, redução breve de movimento |
| `shin_L/R` | Canela | 0,65× | Cambalear ou ajoelhar |
| `foot_L/R` | Pé | 0,4× | Tropeço curto e mudança de apoio |
| `equipment` | Capacete/arma/outro | Especial | Evento do objeto; não tratar como carne |

Multiplicadores não representam medicina ou balística real; são apenas pontos de partida de **game design**. O `head` não precisa ser sempre morte instantânea em todos os modos, mas deve causar vantagem consistente e legível. O ajuste de dificuldade não pode transformar uma perna em região de dano maior que a cabeça sem comunicar a regra.

### 22.2. Estados de reação por membro

| Região atingida | Primeiro acerto válido | Acertos subsequentes / forte dano | Recuperação |
|---|---|---|---|
| Cabeça exposta | Reação crítica | Neutralização de acordo com saúde/arma | Não há reação de combate após morte |
| Peito | Recuo curto + perda momentânea de mira | Pode interromper tiro e forçar cobertura | 0,35–0,7 s |
| Abdômen | Curvar torso | Recua para cobertura; menor agressividade | 0,6–1,2 s |
| Braço esquerdo | Recua braço esquerdo | Mira treme, pode interromper recarga | 0,45–0,9 s |
| Braço direito | Recua braço direito | Perda breve de precisão; solta arma em caso crítico | 0,45–0,9 s |
| Mão com arma | Reflexo de mão | Pode derrubar arma se condição alcançada | 0,25–0,6 s |
| Coxa | Mancada momentânea | Reduz corrida; pode cair de joelhos | 0,8–1,5 s |
| Canela | Cambalear | Queda controlada por animação | 0,8–1,5 s |
| Pé | Tropeço | Reposiciona o pé, abandona investida | 0,45–1 s |
| Capacete | Estalo metálico / faíscas discretas | Capacete se solta conforme regras do cap. 23 | Ver equipamento |

**Importante:** não reproduzir incapacitações médicas exatas; reações são legíveis, moderadas e ajustáveis. Sem desmembramento ou mutilação explícita na proposta padrão. Efeitos de sangue podem ser opcionais, discretos e desativáveis.

### 22.3. Subestados que influenciam IA sem quebrá-la

```text
COMBAT
 ├─ HIT_FLINCH (overlay de torso/membro)
 ├─ STAGGER (compromete movimento por pouco tempo)
 ├─ KNEEL (queda breve com possibilidade de levantar)
 ├─ DISARMED (perde arma; procura abrigo, item ou recua)
 ├─ LIMB_PENALTY (redução temporária de precisão/mobilidade)
 ├─ SUPPRESSED (seconde reação por projéteis próximos)
 └─ DEAD (estado terminal, sem disparar, sem completar recarga)
```

- Reações de **braço** podem ser *additive overlays* sobre andar/correr, sem congelar pernas.
- Reações de **perna** devem interromper *root motion* inadequada e remapear navmesh/cápsula se houver queda.
- A IA mantém seu alvo conhecido, mas pode perder precisão; **não esquece magicamente o combate**.
- Reacerto durante `HIT_FLINCH`: mesclar ou elevar severidade, nunca reiniciar 20 vezes a mesma animação em loop.
- Janela de imunidade **apenas para nova animação de flinch** (ex.: 0,18 s), não imunidade ao dano: todos os impactos válidos contam.
- Prioridade: `DEAD > EXPLOSION_KNOCKDOWN > STAGGER > DISARM > FLINCH > AIM/RELOAD > LOCOMOTION`.

### 22.4. Consequências temporárias e permanentes

| Efeito | Gatilho inicial | Duração/limite | Resultado |
|---|---|---|---|
| `aimPenalty` | Dano relevante em braço/mão | 2–4 s, decai | Aumenta cone de disparo, cancela rajada se necessário |
| `movePenalty` | Dano relevante em perna | 2–5 s, decai | Velocidade 65–85% do normal |
| `stagger` | Alto dano instantâneo | 0,45–1,2 s | Animação balanceada; não trava permanentemente |
| `dropWeapon` | Dano crítico na mão/braço que segura arma | Uma vez por arma | Arma cai como prop e IA muda estratégia |
| `kneel` | Perna + grande desequilíbrio | 1–2 s | Ajoelha/cai, levanta se apto |
| `suppression` | Projétil passa próximo | 1,5–4 s | Abaixa postura, menor cadência e mira |
| `noHelmet` | Evento de capacete | Resto da fase/save | Visual e colisão coerentes |

**Anti-exploit:** ferimentos em braços/pernas não devem permitir prender o mesmo NPC indefinidamente em animações de dor sem que ele aja. A cada nova reação, usar cooldown e peso máximo acumulado. Inimigos podem optar por recuar em vez de continuar recebendo tiros parados.

### 22.5. Reações em ângulo e direção

Um disparo acertando braço direito não deve sempre reproduzir o mesmo `hit_front`. Definir `localHitDirection = inverse(actorRotation) × shotDirection` e escolher o quadrante (frente, trás, esquerda, direita), lado e intensidade. O sistema usa *additive animation* para tronco e membro. Caso não haja animação específica carregada, fallback obrigatório para `hit_generic` com orientação correta — nunca deixa o inimigo imóvel.

### 22.6. Integridade de inimigos após morte

- Uma única transição para `DEAD`; remover imediatamente a capacidade de disparar ou causar dano por contato.
- Não repetir áudio de dor por eventos tardios.
- Corpo deixa de ser alvo de dano jogável, exceto efeitos cosméticos opcionais.
- Percepção, pathfinding e chamadas de reforço são cancelados.
- Arma e capacete derrubados seguem as regras físicas e de limpeza, sem duplicação de objetos.
- Missão só registra oponentes neutralizados quando o sistema confirma o estado terminal; não contar flinch como morte.

## 23. Capacetes que caem e equipamentos físicos

### 23.1. Fantasia visual e regra funcional

**Cena-alvo:** o jogador acerta o capacete de um soldado; surge um impacto metálico, o capacete inclina, desprende-se do crânio, gira pelo ar, bate no chão e permanece visível por algum tempo. O soldado continua com cabeça, cabelo e anatomia completa, agora **sem capacete**. Se ainda estiver vivo, muda de comportamento e pode procurar cobertura.

Esse resultado precisa vir da **colisão com o capacete** — nunca sorteio de uma animação genérica quando o tiro atingiu o pé.

### 23.2. Componentes do asset

```text
EnemyRoot
 ├─ Skeleton
 │   ├─ spine / arms / legs
 │   └─ head_bone
 ├─ HeadMesh (sempre presente)
 ├─ HairOrScalpMesh (não pode faltar após retirar capacete)
 ├─ HelmetSocket (transform preso a head_bone)
 │   └─ HelmetAttachedMesh (visível enquanto equipado)
 ├─ HelmetHitCollider (seguindo HelmetSocket)
 ├─ AnatomyHitboxes
 └─ WeaponSocket
```

O **mesh da cabeça é independente** do capacete. Rig e transform são auditados por modelo: escala em metros, orientação frontal, pivô do capacete no centro de massa visual, normais, materiais, nome do osso e offset de fixação.

### 23.3. Estados do capacete

```text
ATTACHED
  ├─ impacto fraco -> ATTACHED_DAMAGED -> ATTACHED
  └─ impacto suficiente -> DETACHING -> AIRBORNE -> RESTING -> CULLED

NONE (NPC sem capacete no spawn)
```

- `ATTACHED_DAMAGED` pode produzir ricochete e som sem soltar.
- `DETACHING` dura apenas a transição atômica de desanexar a malha ao mundo, preservando a matriz mundial.
- `AIRBORNE` usa velocidade linear e angular; `RESTING` dorme física e mantém colisor leve.
- `CULLED` remove somente o objeto físico do cenário por distância/tempo; **o soldado continua sem capacete**.
- Ao salvar, persistir o estado `hasHelmet=false` e, se necessário, a posição do prop em repouso; não reconstruir capacete na cabeça.

### 23.4. Regras do acerto e da transferência de dano

- Collider de capacete tem prioridade somente quando o tiro **realmente** atravessa a região do equipamento antes da cabeça.
- Capacete tem resistência configurável, por exemplo `helmetDurability = 24` unidades de design, independente da saúde do soldado.
- Um impacto em ângulo raso pode defletir parte da energia; um impacto direto consome mais durabilidade.
- Se a resistência chegar a zero, ocorre `helmet/detached`; um impacto de alto impulso também pode soltar direto, com limiar configurável.
- Dano remanescente **pode** passar à cabeça, conforme `transferRatio`; o capacete não é invulnerabilidade nem protege tiros no rosto.
- Quando separado, o capacete torna-se prop sem hitbox de cabeça; tiros futuros na cabeça usam `head` normal.
- **Sem capacete duplicado:** `detachmentId` gerado no evento; chamadas repetidas ignoradas por estado/ID.

**Valores iniciais:**

| Variável | Valor de protótipo | Nota |
|---|---:|---|
| `durability` | 24 | Abstração de balanceamento |
| `detachThreshold` | 20 | Impulso normalizado, por evento |
| `transferRatio` | 0,45 | Fração de dano de tiro bloqueado que passa |
| `ejectionSpeed` | 2,0–4,5 m/s | Limitado por qualidade de simulação |
| `angularVelocity` | 4–10 rad/s | Giro moderado, sem hélice exagerada |
| `groundRestTime` | 10–25 s | Ajustado conforme orçamento de props |
| `maxActiveHelmets` | 12 desktop / 5 mobile | Excedente vira estático/é descartado cosmicamente |

Esses números **não equivalem à resistência real de capacetes históricos**. Não modelar como orientação balística real.

### 23.5. Impulso e física de queda

```text
pontoSoltura = HelmetSocket.worldPosition
normalImpacto = collision.normal
vetorSaida = normalize(normalImpacto * 0.65 + up * 0.4 + shotDirection * 0.15)
velocidadeInicial = vetorSaida * clamp(impulso, velocidadeMin, velocidadeMax)
spinInicial = eixoTangencial * velocidadeAngular
```

O motor físico não precisa ser empregado no corpo inteiro: capacetes podem usar `Rapier`/física leve ou um integrador simplificado com colisão contra chão e cenário estático. **Nunca** ativar física completa da cabeça só para tirar o capacete. O capacete não pode atravessar o teto ou cair para baixo da superfície; colisão contínua ou substeps para objetos rápidos.

### 23.6. Feedback de equipamento

- Impacto em metal: som curto em 3D, pequena faísca ou poeira de tinta.
- Desprendimento: som de fivela/metal e reação breve do soldado (sem pausa de 2 s).
- Queda no piso: som por superfície (`pedra`, `madeira`, `metal`, `terra`) com máximo de 2–3 bounces audíveis.
- No HUD, **não exibir número de durabilidade do capacete inimigo**: o efeito visual conta a história.
- Capacete de oficiais, boinas e quepes usam variantes próprias; um boné de tecido não deve fazer som de metal.
- Objetos estáticos e personagens distantes podem usar versão simplificada da animação sem simulação de corpo rígido.

### 23.7. Casos que precisam de testes

- [ ] Tiro no rosto não remove capacete se não atravessou o collider do capacete.
- [ ] Tiro na borda do capacete pode soltá-lo sem registrar dano na cabeça duas vezes.
- [ ] Ao soltar, cabeça e cabelo permanecem completos e alinhados.
- [ ] O inimigo pode continuar vivo, procurar cobertura e ser acertado de novo.
- [ ] Capacete não é recriado ao voltar para a sala ou carregar o checkpoint.
- [ ] Capacete cai sobre escadas, caixas e pisos inclinados sem afundar.
- [ ] Física não derruba FPS com dez capacetes no chão.
- [ ] Tiros subsequentes no equipamento solto não machucam seu antigo dono.
- [ ] Soldado sem capacete no spawn não gera capacete ao morrer.
- [ ] Não há clone de capacete por troca de LOD nem por reload do modelo GLB.

## 24. Armas, munição e inspeção no jogo

### 24.1. Contrato de dados completo da arma

Cada arma declara `id`, `category`, `displayName`, `ammoType`, `magSize`, `reserveCapacity`, `fireMode`, `rpm`, `baseDamage`, `falloffStart`, `falloffEnd`, `spreadHip`, `spreadADS`, `recoilPattern`, `recoilRecovery`, `adsMs`, `reloadStages`, `effectiveRange`, `noiseRadius`, `projectileType`, `penetrationEnergy`, `effects`, `clips`, `handPose`, `viewModel`, `worldModel`, `pickupId` e `animationSet`. Valores ausentes falham na validação do asset, em vez de criar arma invisível ou sem recarga.

### 24.2. Perfis de balanceamento (protótipos)

| Arma/classe de referência | Modo | Dano base | Cadência aprox. | Papel tático | Fraqueza |
|---|---|---:|---:|---|---|
| Walther P38 / pistola | Semiauto | 32 | 350 RPM (limite de input) | Arma secundária | Pente limitado |
| Pistola silenciada | Semiauto | 27 | 320 RPM | Infiltração | Menor dano e munição escassa |
| Sten / MP40 | Automático | 19–21 | 500–550 RPM | Curta distância | Dispersão em rajada |
| StG 44 | Automático | 25 | 450 RPM | Versátil | Recuo sustentado |
| BAR | Automático | 35 | 450 RPM | Supressão intensa | Peso e munição |
| Rifle com luneta | Semiauto | 65 | 70 RPM prático | Longa distância | ADS mais lento |
| Escopeta | Manual | 8 × 9 pellets | 70 RPM | Salas e corredores | Perde eficiência ao longe |
| Besta | Projétil | 85 | 20 RPM | Remoção silenciosa de alvos | Projétil lento/queda |
| Granada | Arremesso | Área | — | Desalojar cobertura | Recurso limitado |
| Panzerfaust/bazuca | Projétil pesado | Antiveículo | — | Blindados | Raridade e área perigosa |

**Não são estatísticas do jogo original nem dados de uso real de armas.** São referências iniciais para sentir diferenças entre categorias. Ajustar em playtest contra `100 HP` de soldado padrão, evitando múltiplos tiros na cabeça sem feedback convincente.

### 24.3. Recarga e interrupções

```text
READY -> FIRE -> RECOVER -> READY
   |                  |
   +-> RELOAD_START -> MAG_OUT -> MAG_IN -> CHAMBER -> READY
   |                   |          |         |
   |                   +-------- cancelável por dano grave/fuga
   +-> EMPTY -> DRY_FIRE -> RELOAD_START
```

- Munição só sai do inventário quando o evento de inserção/municiamento realmente ocorre; animação cancelada não duplica projéteis.
- No rifle/escopeta de munição unitária, recarga por unidade, permitindo interromper após completar uma unidade.
- Em carregadores, definir se munição remanescente é conservada; adotar sistema simples e legível como padrão.
- A interrupção por dano de braço só atua na etapa permitida, sem gerar estado `stuckReload=true`.
- O HUD deve atualizar munição no frame em que o estado de munição mudou, não no começo da animação.
- Se a arma foi removida da mão, impedir disparo de evento tardio da animação `fire`.

### 24.4. Interações com equipamento

- Troca de arma com animação de baixar/erguer; opção rápida para arma secundária.
- Arma derrubada por NPC é **prop físico visual**; pickup de arma só se o design da missão permitir.
- Não adicionar dezenas de armas sem identidade: cada peça tem função, som, recarga e peso específicos.
- Arma sem munição não executa muzzle flash ou raycast; faz `dryFire` audível.
- Mão e cano nunca atravessam parede: usar pose de proximidade e bloqueio de tiro.

## 25. IA aprimorada: combate, percepção e ferimentos

### 25.1. Camadas de decisão

```text
Diretor do encontro (squad) -> objetivo do grupo / reforços
  IA individual (utility/state) -> postura, alvo, cover, flanco
    Navegação -> destino válido, portas/escadas/corredores
      Animação -> locomotion/aim/reload/hit
        Percepção -> som, visão, dano recebido, companheiros
```

Nenhuma camada deve exigir que cada NPC execute pathfinding completo em todos os frames.

### 25.2. Percepção justa

| Estímulo | Comportamento | Limitação |
|---|---|---|
| Jogador à vista | Aumenta certeza, mira e alertas | Exige LOS e FOV |
| Disparo silenciado | Investiga alcance local | Não alerta toda a fase |
| Disparo de arma automática | Grupo próximo procura origem | Oclusão e distância importam |
| Colega ferido | Gira para ocorrência e busca cobertura | Não recebe posição exata do jogador por telepatia |
| Capacete atingido | Reação imediata, aumento de ameaça | Não equivale a detectar inimigo escondido atrás de parede |
| Granada visível | Tenta se afastar ou procurar cobertura | Precisa de tempo mínimo de reação |
| Corpo encontrado | Estado `SEARCH/ALERT` | Deve ver o corpo, não detectar através da parede |
| Alarme acionado | Reforços de spawn autorizado | Respeita pontos de chegada e condições de fase |

### 25.3. Táticas e papéis

- **Rifleiro:** mantém distância média, usa janela de tiro, sai de cobertura pontualmente.
- **SMG agressivo:** tenta encurtar distância, mas recua quando suprimido.
- **Oficial:** coordena rádio e aponta alvos, podendo virar objetivo prioritário.
- **Metralhador:** fixa ângulo de fogo; necessita linha de tiro e feedback claro.
- **Granadeiro:** lança granada somente quando há rota plausível e ângulo livre.
- **Atirador:** muda janela após alguns disparos quando tiver rota disponível.
- **Soldado ferido no braço:** mira pior, busca cobertura ou recua; não continua usando arma como se nada ocorresse.
- **Soldado ferido na perna:** cancela corrida; busca cobertura mais próxima, pode se ajoelhar e atirar se for possível.
- **Soldado desarmado:** busca arma secundária autorizada ou se retira; não gera arma invisível na mão.
- **Soldado sem capacete:** mantém capacidade de combate; pode escolher postura mais conservadora, sem bônus artificial em dano.

### 25.4. Supressão e moral

Ao passar projétil a uma distância inferior a `suppressionRadius`, acumular `suppression`. A IA usa esse valor para baixar postura, atrasar tiro e migrar para cobertura. Decair gradualmente quando a ameaça cessa. **Acerto direto e projétil próximo não podem contar duas vezes como dois tiros**. Moral do grupo pode variar por isolamento, morte de líder, explosão próxima e apoio disponível; não tornar todos os soldados fugitivos automaticamente.

**Parâmetros iniciais:** `suppressionRadius=1,2 m`, decaimento completo de 3–5 s, avaliação de decisão a cada 0,2–0,5 s no inimigo próximo, 0,8–1,5 s em inimigo distante. Medidas sujeitas a teste de dificuldade e performance.

### 25.5. Cobertura e flanqueamento

- Cada ponto de cobertura guarda posições para pé/agachado, direção protegida e exposição.
- Uma cobertura só é válida se estiver do lado certo da ameaça e não ocupada por outro NPC.
- Flanco usa rota navmesh com custo de exposição; não atravessa cenário, portas trancadas ou região não carregada.
- IA atira somente quando a arma, a boca do cano e o alvo têm caminho livre.
- Quando o jogador domina uma entrada, IA pode recuar, usar granada com aviso ou contornar; nunca surgir materializada atrás do jogador.
- Lançamento de granada não pode ser acionado enquanto o NPC está em `DEAD`, `DISARMED`, `STAGGER` ou sem granada equipada.

### 25.6. Aliados inteligentes e escolta

- Comandos opcionais e simples: **seguir**, **aguardar**, **cobrir**, **interagir** quando explicitamente permitido pela fase.
- Aliados evitam a linha de tiro e reagem à presença de inimigos.
- Diálogos de rádio avisam eventos importantes em vez de legendas permanentes na tela.
- Aliados essenciais podem ter estado `DOWNED` recuperável se a missão permitir; não usar invulnerabilidade invisível que contradiga briefing.
- Se um caminho falha, replanejar; somente corrigir posição em ponto seguro, fora da visão e sem distorcer combate.

### 25.7. Orçamento de IA e controle de dificuldade

| Cenário | Alvos visuais simultâneos | IA tática ativa | Atualização |
|---|---:|---:|---|
| Interior pequeno | 3–8 | 3–8 | Frequente |
| Rua / praça | 6–14 | 5–10 próximos | Dinâmica por distância |
| Grande clímax | 12–20 | 6–10 próximos | LOD de IA + eventos |

Limites são referências e **não** promessa de hardware. Pessoas visíveis não precisam de decisão tática completa todo frame. Dificuldade pode ajustar tempo de reação, frequência de cobertura, flanco e recursos; não deve dar a NPCs visão por paredes.

## 26. Animação, física e reação cinematográfica

### 26.1. Biblioteca mínima por arquétipo humano

| Grupo | Clipes e variantes necessários |
|---|---|
| Locomoção | idle, walk_forward, jog, run, strafe_L/R, backpedal, turn_in_place, crouch_move |
| Combate | aim_pistol, aim_rifle, fire_single, fire_burst, reload_pistol, reload_rifle, switch_weapon |
| Contexto | investigate, radio_call, check_body, open_door, operate_alarm, surrender/retreat opcional |
| Dano | hit_head, hit_chest, hit_abdomen, hit_arm_L/R, hit_leg_L/R, stagger, kneel, disarm |
| Capacete | head_recoil_light, helmet_recoil, flinch_unhelmeted |
| Queda | fall_forward, fall_backward, fall_side_L/R, recover_from_kneel, death |
| Especial | climb, mounted_gun, vehicle_passenger, interact_object, escort_signal |

Mínimo de qualidade: a direção do walk realmente combina com o vetor de deslocamento, mãos acompanham arma, pés não deslizam fortemente, IK de mira não dobra punhos para trás e o personagem não teleporta ao sair da animação de dano.

### 26.2. Layers de animação

```text
Base:        locomoção + stance (em pé/agachado)
Upper body:  mira, disparo, recarga, uso de rádio
Additive:    impacto localizado / respiração / recoil
Face/head:   olhar e reação discreta
Terminal:    queda, morte, ragdoll leve
```

- *Upper-body mask* inclui braços, ombros, peito e pescoço conforme necessidade.
- *Hit overlay* evita sobrescrever animação das pernas em um tiro no braço.
- Ao entrar em `STAGGER`, interromper estados incompatíveis com callback explícito.
- Se faltar clip específico, fallback não bloqueante.
- Mistura com duração entre 0,08 e 0,25 s, ajustada ao tipo de clip, sem interpolações bruscas.

### 26.3. Queda e ragdoll econômico

- Fallback garantido: animação de queda pré-autoral, seguida de pose final estável.
- Opcional: *partial ragdoll* em tronco/membros por curto período (0,5–1,2 s), então estabiliza e converte em corpo estático.
- Não ativar dezenas de corpos físicos completos simultaneamente.
- Colisor de corpo não pode bloquear uma saída obrigatória; `corpseCollision` reduzida e separada da navegação.
- Em reentrada no cenário, cadáveres podem ser representados por pose estática persistente, sem reaplicar animação de morte.
- Impactos de explosão usam impulso global limitado; não arremessar o personagem dezenas de metros.

### 26.4. Integração de modelos GLB

Checklist por modelo: [ ] frente e escala corretas; [ ] rig válido; [ ] cabeça presente sem capacete; [ ] nomes/aliases dos ossos reconhecidos; [ ] `HelmetSocket` calibrado; [ ] `WeaponSocket` na mão; [ ] clips em unidades/s; [ ] sem *root translation* involuntária; [ ] material sem transparência indevida; [ ] LOD mantém cabeça e capacete separados; [ ] animador não mexe na escala da arma.

**Compatibilidade:** criar mapeamento de ossos (`Hips`, `Spine`, `Head`, `LeftUpperArm`, etc.) e perfil de retarget por asset; nunca presumir que o mesmo nome existe em todos os GLBs.

## 27. HUD 2.0 — design, estados e responsividade

### 27.1. Objetivo visual

O HUD transmite **sobrevivência, navegação e missão** sem esconder inimigos. Direção de arte: painel militar discreto, contrastes moderados, tipografia legível, ícones autorais inspirados em instrumentos de campanha da década de 1940. Evitar blocos neon futuristas, minimapa gigante, barra de vida sobre cada soldado e marcadores permanentes em todas as portas.

### 27.2. Layout principal (desktop 16:9)

```text
┌───────────────────────────────────────────────────────────────────┐
│   N / NE / E                  OBJETIVO ATUAL             [!] rádio  │
│  BÚSSOLA        Fotografe o documento (1/2)             suspeita  │
│                                                                   │
│                                                                   │
│                     + / retículo dinâmico                         │
│                 [E] Abrir porta (contextual)                       │
│                                                                   │
│                                                                   │
│ [VIDA 76]  [ícone curativo ×1]       MP40  21/96   [AUTO]        │
└───────────────────────────────────────────────────────────────────┘
```

**Legenda:** o desenho é uma especificação de posicionamento, não exigência de moldura desenhada na tela. Dentro da tela real, usar áreas semi-transparentes pequenas e legíveis, sem barras ocupando toda a largura.

### 27.3. Módulos do HUD

| Módulo | Posição proposta | Sempre visível? | Atualização |
|---|---|---|---|
| Vida + estado | Inferior esquerdo | Sim no modo clássico; dinâmico no mínimo | Quando sofrer dano/curar |
| Arma/munição | Inferior direito | Sim no modo clássico; some após 4 s sem evento no dinâmico | Disparo, recarga, troca |
| Retículo | Centro | Sim se configurado | Dispersão e interação |
| Bússola | Centro superior | Sim no clássico; opcional nos demais | Orientação e direção de dano |
| Objetivo atual | Superior discreto | Entrada e atualização; ocultável | Só em eventos |
| Interação | Próximo ao centro inferior | Não | Somente no alcance e LOS |
| Aviso de ameaça | Borda correspondente à direção | Não | Apenas quando há dano/ameaça clara |
| Suspeita/disfarce | Próximo à bússola | Não | Apenas em contexto de espionagem |
| Status de arma | Próximo à munição | Quando necessário | Sem munição, recarregando, emperramento se existir |
| Mensagem aliada/radio | Superior esquerdo | Não | Falas e pistas relevantes |
| Indicador veículo | Contextual | Não | Quando assumiu veículo/torrinha |
| Inventário rápido | Próximo à vida | Curto após troca | Pickup e seleção |

### 27.4. Indicadores de acerto e feedback de dano

- **Acerto comum:** um *hit marker* branco/sutil no retículo por cerca de 0,12 s, se habilitado.
- **Acerto em equipamento:** marcador próprio opcional + som metálico; nunca confundir com headshot.
- **Acerto na cabeça:** variante discreta de som/retículo, sem fogos ou números arcade.
- **Armadura/capacete soltando:** feedback pelo próprio mundo 3D; HUD pode apresentar apenas hit marker de equipamento.
- **Dano ao jogador:** vinheta direcional curta, tremor leve, sem apagar visão durante 2 segundos.
- **Baixa vida:** indicador pulsante moderado e respiração; alternativa sem pulsação para acessibilidade.
- **Não exibir dano numérico flutuante por padrão**, para manter atmosfera militar.

### 27.5. Três presets de HUD

| Preset | Visível em exploração | Visível durante combate | Uso |
|---|---|---|---|
| **Clássico PS1+** | Bússola/vida, munição e retículo | Tudo + indicação de dano | Familiaridade e acessibilidade |
| **Dinâmico (padrão)** | Retículo e objetivo temporário | Vida/munição por 4 s após evento, indicação direcional | Limpo e informativo |
| **Cinematográfico** | Nada além de prompts necessários | Indicadores sob demanda (segurar Tab) | Captura e imersão |

O preset cinematográfico **não esconde avisos críticos obrigatórios** (ex.: explosão iminente, interação disponível ou alerta de falha iminente), salvo configuração acessível específica.

### 27.6. HUD em 4:3, 16:9, ultrawide e mobile

- Ancorar módulos às **safe areas**, nunca em coordenadas fixas 1920×1080.
- 4:3: objetivo compacto e bússola reduzida; preservar centro livre.
- Ultrawide: limitar distância dos módulos às bordas da área de referência para não obrigar movimentos excessivos dos olhos.
- Mobile: se houver port, controle virtual configurável e zonas de toque independentes; a campanha não deve depender dele.
- Tipografia dimensionada por escala de UI, com mínimo legível, opções 80–140%; ícones com rótulo quando necessário.
- Contraste e estados devem funcionar com modo daltônico, sem depender só de verde/vermelho.

### 27.7. Mapa, bússola e navegação

- **Sem minimapa GPS permanente por padrão**: a exploração é parte do jogo.
- Bússola mostra orientação e, quando solicitado, marcador de objetivo conhecido; não revela objetivo ainda não descoberto.
- Mapa em papel no diário, quando a fase disponibiliza inteligência cartográfica.
- Para a fuga de sidecar, indicador próprio de ameaça e rota; não reutilizar HUD de infantaria sem adaptação.
- Setas de objetivo só aparecem após evento de rádio, pista encontrada ou tempo de ajuda configurável; não substituem projeto de sinalização ambiental.

### 27.8. HUD de contextos especiais

| Contexto | Substituições | Não deve acontecer |
|---|---|---|
| Disfarce | Medidor discreto de suspeita e credencial | Exibir inimigos por paredes |
| Fotografia | Moldura de câmera, foco, prova encontrada | Abrir pause ao fotografar |
| Documento | Visualizador com scroll e botão fechar | Exigir sair do pause depois de fechar |
| Metralhadora fixa | Arco de tiro e munição da arma | Mostrar munição da pistola como ativa |
| Sidecar | Arma montada, vida do transporte, direção de perigo | HUD pedestre sobreposto |
| Explosivos | Ícone da carga e estado de armamento | Objetivo concluir antes de posicionar explosivo |
| Escolta | Estado do aliado e instrução curta | Barra gigante de aliado sempre na tela |
| Resultados | Precisão, objetivos, recursos, alertas e medalhas | Mostrar HUD de combate atrás do relatório |

### 27.9. Animação e timings de interface

- Entrada de objetivo: 0,2–0,35 s; visível 3–5 s; atualizado somente quando mudou.
- Pickup: 1,5–2,5 s; empilhar no máximo 3 mensagens, agrupando repetidas.
- Interação: aparece após *targeting* estável de 0,06–0,12 s; não pisca entre dois objetos próximos.
- Dano: indicação direcional 0,3–0,6 s; múltiplos tiros prolongam moderadamente.
- Munição recarregada: atualização sincronizada ao evento da animação, não por temporizador do HUD.
- Legenda e rádio: respeitar leitura e não cortar fala por evento comum de pickup.

### 27.10. Pausa, documentos, fotografia e ponteiro do mouse

**Contrato de UI:** um *único stack* de telas com prioridade e comandos explícitos. `Esc`/`B` sempre fecha **somente a tela do topo**; se não houver tela, abre pause. Fechar documento devolve ao estado exato de antes, sem deixar menu de pausa residual. Se o mundo for congelado durante um documento, a suspensão é um token temporário, liberado ao fechar, sem acionar `PAUSED`.

```text
GAMEPLAY
 ├─ DOCUMENT_VIEW (freezeToken=document; fechar -> GAMEPLAY)
 ├─ CAMERA_VIEW (freeze conforme missão; fechar -> GAMEPLAY)
 ├─ MAP_VIEW (fechar -> GAMEPLAY)
 └─ PAUSE_MENU (freezeToken=pause; continuar -> GAMEPLAY)

NÃO PERMITIDO: DOCUMENT_VIEW -> PAUSE_MENU automático -> GAMEPLAY
```

`pointerLock` deve ser reassumido por gesto do jogador quando a plataforma exigir, com indicador explícito. Não forçar pointer lock programaticamente após perda de foco sem interação.

## 28. Movimentação, câmera e controle avançado

### 28.1. Movimento a pé

- **Andar:** velocidade inicial 2,7 m/s, postura de exploração.
- **Corrida:** 4,7 m/s enquanto segurado, sem sprint infinito estilo arena; ajuste por missão.
- **Agachado:** 1,5 m/s, reduz exposição e ruído, aumenta precisão.
- **Saltos:** curtos, em obstáculos realmente navegáveis; não transformar num jogo de plataforma.
- **Descida e escadas:** colisão contínua e passos coerentes, sem oscilação de câmera.
- **Passo lateral:** direção independente do olhar, com strafing limpo.
- **Inclinar em cobertura (*lean*):** opção Q/E quando livre de interações, com bloqueio por colisão; não permitir ver ou disparar através de parede.
- **Deitar (*prone*):** opcional e só se todas as fases tiverem espaço/colisão revisados; não colocar como pré-requisito do protótipo.

**Números são tuning em unidades de mundo configuradas como metros**. Garantir que escala real de portas, inimigos e armas corresponda ao movimento.

### 28.2. Câmera em primeira pessoa

- Altura base de olhos coerente com personagem, ex.: 1,61 m para protagonista de 1,72 m; altura agachado proporcional.
- Bob de caminhada muito discreto, desligável.
- FOV ajustável 70–100° (equivalente horizontal em 16:9, informar convenção).
- Sem rotação inesperada ao receber dano; reduzir *camera shake* por acessibilidade.
- ADS não move origem da câmera através do cenário; o viewmodel se ajusta para ela.
- Near clip cuidadosamente configurado e *weapon clipping* tratado com estado de proximidade.
- A câmera nunca herda diretamente rotação bruta de osso da cabeça de um rig animado.

### 28.3. Controles refinados

| Ação | PC sugerido | Gamepad sugerido | Opção |
|---|---|---|---|
| Mover | WASD | Esquerdo | Remapeável |
| Mirar câmera | Mouse | Direito | Sensibilidade X/Y |
| ADS | Segurar botão direito | LT/L2 | Alternar/segurar |
| Tiro | Esquerdo | RT/R2 | Vibração opcional |
| Recarga | R | X/Quadrado | Prioridade sobre interação |
| Interação | E | A/Cruz | Segurar para interações perigosas |
| Agachar | Ctrl/C | B/Círculo | Alternar/segurar |
| Saltar | Espaço | Y/Triângulo | — |
| Inclinar | Q / botão lateral | Comando configurável | Desligável |
| Trocar arma | 1–5/scroll | LB/RB | Roda de armas opcional |
| Diário/objetivos | Tab | View | Sobreposição, sem pause extra |
| Pause | Esc | Options | Fecha topo da UI primeiro |
| Foto/documento | E ao interagir | A/Cruz | Modo contextual |

O usuário pode optar por layouts originais aproximados, porém o padrão moderno deve ter comportamento previsível.

### 28.4. Feedback de personagem

- Passos por material e velocidade; agachar reduz alcance auditivo.
- Recuo da arma é maior no viewmodel que o deslocamento de câmera, para evitar enjoo.
- Landing e pequenas quedas geram som e leve deslocamento visual; evitar dano aleatório por degrau minúsculo.
- Colisão de portas não empurra a câmera através da parede.
- Se o personagem sofre dano, feedback visual e áudio não ocultam o inimigo por tempo excessivo.

## 29. Danos ao jogador, recursos e dificuldade

### 29.1. Saúde e sinais

- **Saúde base:** 100 pontos no modo padrão; regeneração automática **desativada** por padrão para conservar tensão e valor dos kits.
- **Primeiros socorros:** restauram quantidade fixa (ex.: 25/50), sem ultrapassar 100.
- **Dano direcional:** usa direção da origem do tiro confirmada pelo sistema.
- **Perto da morte:** áudio de respiração, leve vinheta e indicador, sem filtros que inviabilizem mirar.
- **Queda:** dano apenas acima de limiar configurável; evitar quebrar missão por degrau mal modelado.
- **Explosões:** dano por distância com oclusão, mais efeito de supressão; não duplicar por cada partícula da explosão.
- **Fogo:** se usado, dano ao longo do tempo com duração e cooldown explícitos, opção de acessibilidade visual.

### 29.2. Reações e proteção do jogador

A câmera não deve perder controle por longos períodos. Pode existir oscilação curta ao atingir braço/perna, mas não manter limitações anatômicas permanentes sem sistemas de cura e interface claros. Preferir penalidades discretas de mira/mobilidade em desafios avançados, **desligadas no modo Clássico**.

### 29.3. Economia de munição

- Tipos de munição por família, não uma bolsa universal.
- Pickup somente no alcance/contato permitido; mostrar `+20 munição SMG` como mensagem temporária.
- Munição de objetivo obrigatório garantida por posicionamento validado, não spawn milagroso invisível.
- Capacidade de reserva e suprimentos definidos por fase e dificuldade.
- Inventário não pode perder recurso crítico ao mudar de fase sem aviso de briefing.

### 29.4. Revisão da dificuldade

| Variável | Recruta | Soldado | Veterano |
|---|---|---|---|
| Vida inicial | Cheia | Política do cap. 5 | Vida transportada |
| Tempo de reação IA | Mais lento | Padrão | Mais curto, mas justo |
| Precisão inimiga | Menor | Padrão | Moderadamente maior |
| Recursos | Mais | Padrão | Menos |
| Dano por região | Diferenciação leve | Padrão | Padrão, sem exagero |
| Capacete físico | Sempre ativo | Sempre ativo | Sempre ativo |
| Informações de HUD | Tutoriais claros | Dinâmico | HUD configurável |

Não vincular física e taxa de disparo ao FPS. Dificuldade deve ficar nos dados, não espalhada por dezenas de `if` sem teste.

## 30. Cenários vivos e destruição controlada

### 30.1. Objetos com impacto

| Objeto | Resposta | Persistência |
|---|---|---|
| Capacete | Solta, gira, quica e repousa | Estado do soldado persiste |
| Arma derrubada | Prop cai da mão | Estado do soldado persiste |
| Garrafa/caixa leve | Quebra/desloca | Opcional por orçamento |
| Janela | Quebra parcial, som e partículas | Estado de quebra persiste |
| Lâmpada | Apaga e gera fragmentos | Estado e luz persistem |
| Porta de madeira | Marcas; pode quebrar se roteirizada | Porta/objetivo persistem |
| Barricada | Segmentos com vida | Persistência se impacta navegação |
| Rádio/alarme | Desliga após interação/dano autorizado | Obrigatória se objetivo |
| Veículo | Partes, fumaça, destruição | Obrigatória |
| Documento | Foto/coleta, registro de evidência | Obrigatória |

### 30.2. Física com camadas de prioridade

- **Gameplay:** personagens, portas, cobertura, veículos e projéteis que podem machucar.
- **Interativa:** capacetes, armas e caixas que não alteram objetivo obrigatório.
- **Cosmética:** cápsulas de cartucho, poeira, farpas e fragmentos.
- Queda de FPS degrada primeiro **cosméticos**, depois a simulação de props interativos distantes, **nunca** hit registration ou missões.
- Não permitir que fragmentos físicos cosméticos obstruam o raycast de disparos.

### 30.3. Feedback de superfície

Impacto precisa ler tipo de material (`stone`, `metal`, `wood`, `glass`, `dirt`, `flesh`, `helmet`) e usar recursos de pool distintos: decal, som, partículas, ruído para IA. Usar atlas e instancing quando possível. Limitadores evitam dezenas de decals no mesmo local.

### 30.4. Destruição contextual sem mundo totalmente destrutível

Barricadas planejadas, vidro, rádios e certos veículos podem quebrar; edifícios inteiros **não precisam ser destrutíveis** para o jogo parecer vivo. Destruição de parede que muda rota só deve existir se navmesh, colisores, save e objetivos tiverem suporte explícito.

## 31. Espionagem, exploração, documentos e objetivos

### 31.1. Sistema de disfarce

- `disguiseQuality` varia por uniforme, local, acesso e condição do personagem.
- Suspeita sobe por comportamento visível: correr em área restrita, apontar arma, fotografar em frente a guarda, permanecer muito perto por muito tempo.
- Guardas podem investigar sem detectar automaticamente.
- Documentos/credenciais desbloqueiam portões **somente** se validados por sistema de objetivo, não por possuir qualquer papel no inventário.
- HUD mostra apenas estado aproximado (`seguro`, `suspeita`, `comprometido`), não porcentagem onisciente por padrão.

### 31.2. Fotografia de inteligência

```text
Entrar CAMERA_VIEW -> enquadrar alvo com raycast + ângulo + distância
 -> validar alvo e mínimo de visibilidade
 -> pressionar disparador
 -> reproduzir som da câmera (ou silencioso, conforme equipamento)
 -> guardar evidenceId e preview leve
 -> atualizar objetivo exatamente uma vez
 -> sair de CAMERA_VIEW diretamente para GAMEPLAY
```

- Se não houver alvo válido, não completar objetivo.
- A câmera nunca confunde disparar foto com disparar arma.
- Objeto de foto pode ter highlight **somente** após pista ou orientação de missão.
- Guardas podem reagir ao ato de fotografar se o presenciaram.
- Foto não exige screenshot de resolução inteira para ser salva como prova: registrar identificador e miniatura opcional.

### 31.3. Documentos e investigação

- Documentos têm `id`, `title`, `pages`, `voiceLine` opcional, `isCritical`, `objectiveId` e `readState`.
- Visualizador permite zoom, virar página, scroll, tradução/legenda.
- Coletar é diferente de ler: pegar documento registra item; leitura apresenta conteúdo.
- Sair do documento retorna para jogo **sem pause adicional**; reabrir pelo diário quando liberado.
- Um documento crítico não pode ser colocado numa área inacessível após evento destrutivo.

### 31.4. Portas, chaves e interação

- Distância e linha de visão validadas; priorizar objeto para o qual jogador está olhando, não simplesmente o mais próximo.
- Porta tem estados `LOCKED`, `CLOSED`, `OPENING`, `OPEN`, `CLOSING`, `BROKEN` com transições explícitas.
- Um objeto pode bloquear uma porta, mas não deve gerar softlock irreversível.
- Chaves têm ID específico; `keyFactoryA` não abre `doorCastleNorth` por coincidência de texto.
- Interações longas exibem barra somente quando justificável (colocar carga, arrombar, operar mecanismo).

### 31.5. Checkpoints e retorno a áreas

- Checkpoint após trecho significativo, antes de sequência especial e após objetivo caro.
- Persistir: portas, fotos, sabotagem, equipamentos removidos dos NPCs relevantes, inimigos essenciais, munição/vida, posição de aliados, alarmes e timer da missão.
- Encontros de backtracking precisam de regra por fase (`oneShot`, `reinforcementAfterAlarm`, `respawnNever`); **não** renascer soldados por simples troca de sala se não houver justificativa.
- Transição de cenário não pode duplicar pickups ou restaurar capacetes de inimigos já encontrados.

## 32. Som, música e efeitos reativos

### 32.1. Arma em camadas

- `mechanical`: gatilho/ferrolho/recarga, audível perto.
- `report_near`: disparo em campo próximo.
- `tail_outdoor`: reverberação externa distinta de interior.
- `tail_indoor`: reflexo curto por sala.
- `distant`: tiro ouvido à distância e relevante para IA.
- `impact`: som segundo material e zona.
- `whiz`: projétil passando perto da câmera ou NPC.

### 32.2. Acertos localizados

| Evento | Som | VFX |
|---|---|---|
| Tiro no capacete | Impacto metálico curto | Faísca pequena/lasca |
| Capacete cai em pedra | Quicadas metálicas com atenuação | Pequena poeira |
| Tiro no braço/perna | Reação vocal moderada e roupa | Feedback discreto, sem gore obrigatório |
| Tiro na madeira | Lasca seca | Farpas e decal |
| Tiro no metal | Impacto agudo | Faísca breve |
| Near miss | Estalo/assobio posicional | Supressão sutil |
| Soldado alerta | Voz curta coerente com facção | Nenhum HUD excessivo |

As falas de inimigos precisam variar, ter *cooldown* e não disparar simultaneamente por 12 personagens.

### 32.3. Música dinâmica

- `EXPLORE`: instrumental discreto e tensão contextual.
- `SUSPICIOUS`: camadas rítmicas leves, cresce se patrulha investiga.
- `COMBAT`: intensidade sobe com tempo/ameaça real, não só porque um NPC viu o jogador a 100 m.
- `RESOLUTION`: retorna calmamente quando contato termina.
- `MISSION_CLIMAX`: trilha autoral específica para fuga/explosão/chegada de aliados.
- `MISSION_END`: tema de conclusão separado do loop musical.

**Regra de produção:** todas as composições, samples, foley, imagens e vozes devem ser autorais ou licenciadas para uso no projeto; referência ao estilo não é autorização para copiar arquivos do jogo comercial.

## 33. Especificação por campanha — como as mecânicas evoluem

### 33.1. Campanha 1 — Paris ocupada / **Occupied!**

| Fase | Mecânica principal ampliada | Evento de demonstração | HUD/IA |
|---|---|---|---|
| 1-1 Midnight Rendez-Vous | Pistola, cover, tiro localizado, porta e aliado | Guarda perde capacete; contato indica garagem | Objetivo contextual, aliado guia caminho |
| 1-2 Amongst the Dead | Baixa luz, passos e busca | Guarda investiga ruído e pode ser atingido no braço | Bússola e áudio guiam exploração |
| 1-3 Without a Trace | Sigilo, reconhecimento e alarme | Oficial interrompido antes de completar chamada | Suspeita contextual |
| 1-4 Tread Carefully | Defesa, granadas, blindado e fuga | Tiros em soldados não substituem munição antiblindado | HUD de ameaça e objetivos consecutivos |

**Vertical slice recomendado:** 1-1 precisa ter ao menos uma arma, dois tipos de reação local, um capacete físico, uma porta interativa, um aliado, um objetivo e extração. Em seguida, expandir para mais estados, nunca tentar 27 mapas de uma vez.

### 33.2. Campanha 2 — Norte da África / **Hunting the Desert Fox**

- **Casablanca:** múltiplas entradas, teto/escada, combate em quartos pequenos, estilhaços de vidro e busca por documentos.
- **Lighting the Torch:** disfarce, suspeita progressiva, rádio de campo, fotografia contextual e credencial.
- **Burning Sands:** cargas de demolição, caminhões com zonas de dano, explosões em cadeia **scripted** e feedback do objetivo.
- **Ally in the Desert:** visibilidade ampliada, cobertura escassa, combate de longo alcance e defesa da retirada.
- **Novo foco da IA:** guardas distinguem denúncia/alarme de simples ruído; não usam GPS para localizar a protagonista.

### 33.3. Campanha 3 — Creta / **Undercover in Crete**

- Fotografia de mapa de rotas, permissões de circulação e áreas portuárias.
- Ruínas com hitboxes de pedra precisas; tiros não passam por pilares.
- Artilharia com dano contextual, destruição por objetivo e HUD específico.
- IA mantém linha de visão coerente em corredores de pedra e galerias.
- Ambiente mediterrâneo com vento, aves e água leve; sem custo alto de sombra dinâmica.

### 33.4. Campanha 4 — Wewelsburg / **Dark Camelot**

- Besta silenciosa com projétil físico, queda gravitacional e coleta de munição se prevista.
- Interior de castelo utiliza oclusão, passos por material e reverb curto.
- Inimigos com armaduras exibem proteção e reações próprias **sem tratá-las como capacete genérico**.
- Teleférico com câmera controlada, entrada/saída segura e checkpoints.
- Alarme/sirenes controlam busca e reforços; destruí-los muda estado sistêmico persistente.

### 33.5. Campanha 5 — Monte Cassino

- Corredores apertados: cobertura de coluna, escopeta eficaz no curta distância, tiro no braço interrompe ataque.
- Prisioneiros têm pathfinding, pontos de espera e reação a fogo inimigo.
- Salas/celas possuem estados de porta e chave salvos.
- Objetivo de resgate exige que NPC chegue de fato à área segura, não só ativação do trigger.
- Evitar que cadáveres, capacetes ou armas no chão bloqueiem a passagem de aliados.

### 33.6. Campanha 6 — Mittelwerk

- Fábrica com materiais de metal, madeira e concreto, vapor e máquinas leves.
- Sabotagem em etapas: adquirir carga, armar, sair de área, detonar, fuga.
- Explosão muda iluminação e abre rota, sem alterar partes não previstas da fase.
- Sidecar ganha HUD próprio, ângulos de mira restritos, detecção de colisão e checkpoints de trecho.
- Inimigos de moto usam movimento em spline, não IA de pedestre colada à moto.

### 33.7. Campanha 7 — Libertação de Paris

- Battlefield urbano com aliados, barricadas e sons de tiros distantes sem 50 NPCs ativos simultâneos.
- Reconhecer locais revisitados: destruição, cartazes, iluminação e civis em abrigo.
- Combate contra metralhadoras, veículos e atiradores em janelas com armas adequadas por objetivo.
- Capacidade da IA de aliados não deve comprometer frame rate nem travar rotas estreitas.
- Fase 7-4 termina com sequência de vitória, registro de conclusão e créditos, **não** com menu de depuração.

### 33.8. Campanha bônus

Armas experimentais, armaduras especiais, robôs e inimigos caricatos podem usar status e colisões próprios, mas não devem contaminar regras de realismo da campanha principal. HUD arcade e trilha exclusiva são opcionais. Separar em `gameMode=BONUS` com assets, IA e balanceamento independentes.

## 34. Arquitetura recomendada para Three.js/WebGL

### 34.1. Módulos adicionais da v2

```text
src/
  combat/
    FireControl.js               # input -> disparo autorizado
    Ballistics.js                # hitscan/projéteis e obstruções
    SurfaceResponse.js           # materiais, ricochete e impacto
    HitboxRegistry.js            # anatomia e prioridade de colisão
    DamageResolver.js            # cálculo de dano puro
    LimbStatusSystem.js          # penalidades temporárias e estados
    ArmorEquipmentSystem.js      # equipamento e resistência
    HelmetDetachSystem.js        # detach físico e cleanup
    SuppressionSystem.js         # near miss e moral
    WeaponAnimationSync.js       # eventos de recarga/arma
  characters/
    RigProfile.js
    CharacterAnimator.js
    HitReactionController.js
    RagdollBudget.js
  physics/
    PhysicsWorld.js
    PropBodyPool.js
    CollisionLayers.js
  ui/
    HUDState.js
    HUDRenderer.js
    HUDPresets.js
    HitIndicators.js
    UIStack.js
    CameraViewer.js
    DocumentViewer.js
  qa/
    CombatDebugOverlay.js
    CombatTelemetry.js
```

O projeto existente pode ter outra estrutura: adaptar os módulos **sem sobrescrever o que já funciona**. Este diagrama descreve responsabilidades, não exige renomear todo o repositório.

### 34.2. Camadas de colisão

| Layer | Raios/contatos aceitos | Observação |
|---|---|---|
| `WORLD_SOLID` | Personagem, projétil, visão | Paredes, piso e cobertura |
| `CHARACTER_CAPSULE` | Locomoção/AI | Não aplicar dano por duplicidade |
| `CHARACTER_HITBOX` | Tiros e explosões apropriados | Anatomia por região |
| `EQUIPMENT_HITBOX` | Tiros | Capacete, arma e proteção |
| `PROJECTILE` | Mundo e personagens | Substeps contra atravessamento |
| `INTERACTIVE_PROP` | Física decorativa relevante | Capacetes soltos, arma caída |
| `COSMETIC` | Somente render/efeito | Estojos e partículas não bloqueiam tiros |
| `TRIGGER` | Interação, missão, extraction | Não bloqueia bala nem movimento |

**Ordenação:** raycast encontra impactos na frente e escolhe primeiro contato válido; hitbox anatomicamente mais específica tem prioridade sobre a cápsula dentro do mesmo personagem, mas nunca sobre parede anterior.

### 34.3. Evento único de impacto

```js
// Exemplo de contrato de dados, não implementação completa.
const hitEvent = {
  shotId: 'shot-18331',
  shooterId: 'player',
  targetId: 'guard-017',
  weaponId: 'sten',
  hitboxId: 'forearm_R',
  equipmentId: null,
  worldPoint: [1.1, 1.42, -3.5],
  normal: [0.2, 0.5, 0.84],
  shotDirection: [0.1, -0.02, -0.99],
  distanceM: 13.4,
  baseDamage: 20,
  material: 'cloth',
  tick: 9321
};
```

**Processamento:** `Ballistics -> HitboxRegistry -> ArmorEquipment -> DamageResolver -> LimbStatus -> AI -> Animation/Audio/HUD`. O pipeline mantém `shotId` e `targetId` para evitar dano duplicado. Eventos do HUD não alteram saúde.

### 34.4. Exemplo de equipamento de capacete

```json
{
  "id": "helmet_steel_mk1",
  "socket": "HeadSocket",
  "hitbox": "helmetCollider",
  "durability": 24,
  "detachThreshold": 20,
  "transferRatio": 0.45,
  "attachedModel": "assets/equipment/helmet_attached.glb",
  "detachedModel": "assets/equipment/helmet_prop.glb",
  "impactMaterial": "steel_helmet",
  "maxWorldLifetimeMs": 25000,
  "persistentEquippedState": true
}
```

A hitbox de capacete acompanha o `HelmetSocket` **antes** de cada consulta de tiro. Em animação de cabeça, sua matriz não pode atrasar um frame.

### 34.5. Exemplo de personagem com membros

```json
{
  "archetypeId": "infantry_rifle",
  "health": 100,
  "rigProfile": "human_ww2_v1",
  "equipment": ["helmet_steel_mk1", "rifle_standard"],
  "hitRegions": {
    "head": {"bone": "Head", "multiplier": 3.0},
    "chest": {"bone": "Spine2", "multiplier": 1.0},
    "forearm_R": {"bone": "RightForeArm", "multiplier": 0.55},
    "shin_L": {"bone": "LeftLeg", "multiplier": 0.65}
  },
  "statusResistances": {"flinchCooldownMs": 180},
  "onDisarmed": "retreat_or_switch_secondary"
}
```

Os exemplos exibem **trechos** de configuração, não todas as hitboxes de produção. Validador do pipeline precisa apontar bone ausente e asset inválido.

### 34.6. Salvamento v2 e migração

```json
{
  "saveVersion": 2,
  "missionId": "01-01",
  "player": {"health": 76, "ammo": {"smg": 96}},
  "missionState": {"objectives": {}, "doors": {}, "evidence": []},
  "enemies": {
    "guard-017": {
      "state": "COMBAT",
      "health": 46,
      "position": [2.1, 0.0, -5.4],
      "equipment": {"helmet_steel_mk1": {"equipped": false}},
      "temporaryStatus": {"aimPenaltyRemainingMs": 0, "movePenaltyRemainingMs": 1700},
      "weapon": {"id": "rifle_standard", "loaded": 3}
    }
  },
  "worldProps": [
    {"id": "helmet-guard-017-1", "type": "helmet_steel_mk1", "resting": true,
     "position": [2.4, 0.05, -5.0]}
  ],
  "settings": {"hudPreset": "dynamic"}
}
```

- Salvar somente props físicos importantes para continuidade visível e os que estiverem próximos. A persistência **obrigatória** é a condição de equipamento do NPC, não cada giro do capacete no ar.
- Migrar `saveVersion=1` inferindo equipamento a partir do arquétipo e regras explícitas, não restaurando silenciosamente inimigos já desarmados em saves existentes quando houver informação.
- Reabrir uma fase pelo replay usa estado inicial da fase; voltar pelo checkpoint usa estado salvo.

### 34.7. Ordem de atualização para evitar bugs

```text
INPUT
 -> SIMULATION TICK (tempo fixo)
    -> movimento/colisão e atualização de rig
    -> sincronização hitboxes/sockets
    -> armas/projéteis e registros de impacto
    -> resolução de dano/equipamento
    -> status + decisões IA
    -> física de props e veículos
    -> objetivos e triggers
    -> eventos de animação/áudio/HUD
 -> RENDER FRAME (interpolação)
```

O *render* pode variar, mas o disparo não pode causar dano duplo em dispositivos de 144 Hz nem ficar mais lento a 30 FPS. Usar no máximo um número controlado de *substeps* físicos e reportar picos.

### 34.8. Orçamento inicial de desempenho

| Subsistema | Meta de orçamento (desktop médio) | Degradação recomendada |
|---|---|---|
| Simulação de gameplay | 60 ticks/s preferencialmente | Nunca perder eventos de objetivo/tiro |
| Física cosmética | Até 12 capacetes ativos | Dormir/culling de props antigos |
| Decals | Até 80 por setor visível | Remover mais antigos não essenciais |
| Partículas de impacto | Pool de 200–400 | Reduzir densidade e vida |
| Som 3D | 24–40 vozes ativas | Prioridade a tiros próximos e diálogo |
| IA próxima | 6–10 cérebros táticos | Atualização por distância |
| Texturas | Atlases e formatos compactos | LOD, mipmaps, compressão |
| GLBs | Carregamento e descarregamento por setor | Pré-carregar objetivo/arma/rig |

São metas candidatas: medir por dispositivo (GPU/CPU/memória). Para computadores antigos, **manter clareza de tiro e objetivo acima de partículas e física cosmética**.

## 35. Telemetria, depuração e QA de combate

### 35.1. Painel de diagnóstico (somente build de QA)

O overlay de debug, desligado no jogo público, deve permitir: mostrar hitboxes por região; mostrar colisor de capacete; indicar material acertado; último `shotId`; dano bruto/final; direção do impacto; estado da arma e da recarga; estado de IA; ponto conhecido do jogador; cobertura escolhida; quantidade de corpos e capacetes ativos; FPS e custo da física.

### 35.2. Cenas de teste reproduzíveis

| Cenário | Preparação | Resultado esperado |
|---|---|---|
| Alvo parado sem capacete | Um soldado a 10 m | Tiro na cabeça usa hitbox correta, sem equipamento imaginário |
| Soldado com capacete | Mesma distância, equipamento íntegro | Impacto inicial de metal, transferência de dano conforme dados |
| Capacete se solta | Repetir acerto até limiar | Um único prop aparece e cabeça permanece completa |
| Soldado permanece vivo | Equipamento sai, saúde maior que zero | NPC continua animando e pensando corretamente |
| Tiro no braço direito | NPC com rifle em movimento | Reação à direita, precisão piora e volta a normal |
| Tiro na mão que segura arma | Condição crítica configurada | Arma cai uma vez, IA muda para `DISARMED` |
| Tiro na coxa | NPC correndo | Cambaleia, diminui velocidade, não desliza |
| Tiro na canela | NPC subindo escada | Fallback não atravessa degraus, não teleporta |
| Rajada rápida | Dez impactos em 0,5 s | Dano soma, animação não reinicia infinitamente |
| Parede antes do NPC | NPC atrás de concreto | Impacto na parede, dano ao NPC igual a zero |
| Vidro antes do NPC | Vidro autorizado a penetrar | Vidro quebra, energia residual atinge alvo uma vez |
| Cano próximo à parede | Jogador colado à parede | Bala acerta parede, sem disparo através da parede |
| Dois raycasters ativos | Modelo com malha e hitbox | Um disparo não gera dano duplo |
| Física baixa taxa | Limitar a 30 FPS | Mesmo dano e mesmos objetivos do teste a 60 FPS |
| Dez capacetes | Grupo de inimigos equipados | Física mantém orçamento e não bloqueia missão |
| Save com capacete no chão | Salvar/carregar | NPC continua sem capacete; prop opcional é coerente |
| Troca de LOD | Aproximar/afastar NPC sem capacete | Capacete não reaparece na cabeça |
| Abrir documento | Interagir, ler, fechar | Retorna para gameplay com só um fechamento |
| Foco perdido | Alt-Tab e retornar | HUD não fica travado; controle recuperável |
| Morrer durante recarga | NPC/arma num estado intermediário | Cancelamento atômico, sem disparo fantasma |

### 35.3. Critérios de aprovação quantitativos

- **100%** dos disparos confirmados no alvo de teste têm `hitRegion` válido ou `world` explícito.
- **0** dano duplo em bateria automatizada de 10 mil disparos com um único alvo/collider principal.
- **0** duplicações de capacete em 500 eventos de desprendimento com saves/reloads aleatórios.
- **0** estados `DISARMED` com arma disparando depois da queda.
- **0** casos em que `DOCUMENT_VIEW` exige sair do pause para voltar a jogar.
- **0** *softlocks* de objetivo nos testes roteirizados da primeira fase.
- **100%** dos inimigos da primeira fase têm animação de resposta funcional ou fallback documentado.
- **Meta de fluidez:** 60 FPS no hardware-alvo definido; medir percentis de frame time, não só média.

Esses números são **metas de aprovação futuras**, não resultados já verificados.

### 35.4. Testes automatizados recomendados

```text
unit/damage-region.test.js
unit/armor-damage-transfer.test.js
unit/helmet-detach-once.test.js
unit/weapon-reload-cancel.test.js
unit/projectile-wall-occlusion.test.js
unit/suppression-near-miss.test.js
unit/mission-objective-idempotent.test.js
integration/enemy-limb-reaction.test.js
integration/helmet-save-restore.test.js
integration/ai-disarmed-fallback.test.js
integration/document-ui-stack.test.js
integration/physics-30fps-vs-60fps.test.js
e2e/mission-01-01-completion.spec.js
e2e/hud-modes-keyboard-gamepad.spec.js
```

**Nota:** nomes propostos de testes, não arquivos já criados. Usar testes unitários para cálculo puro e browser/headless para input, animação, cena e interface reais.

### 35.5. Matriz de desempenho visual

Testar três presets (`Baixo`, `Médio`, `Alto`) com: 0/3/10 capacetes no chão, 2/8/16 inimigos visíveis, 0/20/80 decals e 0/5 explosões em sequência. Registrar FPS, `frameTime p95`, tempo da física, textura/memória quando acessível, quantidade de chamadas de desenho, tempo de carregamento e regressões visuais. A qualidade **Baixo** não pode desativar funcionalidade do capacete; somente simplificar sua física e efeito.

## 36. Menus 2.0, acessibilidade e qualidade de vida

### 36.1. Menu principal e safehouse

- **Continuar:** checkpoint válido mais recente, mostrando campanha/fase/data.
- **Campanha:** seleção de operações desbloqueadas, dificuldade e breve sinopse.
- **Registro de missões:** tempo, precisão, alvos, informações, medalhas e replay.
- **Arquivo de inteligência:** documentos/fotos coletados, com filtros por campanha.
- **Arsenal:** informações das armas desbloqueadas, sem transformar jogo histórico em loja de cosméticos.
- **Opções:** gráficos, som, câmera, HUD, teclas/gamepad, idioma, acessibilidade e dados salvos.
- **Créditos:** autores e licenças de assets e música.

### 36.2. Configurações gráficas

| Opção | Baixo | Médio | Alto |
|---|---|---|---|
| Resolução interna | Adaptativa | Nativa/dinâmica | Nativa e AA adequado |
| Sombras | Selecionadas/baked | Selecionadas | Mais sombras próximas |
| Física de props | Queda simplificada | Rigidbodies limitados | Rigidbodies limitados, mais detalhes |
| Partículas | 25–40% | 60–75% | 100% do orçamento |
| Decals | Poucos | Médio | Alto |
| Reflexos | Materiais baratos | Materiais moderados | Conforme hardware |
| LOD/Impostors | Trocas mais cedo | Padrão | Trocas mais distantes |

### 36.3. Acessibilidade

- Remapear teclado e gamepad, inversão de eixo, sensibilidade horizontal e vertical, zona morta e curvas de analógico.
- Alternar ou segurar ADS/agachamento; zoom de interface e legendas com identificação de locutor.
- Opção para reduzir tremor de câmera, flashes, vinhetas pulsantes e *head bob*.
- Ajuste de FOV, retículo (forma, espessura, tamanho e cor) e tamanho do HUD.
- Modos de contraste, indicadores não dependentes exclusivamente da cor.
- Alternativa discreta ou sem sangue; reações e capacetes continuam funcionais.
- Ajuda contextual de navegação opcional para quem não deseja se perder.
- Configurações persistidas separadamente do progresso da missão.

## 37. Roadmap revisado: ordem para implementação real

### REV-A — Combate mínimo verificável (P0)

- [ ] Validar escala e controlador FPS, câmera e colisão.
- [ ] Implementar uma pistola e uma SMG com estado de munição, disparo e recarga.
- [ ] Separar hitbox de locomoção de hitboxes de cabeça/peito/braços/pernas.
- [ ] Implementar resolver de dano único com dados da arma e região.
- [ ] Criar reações básicas de cabeça, torso, braço direito/esquerdo e pernas.
- [ ] Construir HUD com vida, munição, retículo e objetivo contextual.
- [ ] Terminar um campo de testes reproduzível de combate.

**Condição de entrega:** 100 disparos simulados em cada região geram identificação correta; nenhum tiro através de parede; FPS medido.

### REV-B — Capacetes, desarme e IA reativa (P0/P1)

- [ ] Preparar `HeadMesh` independente de capacete em pelo menos dois inimigos.
- [ ] Criar HelmetSocket, colisor de equipamento e evento de desprendimento atômico.
- [ ] Animar e simular a queda do capacete com som e impacto.
- [ ] Incorporar `aimPenalty`, `movePenalty`, `disarm`, `stagger` e cooldown de reações.
- [ ] Reagir a projéteis próximos com supressão e procura por cobertura.
- [ ] Garantir que soldado sem arma/sem capacete mantenha IA coerente.
- [ ] Testar salvar/carregar estado de capacete removido.

**Condição de entrega:** 500 desprendimentos sem duplicação; soldado mantém cabeça íntegra; testes de carga passam.

### REV-C — HUD avançado e interação (P1)

- [ ] Presets Clássico, Dinâmico e Cinematográfico.
- [ ] Indicadores de acerto por corpo/capacete/ambiente.
- [ ] Bússola, objetivos temporários, prompts contextuais e direção de dano.
- [ ] Stack robusto de pause, documento, foto e mapa.
- [ ] Teclado, mouse e gamepad com mapeamento confiável.
- [ ] Ajustes acessíveis de UI, retículo, FOV e câmera.

**Condição de entrega:** documento abre e fecha sem pause residual; todos os modos mantêm prompts essenciais; controle reanuda após perda de foco.

### REV-D — Vertical slice completa: 1-1 (P1)

- [ ] Cenário de Paris com interiores, ruas, garagem e iluminação noturna.
- [ ] Dois arquétipos de guarda, um aliado e eventos de rádio.
- [ ] Reações localizadas, capacetes, cobertura e flanqueamento limitado.
- [ ] Missão completa: briefing -> infiltração/contato -> garagem -> extração.
- [ ] Save/load e resultados; sem objetivo preso e sem loading de asset invisível.
- [ ] Medição dos três presets em desktop e modo de baixo desempenho.

**Condição de entrega:** completar 1-1 do menu até o relatório **sem console de desenvolvimento**, em teclado/mouse e gamepad.

### REV-E — Escala para a campanha 1 e demais (P2–P5)

- [ ] Produzir 1-2, 1-3 e 1-4 reaproveitando componentes testados.
- [ ] Adicionar sistema de espionagem/câmera/credencial antes da campanha 2.
- [ ] Criar veículos, cargas e props destrutíveis quando a campanha exigir.
- [ ] Produzir campanhas 2–7 em sequência, cada qual com validação de início/fim.
- [ ] Separar bônus, multiplayer e cosméticos do caminho crítico de zerar o jogo.
- [ ] Ao finalizar 7-4: créditos, resultados, conclusão persistida e replay.

### 37.1. Matriz de prioridade de subsistemas

| Subsistema | Prioridade | Dependências | Risco principal |
|---|---|---|---|
| Hitboxes anatômicas | P0 | Rig/colisão | Dano duplicado |
| Balística e cobertura | P0 | Physics/raycast | Tiro atravessar parede |
| Reações localizadas | P0 | Animator | Mãos invertidas/foot sliding |
| Capacete destacável | P1 alto | Rig, equipamento, prop physics | Cabeça invisível/duplicação |
| Recarregar/soltar arma | P1 alto | Weapon state machine | Arma fantasma |
| HUD dinâmico | P1 | Eventos/game state | Informação atrasada |
| IA de supressão | P1 | Percepção e navegação | Inimigos sem reação útil |
| Documentos/fotos sem pause | P0 | UI stack | Dois fechamentos para voltar |
| Física cosmética | P2 | Performance budget | Queda de FPS |
| Ragdoll parcial | P3 | Animator + physics | Instabilidade e colisão |
| Conteúdo das 27 fases | P2–P5 | Core da campanha | Mapas incompletos |

## 38. Definição de pronto (DoD) da versão aprimorada

Um recurso só é considerado **concluído** quando:

1. O comportamento está implementado na cena real, não apenas listado no MD.
2. Os dados são validados e a transição de estados não duplica efeito.
3. Existem animação e áudio corretos ou fallback coerente.
4. Não há erro no console nem asset invisível sob carregamento.
5. Funciona com teclado/mouse e controle, quando aplicável.
6. Suporta pausas, leitura de documentos e perda de foco sem ficar preso.
7. Save/load preserva os fatos de gameplay essenciais (incluindo equipamento removido).
8. O efeito existe no preset **Baixo**, ainda que com visual simplificado.
9. Um teste reproduzível foi executado e seu resultado registrado.
10. O recurso não quebra objetivos, IA aliada, transição, replay ou conclusão da fase.

### 38.1. Relatório obrigatório por revisão

```text
REVISÃO: ___ | COMMIT: ___ | URL PAGES: ___
IMPLEMENTADO (com arquivos/funções modificados):
- ...
TESTES AUTOMATIZADOS (passou/falhou):
- ...
PLAYTEST REAL (fase, roteiro, passos e evidências):
- ...
COMBATE: hitbox ___ | capacete ___ | reações ___ | recarga ___
HUD: presets ___ | interação ___ | pausa/documento ___
IA: percepção ___ | supressão ___ | mobilidade ferida ___
PERFORMANCE: hardware ___ | FPS médio ___ | p95 ___ | draw calls ___
FALHAS NOVAS/REGRESSÕES:
- ...
NÃO IMPLEMENTADO / NÃO TESTADO:
- ...
PRÓXIMA PRIORIDADE BASEADA EM BUGS REAIS:
- ...
```

### 38.2. Critérios finais do produto

- Campanha principal: **24/24 fases** termináveis; bônus: **3/3** termináveis quando liberadas.
- Dano localizado verificável em cabeça, tronco, dois braços e duas pernas, com zonas finas conforme orçamento.
- Capacetes destacados com colisão, animação/áudio, integridade do personagem e persistência do estado.
- HUD legível em resoluções-alvo, com três presets e modo contextual de missão.
- IA sob supressão e ferimentos sem comportamento injusto ou travamento de rota.
- Documentos, fotografia, pausa e objetivos sem fluxo de UI duplicado.
- Save/restore, replay de fase, conclusão e créditos sem regressões.
- Entrega em GitHub Pages e modo offline (quando implementado) com a mesma campanha e assets essenciais.

## 39. Referência versus projeto independente

Esta ampliação não determina fazer uma reprodução comercial não autorizada. O jogo original, seus personagens, missões, trilha, arte, marcas e audiovisual pertencem aos respectivos titulares. Para publicar uma obra própria, usar universo, personagens, cenários, diálogos, áudio, imagens, mapas e modelos originais ou devidamente licenciados, aproveitando **mecânicas e princípios gerais** de design. O projeto pode adotar outro título e narrativa própria sem perder o espírito de FPS de espionagem na Segunda Guerra.

### 39.1. Fontes adicionais para contextualizar o original

- **Manual da versão PlayStation de *Medal of Honor: Underground*:** descreve bússola que indica direção do dano, vida ao redor da bússola, inventário, armas e menu de objetivos. https://manuals.plus/m/1fa32c180f3db85e606a7ddf9ed67484b2ca4310edf523e4d2d85e82a7f315e2
- **GameFAQs — Walkthrough de Wayalla (2003):** inclui observações de jogabilidade sobre tiros na cabeça e atordoamento ao atingir braços/pernas. https://gamefaqs.gamespot.com/ps/914389-medal-of-honor-underground/faqs/24042
- **GameFAQs — Guide de Odino (2009):** controles, modos de mira, dificuldade, níveis e extras. https://gamefaqs.gamespot.com/ps/914389-medal-of-honor-underground/faqs/56088

**Atenção de pesquisa:** essas fontes dão contexto ao **jogo original**; os sistemas de estado físico, equipamento destacável, física de capacetes, HUD com presets, tuning numérico, IA e arquitetura de código desta Parte II são todos **propostas novas**.

---

**FIM DO DOCUMENTO — GDD v2.0 | referência original + mecânicas aprimoradas**
