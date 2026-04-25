# World Cup Simulator 2026

Um simulador completo da Copa do Mundo 2026, desenvolvido com **Angular 19** e focado em fidelidade visual (Mockup Canvas) e integridade de lógica de negócio (TDD).

## 🚀 Funcionalidades

- **Ingestão de Dados:** Busca as 32 seleções reais via API Katalyst.
- **Sorteio Randômico:** Geração de 8 grupos (A-H) com distribuição aleatória.
- **Simulação Incremental:** 
  - Simulação rodada a rodada da Fase de Grupos.
  - Chaveamento dinâmico do Mata-Mata (Oitavas até a Final).
- **Lógica de Classificação:** Aplica critérios de desempate oficiais (Pontos, Saldo de Gols e Sorteio).
- **Finalização:** Envio automático do resultado da Final para a API para registro do campeão.
- **Persistência Local:** Estado da simulação preservado via LocalStorage.

## 🛠️ Stack Tecnológica

- **Framework:** Angular 19 (Standalone Components & Signals)
- **Estilização:** Tailwind CSS v4
- **Testes:** Jest
- **API:** Katalyst Data Management

## 📦 Como Executar

### Pré-requisitos
- Node.js (v18+)
- npm

### Instalação
```bash
npm install
```

### Rodar a Aplicação
```bash
npm start
```
Acesse `http://localhost:4200` no seu navegador.

### Rodar Testes Unitários
O motor de simulação e os serviços de estado são cobertos por testes unitários seguindo o PRD.
```bash
npm test
```

## 🏗️ Arquitetura

O projeto adota o padrão de organização **Core / Shared / Features**, uma das convenções mais robustas recomendadas pela comunidade Angular para escalabilidade e separação de responsabilidades:

- **Core:** Centraliza o "coração" da aplicação, incluindo serviços singleton globais (`ApiService`, `SimulationService`, `TournamentStateService`), interceptores HTTP e modelos de dados compartilhados.
- **Features:** Contém os componentes de página e módulos de funcionalidade específica. A lógica de orquestração do torneio reside no `DashboardComponent`.
- **Shared:** Focado em reutilização, hospeda componentes de UI puramente visuais (`Button`, `GroupTable`, `MatchCard`) e utilitários que podem ser usados em qualquer lugar da aplicação.
- **Spec-Driven:** A lógica de negócio foi validada via **TDD (Test-Driven Development)**, garantindo que os UUIDs das seleções sejam preservados e que os critérios de desempate sigam rigorosamente as regras do PDF de instruções.

---
Desenvolvido como parte do Processo Seletivo Katalyst 2026.
