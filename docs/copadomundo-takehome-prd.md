# PRD: Simulador da Copa do Mundo

## 1. Visão Geral do Produto

Uma aplicação web **Single Page Application (SPA)** 100% executada no lado do cliente (Client-Side). O sistema consome dados reais de uma API externa, gerencia o estado da simulação do torneio na memória do navegador e processa regras de negócio complexas de forma autônoma.

Ao final, envia os resultados do campeão de volta para a infraestrutura da empresa. Todo o motor lógico é garantido por uma suíte de testes unitários desenvolvida sob a ótica do **TDD (Test-Driven Development)**.

---

## 2. Stack Tecnológica e Arquitetura

- **Core:** Angular (Standalone Components), TypeScript, HTML5, Tailwind CSS.
- **Qualidade e Testes:** Jest. O foco absoluto de cobertura de testes será na lógica de negócio e serviços.
- **Arquitetura:** Padrão Angular (Core/Shared/Features)
  - `app/core`: Centraliza serviços singleton, modelos de dados globais e a configuração da API. É o "cérebro" da aplicação.
  - `app/shared`: Componentes de UI, pipes e diretivas reutilizáveis que não possuem conhecimento das regras de negócio.
  - `app/features`: Módulos/Componentes que encapsulam as funcionalidades específicas (Fase de Grupos, Mata-Mata).
- **Metodologia:** TDD aliado ao **Spec-Driven Development**. Os testes ditarão o design e as especificações das funções antes da implementação real.

---

## 3. Modelos de Dados

Definidos em `app/core/models` antes de qualquer implementação de serviço.

```typescript
// team.model.ts
interface Team {
  id: string;       // UUID retornado pela API — identificador imutável e principal
  name: string;
  flag?: string;    // URL da bandeira, se fornecida pela API
}

// match.model.ts
interface Match {
  teamA: Team;
  teamB: Team;
  goalsA: number;
  goalsB: number;
  penaltyA?: number;  // Preenchido apenas se houve disputa de pênaltis
  penaltyB?: number;
}

// group.model.ts
interface Group {
  label: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
  teams: Team[];
  matches: Match[];
}

// standing.model.ts
interface Standing {
  team: Team;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

// round.model.ts
interface Round {
  matches: Match[];
}

// knockout-match.model.ts
interface KnockoutMatch {
  id: string;                      // ex: 'R16-1', 'QF-1', 'SF-1', 'F'
  round: 'R16' | 'QF' | 'SF' | 'F';
  teamA: Team | null;              // null até o classificado da rodada anterior chegar
  teamB: Team | null;
  result?: Match;                  // preenchido após simulação
  winner?: Team;
  childA?: KnockoutMatch;          // partida que gerou o teamA
  childB?: KnockoutMatch;          // partida que gerou o teamB
}

// tournament-state.model.ts
interface TournamentState {
  teams: Team[];
  groups: Group[];
  knockoutRoot: KnockoutMatch | null;  // raiz da árvore binária do mata-mata
  champion: Team | null;
}
```

---

## 4. Gerenciamento de Estado e Dados

- **Estado em Memória:** In-memory state management via Angular Services (utilizando Signals).
- **Persistência de UX:** Salvamento automático no `LocalStorage` para evitar perda de progresso em caso de recarregamento da aba (F5).
- **Chave do LocalStorage:** `wc-simulator:state`
- **Schema persistido:** Objeto `TournamentState` serializado como JSON, contendo `teams`, `groups`, `knockoutRoot` (árvore binária do mata-mata) e `champion`.

---

## 5. Requisitos Funcionais

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RF01 | Ingestão de Dados | Consumir a API via `GET` para obter as 32 seleções (header `git-user` obrigatório). O modelo `Team` deve preservar o **UUID** retornado pela API como identificador principal de cada equipe. |
| RF02 | Sorteio e Agrupamento | Distribuir aleatoriamente as seleções em 8 grupos (A-H), com exatamente 4 equipes por grupo. Exibir a formação completa na tela antes do início das partidas. |
| RF03 | Motor de Simulação | Gerar placares e simular as 3 rodadas da Fase de Grupos (todos contra todos dentro de cada grupo), com 2 jogos por rodada. |
| RF04 | Classificação | Calcular pontos (Vitória: 3pts, Empate: 1pt) e aplicar desempate em cascata: **1º Pontos → 2º Saldo de Gols → 3º Sorteio**. Os 2 primeiros de cada grupo avançam. |
| RF05 | Árvore de Mata-Mata | Processar o chaveamento das oitavas até a final seguindo a regra: 1º do Grupo A vs 2º do Grupo B, 1º do Grupo C vs 2º do Grupo D, e assim por diante. Empates resolvidos via pênaltis. |
| RF06 | Finalização | Enviar o resultado da final via `POST` (header `git-user`). Os campos `equipeA` e `equipeB` do payload devem conter os **UUIDs** preservados desde a ingestão — **nunca o nome da seleção**. Demais campos: `golsEquipeA`, `golsEquipeB`, `golsPenaltyTimeA`, `golsPenaltyTimeB` (0 se não houve pênaltis). |

