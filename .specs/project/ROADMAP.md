# Roadmap

**Current Milestone:** Milestone 1 - Infraestrutura Core
**Status:** In Progress

---

## Milestone 1 - Infraestrutura Core e Modelagem (Dias 1-2)

**Goal:** Ter a aplicação angular base com todas as pastas distribuídas, requisição HTTP configurada, setup do TercaStateService e as models TDD completas.
**Target:** Final do Dia 2

### Features

**Estruturação de Pastas e Jest** - COMPLETE
- Criar e organizar pastas (core, shared, features)
- Configurar ambiente Jest no Angular Standalone

**Domain Models (TDD)** - COMPLETE
- Interface e testes de `Team` (c/ UUID validation)
- Interface e testes de `Match`
- Interface e testes de `Group`

**API e Ingestão de Dados** - PLANNED
- Implementar `ApiService` para injetar requisição GET

**TournamentStateService** - PLANNED
- Criar serviço de estado usando Signals ou Subjects
- Sincronização e bootstrap de LocalStorage

---

## Milestone 2 - Lógica de Simulação de Torneio (Dias 3-4)

**Goal:** O núcleo da simulação funcionando perfeitamente de forma programática.

### Features

**Sorteio de Grupos** - PLANNED
- Distribuição randômica de seleções nos potes/grupos.

**Simulação de Fase de Grupos** - PLANNED
- Motor point-based, confrontos de ida/desempates, update na store de grupo.

**Progressão do Mata-Mata e Pênaltis** - PLANNED
- Lógica generativa dos brackets do mata-mata baseado nas pontuações.

---

## Milestone 3 - Interface Gráfica, Componentização e Integração (Dias 5-7)

**Goal:** Integrar o motor ao layout com cards, arvores de chaveamento estéticas, responsividade, além de finalização do fluxo via API POST final.

### Features

**Componentes Reutilizáveis (Shared)** - PLANNED
**Views da Fase de Grupos** - PLANNED
**Views da Árvore de Mata-Mata** - PLANNED
**POST Final e Integrações (Envio Campeão)** - PLANNED
**Auditoria de Testes End-to-End e Responsividade** - PLANNED
