# 🏗️ Arquitetura Feature-Based: Mobile-App

Este documento detalha o plano de reestruturação do sistema para o padrão **Feature-Based** (Baseado em Funcionalidades), otimizando a manutenção e a escalabilidade do `mobile-app`.

## 📂 Visão Geral da Estrutura

```text
src/
├── assets/             # Recursos estáticos (imagens, ícones, fontes)
├── core/               # Infraestrutura base e configurações globais
├── arquitetura/        # Configurações de Marca e Design System (NOVO)
│   ├── brand.config.ts # Edite aqui Nome, Cores e Logos
│   ├── index.css       # Estilos Globais e Tokens
│   └── email.service.ts # Serviço de Email com branding dinâmico
├── features/           # Módulos de negócio independentes
│   ├── auth/           # Fluxo de login e sessão
│   │   ├── components/ # LoginView, LoginForm
│   │   ├── hooks/      # useAuth, useSession
│   │   └── services/   # auth.service.ts
│   ├── dashboard/      # Resumo e estatísticas
│   │   ├── components/ # StatsGrid, SummaryCard
│   │   └── services/   # stats.service.ts
│   ├── liberation/     # Gestão de Liberação (Ecoordina)
│   │   ├── components/ # LiberationView, SearchBar, TimelineCard, RoleGroup
│   │   ├── hooks/      # useLiberationData, useRealtimeUpdates
│   │   └── types/      # liberation.types.ts
│   └── onboarding/     # Boas-vindas e introdução
│       └── components/ # WelcomeView
├── hooks/              # Hooks de utilidade global (ex: useLocalStorage)
├── utils/              # Funções auxiliares puras (ex: date-formatter, normalizer)
├── App.tsx             # Root Component (Orchestrator/Router)
└── main.tsx            # Entry point
```

## 🛠️ Detalhamento das Camadas

### 1. `features/`
Cada funcionalidade deve ser independente. Elas só se comunicam através da API pública da feature (geralmente um arquivo `index.ts` na raiz da pasta da feature).
- **Independência:** Se removermos a pasta `features/auth`, o restante do sistema (que não depende de login) deve teoricamente compilar.
- **Lógica de Negócio:** Todo o processamento de dados específico de uma funcionalidade vive aqui.

### 2. `components/ (Shared)`
Contém componentes que não possuem lógica de negócio ("Presentational Components").
- **Exemplo:** Um `DashboardCard` que recebe `title` e `value` via props pode ser compartilhado entre diferentes funcionalidades sem conhecer a origem dos dados.

### 3. `core/`
O coração tecnológico do app.
- **API:** Centraliza todas as chamadas ao Supabase.
- **Theme:** Onde vive a alma visual do projeto (Francis Developer Style).

## 🚀 Benefícios da Transição
1. **Redução do App.tsx:** O arquivo passará de 1356 linhas para menos de 100 linhas, focando apenas no roteamento e provedores.
2. **Facilidade de Testes:** É mais simples testar uma feature isoladamente do que um monolito.
3. **Escalabilidade:** Novas funcionalidades (ex: `relatorios`) podem ser adicionadas criando apenas uma nova pasta em `features/`.

---
*Gerado via Google Antigravity em 31/01/2026.*