### 5.1. Algoritmos Core

#### Geração de Rodadas — Round-Robin Circular

Com 4 times por grupo `[A, B, C, D]`, o time `A` é fixado e os demais rotacionam no sentido horário a cada rodada. Isso garante que todos se enfrentem exatamente uma vez em 3 rodadas:

```
Rodada 1: A vs D  |  B vs C
Rodada 2: A vs C  |  D vs B
Rodada 3: A vs B  |  C vs D
```

```typescript
generateRounds(teams: Team[]): Round[] {
  const [fixed, ...rotating] = teams;
  const rounds: Round[] = [];

  for (let i = 0; i < 3; i++) {
    const r = [...rotating];
    rounds.push({
      matches: [
        { teamA: fixed, teamB: r[2] },
        { teamA: r[0],  teamB: r[1] },
      ]
    });
    rotating.unshift(rotating.pop()!); // rotação clockwise
  }
  return rounds;
}
```

#### Simulação de Placares

Distribuição ponderada para produzir placares realistas sem complexidade desnecessária:

```typescript
simulateGoals(): number {
  const r = Math.random();
  if (r < 0.30) return 0;
  if (r < 0.60) return 1;
  if (r < 0.80) return 2;
  if (r < 0.92) return 3;
  return 4;
}
```

#### Disputa de Pênaltis

Série de 5 cobranças por time + morte súbita até desempate:

```typescript
simulatePenalties(): { penaltyA: number; penaltyB: number } {
  let penaltyA = 0, penaltyB = 0;

  for (let i = 0; i < 5; i++) {
    if (Math.random() > 0.25) penaltyA++;
    if (Math.random() > 0.25) penaltyB++;
  }

  // Morte súbita se empatado após 5 cobranças
  while (penaltyA === penaltyB) {
    if (Math.random() > 0.25) penaltyA++;
    if (Math.random() > 0.25) penaltyB++;
  }

  return { penaltyA, penaltyB };
}
```

#### Bracket do Mata-Mata — Árvore Binária

O bracket é modelado como uma **árvore binária completa**. Cada nó é uma `KnockoutMatch`; seus filhos `childA` e `childB` são as partidas que produziram os dois adversários. A simulação usa **travessia em pós-ordem** — resolve os filhos antes do pai, propagando o vencedor para cima:

```
                      [ FINAL ]
                     /          \
              [SF-1]              [SF-2]
             /      \            /      \
         [QF-1]  [QF-2]      [QF-3]  [QF-4]
         /  \    /   \        /  \    /   \
      R16-1 R16-2 R16-3 R16-4 R16-5 R16-6 R16-7 R16-8
```

```typescript
simulateKnockoutMatch(node: KnockoutMatch): Team {
  // Caso base: oitavas já têm times definidos
  if (!node.childA && !node.childB) {
    return this.resolveMatch(node);
  }

  // Pós-ordem: resolve filhos antes do pai
  node.teamA = this.simulateKnockoutMatch(node.childA!);
  node.teamB = this.simulateKnockoutMatch(node.childB!);
  return this.resolveMatch(node);
}

private resolveMatch(node: KnockoutMatch): Team {
  const goalsA = this.simulateGoals();
  const goalsB = this.simulateGoals();

  if (goalsA !== goalsB) {
    node.winner = goalsA > goalsB ? node.teamA! : node.teamB!;
  } else {
    const { penaltyA, penaltyB } = this.simulatePenalties();
    node.result = { teamA: node.teamA!, teamB: node.teamB!, goalsA, goalsB, penaltyA, penaltyB };
    node.winner = penaltyA > penaltyB ? node.teamA! : node.teamB!;
  }

  return node.winner!;
}
```

#### Chaveamento das Oitavas de Final

Montagem do bracket seguindo o diagrama oficial (Figura 1):

