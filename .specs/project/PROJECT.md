# Simulador da Copa do Mundo

**Vision:** Uma SPA 100% Client-Side que consome dados reais de uma API externa, gere o estado da simulação do torneio na memória, processa todas regras de negócio de forma autônoma com TDD, e envia o resultado da Copa do Mundo para a infraestrutura backend (via POST).
**For:** B2B/Avaliação Técnica (Takehome)
**Solves:** Valida as habilidades em Angular moderno, state management complexo em client-side, modularidade de arquitetura e cobertura de testes.

## Goals

- **Test coverage:** 100% de testes unitários na lógicas de negócio e services (Spec-Driven/TDD).
- **Simulação autônoma:** Motor de chaves/grupo e desempate puramente client-side usando observables/signals.
- **Data integrity:** Manter e trafegar obrigatoriamente os UUIDs das Equipes desde a ingestão da API até a exportação final do vencedor.

## Tech Stack

**Core:**

- Framework: Angular 19+ (Standalone Components)
- Language: TypeScript
- Database: LocalStorage (Persistência efêmera para F5)
- Styling: Tailwind CSS

**Key dependencies:** 
- Jest (Testing framework)
- RxJS / Signals (State Management)
- HttpClient (Comunicação de rede com Header fixo e CORS)

## Scope

**v1 includes:**

- GET de Ingestão de API para popular 32 seleções (`Team`).
- Motor de Randomização para sortear 8 grupos e exibir grid visual.
- Motor de Simulação de Confrontos e Desempates em cascata (Pontos, Saldo, Aleatório).
- Árvore de Mata-mata interativa de oitavas até final.
- TDD para modelos essenciais (`Team`, `Match`, `Group`).
- POST Final do Campeão para a API com UUIDs.

**Explicitly out of scope:**

- Backend ou API personalizada (toda mecânica ocorre no front-end).
- Autenticação e Autorização (apenas cabeçalhos pre-determinados).

## Constraints

- Technical: Uso rígido dos IDs via UUID para a integração externa (o name não serve como key de submissão).
- Technical: A arquitetura precisa ser componentizada em `app/core`, `app/shared`, `app/features`.
