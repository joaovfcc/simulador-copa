# PRD: Simulador da Copa do Mundo

## 1. Visão Geral do Produto

Uma aplicação web **Single Page Application (SPA)** 100% executada no lado do cliente (Client-Side). O sistema consome dados reais de uma API externa, gere o estado da simulação do torneio na memória do navegador e processa regras de negócio complexas de forma autónoma.

Ao final, envia os resultados do campeão de volta para a infraestrutura da empresa. Todo o motor lógico é garantido por uma suíte de testes unitários desenvolvida sob a ótica do **TDD (Test-Driven Development)**.

---

## 2. Stack Tecnológica e Arquitetura

- **Core:** Angular (Standalone Components), TypeScript, HTML5, CSS Tailwind.
- **Qualidade e Testes:** Jest. O foco absoluto de cobertura de testes será na lógica de negócio e serviços.
- **Arquitetura:** Padrão Angular (Core/Shared/Features)
  - `app/core`: Centraliza serviços singleton, modelos de dados globais e a configuração da API. É o "cérebro" da aplicação.
  - `app/shared`: Componentes de UI, pipes e diretivas reutilizáveis que não possuem conhecimento das regras de negócio.
  - `app/features`: Módulos/Componentes que encapsulam as funcionalidades específicas (Fase de Grupos, Mata-Mata).
- **Metodologia:** TDD aliado ao **Spec-Driven Development**. Os testes ditarão o design e as especificações das funções antes da implementação real.

---

## 3. Gerenciamento de Estado e Dados

- **Estado Efêmero:** In-memory state management através de Angular Services (utilizando Signals ou BehaviorSubjects).
- **Persistência de UX:** Salvamento automático no `LocalStorage` para evitar perda de progresso em caso de recarregamento da aba (F5).

---

## 4. Requisitos Funcionais

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RF01 | Ingestão de Dados | Consumir a API via `GET` para obter as 32 seleções (header `git-user` obrigatório). O modelo `Team` deve preservar o **UUID** retornado pela API como identificador principal de cada equipe. |
| RF02 | Sorteio e Agrupamento | Distribuir aleatoriamente as seleções em 8 grupos (A-H). Exibir a formação completa antes do início. |
| RF03 | Motor de Simulação | Gerar placares e simular as 3 jornadas da Fase de Grupos (todos contra todos no grupo). |
| RF04 | Classificação | Calcular pontos (Vitória: 3, Empate: 1) e aplicar desempate: Pontos > Saldo de Golos > Sorteio. |
| RF05 | Árvore de Mata-Mata | Processar o chaveamento das oitavas até a final, resolvendo empates via grandes penalidades. |
| RF06 | Finalização | Enviar o resultado da final via `POST` (header `git-user`). O payload deve utilizar o **UUID** de cada equipe (conforme retornado pela API) nos campos `equipeA` e `equipeB` — **nunca o nome da seleção**. Demais campos: `golsEquipeA`, `golsEquipeB`, `golsPenaltyTimeA`, `golsPenaltyTimeB`. |

---

## 5. UX, UI & Design

- **Dashboard:** Limpo e legível para a Fase de Grupos.
- **Árvore de Chaveamento:** Visualização interativa e criativa para o Mata-Mata.
- **Responsividade:** Garantia de funcionamento em dispositivos móveis e desktop com hierarquia visual clara.

---

## 🗓️ Sprint de 1 Semana: Planejamento e Execução

### Dias 1 e 2 — Fundação e Estrutura Core

- [ ] Inicializar o repositório e o projeto Angular com Standalone Components.
- [ ] Configurar o ambiente de testes unitários com Jest.
- [ ] Estruturar as pastas oficiais: `app/core`, `app/shared`, `app/features`.
- [ ] **[TDD]** Definir interfaces e modelos em `core/models` (`Team`, `Match`, `Group`) — garantindo que o modelo `Team` inclua o campo `id` (UUID) retornado pela API.
- [ ] Desenvolver o `ApiService` em `core/services` para o `GET` inicial com o header `git-user`.
- [ ] Criar o `TournamentStateService` no core para gerenciar os dados em memória e `LocalStorage`.

### Dias 3 e 4 — Lógica de Negócio e Features (Ciclo TDD)

- [ ] **[TDD]** Desenvolver a lógica de sorteio de grupos e sua visualização inicial.
- [ ] **[TDD]** Implementar o motor de simulação de resultados e cálculo de pontuação.
- [ ] **[TDD]** Codificar as regras de desempate em cascata (Pontos, Saldo, Sorteio).
- [ ] **[TDD]** Estruturar a lógica de progressão do mata-mata e disputa de pênaltis.

### Dias 5 e 6 — UI/UX e Componentes Shared

- [ ] Criar componentes de UI reutilizáveis em `shared/components` (Cards de times, badges de placar).
- [ ] Desenvolver a interface visual da Fase de Grupos consumindo os serviços testados.
- [ ] Construir a visualização da árvore do Mata-Mata (Design criativo).
- [ ] Refinar o design e garantir que a aplicação seja totalmente responsiva.

### Dia 7 — Integração Final e Entrega

- [ ] Implementar o método de `POST` para envio do campeão final, validando que os campos `equipeA` e `equipeB` do payload utilizem os **UUIDs** preservados desde a ingestão inicial dos dados.
- [ ] Executar bateria completa de testes unitários (Jest).
- [ ] Realizar testes manuais de fluxo completo (End-to-End).
- [ ] Finalizar o `README.md` com as instruções de execução e a explicação da arquitetura adotada.