| Partida | Confronto        | Partida | Confronto        |
|---------|------------------|---------|------------------|
| R16-1   | 1º A vs 2º B     | R16-5   | 1º E vs 2º F     |
| R16-2   | 1º C vs 2º D     | R16-6   | 1º G vs 2º H     |
| R16-3   | Vencedor R16-1 vs Vencedor R16-2 (QF-1) | R16-7 | Vencedor R16-5 vs Vencedor R16-6 (QF-3) |
| R16-4   | 1º B vs 2º A     | R16-8   | 1º D vs 2º C     |

> As quartas, semifinal e final são montadas automaticamente pela propagação da árvore.

---



| Operação | Method | URL |
|----------|--------|-----|
| Buscar seleções | `GET` | `https://development-internship-api.geopostenergy.com/WorldCup/GetAllTeams` |
| Enviar resultado | `POST` | `https://development-internship-api.geopostenergy.com/WorldCup/FinalResult` |

**Header obrigatório em todas as requisições:** `git-user: <joaovfcc>`

### Payload do POST (RF06)

```json
{
  "equipeA": "b18e8f55-3477-4d76-bb1a-811132eb25fc",
  "equipeB": "6ca272b3-48a7-4e11-a2f4-79be4c038c24",
  "golsEquipeA": 1,
  "golsEquipeB": 1,
  "golsPenaltyTimeA": 4,
  "golsPenaltyTimeB": 3
}
```

---

## 6. UX, UI & Design

- **Fase de Grupos:** Tabela de classificação por grupo, atualizada a cada rodada simulada, exibindo pontos, saldo de gols e situação (classificado / eliminado).
- **Mata-Mata:** Bracket visual conectando os confrontos desde as oitavas até a final, com o campeão destacado ao fim.
- **Feedback de ações:** Estado de loading durante chamadas à API; mensagem de sucesso ou erro após o POST do resultado final.
- **Responsividade:** Layout funcional em viewport mínima de 375px (mobile) e 1280px (desktop), com hierarquia visual clara em ambas.

---

## 7. Estratégia de Testes (TDD & Spec-Driven Development)

A integridade do motor de simulação e a persistência de dados são garantidas por cobertura de testes unitários com **Jest**, seguindo o ciclo clássico do TDD — **Red → Green → Refactor** — aliado ao **Spec-Driven Development**: o contrato de comportamento (spec) é escrito antes de qualquer implementação.

### 7.1. Escopo de Cobertura

| Camada | Estratégia |
|--------|------------|
| Serviços de domínio (`core/services`) | ✅ Cobertura total — sorteio, simulação, pontuação, desempate, pênaltis |
| `TournamentStateService` | ✅ Cobertura total — hidratação, persistência e reset |
| `LocalStorage` / `ApiService` | ✅ 100% mockado — isolado de rede e browser API |
| Componentes visuais (`shared/components`) | ⚠️ Excluídos do escopo unitário para não comprometer o cronograma |

### 7.2. Specs do `TournamentStateService`

```typescript
// tournament-state.service.spec.ts
describe('TournamentStateService', () => {

  // Inicialização
  it('deve inicializar com estado vazio se o LocalStorage estiver limpo');
  it('deve inicializar com estado vazio se a chave do LocalStorage não existir');

  // Hidratação
  it('deve hidratar o estado em memória corretamente a partir de um save válido');
  it('deve retornar estado vazio sem lançar erro se o JSON estiver corrompido');

  // Persistência
  it('deve chamar localStorage.setItem com a chave correta ao registrar as 32 seleções');
  it('deve serializar as seleções como JSON válido ao persistir');
  it('deve rejeitar a ingestão se o array não contiver exatamente 32 equipes');

  // Integridade do UUID
  it('deve preservar o UUID de cada equipe após um ciclo completo de save/load');
  it('deve rejeitar a hidratação se qualquer equipe no save estiver sem UUID');

  // Reset
  it('deve zerar o signal de estado em memória ao chamar resetState()');
  it('deve remover a chave correta do LocalStorage ao chamar resetState()');
  it('deve retornar ao estado idêntico ao de uma inicialização limpa após resetState()');

  // Imutabilidade
  it('não deve permitir que alterações externas no objeto retornado corrompam o estado interno');
});
```

### 7.3. Specs dos Serviços de Domínio

