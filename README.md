# World Cup Simulator 2022

Um simulador completo da Copa do Mundo 2022, desenvolvido com **Angular 19** e focado em fidelidade visual (Mockup Canvas) e integridade de lógica de negócio (TDD).

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

O projeto segue os princípios de **Clean Architecture** aplicada ao Angular:

- **Core:** Centraliza serviços singleton (`ApiService`, `SimulationService`, `TournamentStateService`) e modelos de dados.
- **Features:** Encapsula o `DashboardComponent` e seus sub-componentes específicos (`GroupTable`, `MatchCard`).
- **Shared:** Componentes de UI genéricos e utilitários reutilizáveis.
- **Spec-Driven:** O motor lógico foi construído com base nas especificações do PRD, garantindo que os UUIDs das seleções sejam preservados do início ao fim para a submissão final.

---
Desenvolvido como parte do Processo Seletivo Katalyst 2026.
