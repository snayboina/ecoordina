# 🧠 Brainstorm: Arquitetura Feature-Based para Mobile-App

### Contexto
O projeto atual possui um monolito no arquivo `App.tsx` (65KB), contendo lógica de autenticação, dashboard, visualização de liberação e componentes de UI genéricos. Para escalar, precisamos decompor esse arquivo em uma estrutura modular baseada em funcionalidades (features).

---

### Opção A: Estrutura de Domínio (Pure Features)
Organizar o código estritamente por domínios de negócio. Cada pasta em `src/features/` é um mini-aplicativo completo.

📂 **Estrutura:**
- `src/features/auth/`
- `src/features/liberation/`
- `src/features/dashboard/`
- `src/shared/` (componentes universais, hooks globais)

✅ **Prós:**
- Altíssimo isolamento de código.
- Facilita o trabalho em equipe (conflitos reduzidos).
- Fácil de deletar ou substituir uma funcionalidade inteira.

❌ **Cons:**
- Pode haver duplicação de componentes se não houver um `shared` bem definido.
- Curva de aprendizado inicial para quem está acostumado com monolitos.

📊 **Esforço:** Médio

---

### Opção B: Feature-First com Camada de UI Compartilhada
Focar nas features para lógica e fluxo, mas manter uma biblioteca de componentes de UI (Design System) centralizada.

📂 **Estrutura:**
- `src/features/` (lógica de negócio, hooks específicos)
- `src/components/` (componentes de UI puros: Buttons, Cards, Modals)
- `src/pages/` (composição da feature nas páginas)

✅ **Prós:**
- Consistência visual garantida pelo repositório central de componentes.
- Reaproveitamento máximo de UI.

❌ **Cons:**
- A camada `src/components/` pode se tornar um monolito de componentes genéricos difícil de gerenciar.

📊 **Effort:** Baixo | Medium

---

### Opção C: Arquitetura em Camadas por Feature (Recomendada)
Cada feature tem suas próprias sub-camadas internas (components, hooks, services, types).

📂 **Estrutura:**
- `src/features/auth/components/`
- `src/features/auth/hooks/`
- `src/features/auth/services/`
- `src/features/auth/index.ts` (API pública da feature)

✅ **Prós:**
- Melhor organização para projetos que crescem muito.
- Segue exatamente o padrão sugerido na imagem de referência.
- Encapsulamento total (features só exportam o que é necessário através do `index.ts`).

❌ **Cons:**
- Estrutura de pastas mais profunda, exigindo mais navegação.

📊 **Effort:** Médio | Alto

---

## 💡 Recomendação

**Opção C** porque segue fielmente o padrão moderno de escalabilidade mostrado na imagem de referência ("RECOMENDADO"). Ela garante que ao mexer na feature de `liberation`, não afetamos acidentalmente o `auth`. O `App.tsx` passará a ser apenas um roteador/provedor de contexto, delegando toda a complexidade para as features.

O que você acha dessa direção para o detalhamento da arquitetura?