```typescript
// group-draw.service.spec.ts
describe('GroupDrawService', () => {
  it('deve gerar exatamente 8 grupos');
  it('deve alocar exatamente 4 equipes por grupo');
  it('não deve repetir nenhuma equipe em grupos diferentes');
  it('deve distribuir todas as 32 equipes recebidas');
  it('deve produzir distribuições diferentes em chamadas sucessivas (aleatoriedade)');
});

// simulation.service.spec.ts
describe('SimulationService', () => {

  // Round-robin
  it('deve gerar exatamente 3 rodadas por grupo');
  it('deve gerar exatamente 2 jogos por rodada');
  it('deve garantir que todas as 4 equipes do grupo se enfrentaram ao fim das 3 rodadas');
  it('não deve repetir nenhum confronto dentro do grupo');

  // Placar
  it('deve retornar um placar com gols entre 0 e 4 para cada time');
  it('deve atribuir 3 pontos ao vencedor');
  it('deve atribuir 1 ponto a cada equipe em caso de empate na fase de grupos');

  // Desempate
  it('deve desempatar por pontos como primeiro critério');
  it('deve desempatar por saldo de gols como segundo critério');
  it('deve usar sorteio aleatório como critério final de desempate');

  // Pênaltis
  it('deve simular série de 5 cobranças por time nos pênaltis');
  it('deve continuar em morte súbita enquanto o placar de pênaltis estiver empatado');
  it('deve sempre retornar um vencedor após a disputa de pênaltis');

  // Mata-mata
  it('deve nunca produzir empate como resultado final de uma partida eliminatória');
  it('deve propagar o vencedor de cada nó filho para o nó pai da árvore');
  it('deve preencher teamA e teamB do nó pai com os vencedores dos filhos antes de simular');
  it('deve preservar o resultado completo (gols + pênaltis) em cada nó da árvore');
});

// api.service.spec.ts
describe('ApiService', () => {
  it('deve incluir o header git-user em toda requisição GET');
  it('deve incluir o header git-user na requisição POST da final');
  it('deve formatar o payload do POST com os UUIDs nos campos equipeA e equipeB — nunca os nomes');
  it('deve enviar golsPenaltyTimeA e golsPenaltyTimeB como 0 se não houve disputa de pênaltis');
});
```

---

## 🗓️ Sprint de 1 Semana: Planejamento e Execução

### Dias 1 e 2 — Fundação e Estrutura Core

- [ ] Inicializar o repositório e o projeto Angular com Standalone Components.
- [ ] Configurar o ambiente de testes unitários com Jest.
- [ ] Estruturar as pastas: `app/core`, `app/shared`, `app/features`.
- [ ] **[TDD]** Definir interfaces e modelos em `core/models` (`Team`, `Match`, `Group`, `Standing`, `TournamentState`).
- [ ] Desenvolver o `ApiService` em `core/services` para o `GET` inicial com o header `git-user`.
- [ ] Criar o `TournamentStateService` no core para gerenciar o estado em memória e no `LocalStorage`.

### Dias 3 e 4 — Lógica de Negócio (Ciclo TDD)

- [ ] **[TDD]** Desenvolver o `GroupDrawService` — algoritmo de rotação circular para geração das rodadas e distribuição dos 8 grupos.
- [ ] **[TDD]** Implementar o `SimulationService` — simulação de placares ponderada e cálculo de pontuação da fase de grupos.
- [ ] **[TDD]** Codificar as regras de desempate em cascata (Pontos → Saldo de Gols → Sorteio).
- [ ] **[TDD]** Implementar a disputa de pênaltis (série de 5 + morte súbita).
- [ ] **[TDD]** Construir a árvore binária do mata-mata e o algoritmo de travessia em pós-ordem para propagação dos vencedores.

### Dias 5 e 6 — UI/UX e Componentes Shared

- [ ] Criar componentes de UI reutilizáveis em `shared/components` (cards de times, badges de placar, tabela de classificação).
- [ ] Desenvolver a interface visual da Fase de Grupos consumindo os serviços testados.
- [ ] Construir a visualização do bracket do Mata-Mata.
- [ ] Refinar o design e garantir responsividade em mobile (375px) e desktop (1280px).

### Dia 7 — Integração Final e Entrega

- [ ] Implementar o `POST` final validando que `equipeA` e `equipeB` usem os **UUIDs** preservados desde a ingestão.
- [ ] Executar a bateria completa de testes unitários com Jest.
- [ ] Realizar testes manuais de fluxo completo (End-to-End).
- [ ] Finalizar o `README.md` com instruções de execução e explicação da arquitetura adotada.
