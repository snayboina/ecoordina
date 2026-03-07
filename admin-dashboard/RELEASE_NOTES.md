# Release Notes - v1.8 (Fix Autenticação Login)

## 📋 Resumo
Correção crítica no fluxo de autenticação do Admin Dashboard. Senhas cadastradas no banco com caractere invisível `\n` no final impediam o login mesmo com credenciais corretas.

## 🐛 Bug Corrigido
- **Login falhando com credenciais válidas:** A query `.eq('senha', password)` comparava a senha digitada com a senha do banco literal (ex: `"242526\n"`), causando sempre retorno de `null`.

## 🔧 Solução Aplicada
- A função `checkUserAccess` em `api.ts` foi refatorada para buscar o usuário apenas pelo **email** e comparar a senha em JavaScript usando `.trim()` em ambos os lados, eliminando qualquer espaço ou quebra de linha extra.

## 📊 Fluxo de Autenticação Atualizado
```mermaid
graph TD
    A[Login Form] --> B[checkUserAccess]
    B --> C{Busca por email no Supabase}
    C -->|Não encontrado| D[Retorna null - Erro]
    C -->|Encontrado| E{Compara senha com .trim()}
    E -->|Inválida| D
    E -->|Válida| F[Retorna userData - Acesso Liberado]
```

---
**Versão Física:** `/versao/v1.8-fix-autenticacao-trim`
**Tag Git:** `v1.8`

# Release Notes - v1.7 (Overview Redesign Refinement)

## 📋 Resumo
Transformação da tela de "Visão Geral" em uma apresentação executiva minimalista e de alto impacto, com foco absoluto em KPIs e gráficos.

## 🚀 Novidades
- **KPIs Prioritários:** Métricas de Total, Liberados e Pendentes movidas para o topo com números em tamanho 5xl para máxima visibilidade.
- **Gráficos com Labels:** Adição de rótulos de dados diretos (labels) nos gráficos de Pizza e Barras.
- **Minimalismo Extremo:** Remoção do botão de exportação e de todas as seções informativas abaixo dos gráficos para uma visão limpa e focada.

## 📊 Arquitetura
```mermaid
graph TD
    A[Admin Dashboard] --> B[KPI Grid: Topo]
    A --> C[Charts Section: Centro]
    B --> B1[Total / Liberados / Pendentes]
    C --> C1[Pie: Distribuição]
    C --> C2[Bar: Eficiência]
```

---
**Versão Física:** `/versao/v1.7-redesign-visao-geral`
**Tag Git:** `v1.7`

# Release Notes - v1.6 (Pagcorp Edition)

## 🚀 O que há de novo?
Redesign radical do Admin Dashboard para uma estética minimalista de alto nível.

### 🎨 Design & UI
- **Ultra Clean Layout**: Paleta baseada em Branco Puro (#FFFFFF) e Slate-900.
- **Squircle System**: Border-radius unificado em 32px/48px para suavidade absoluta.
- **Floating Architecture**: Header e Sidebar com sombras extremamente sutis.
- **Métricas Italic**: Nova tipografia Black Italic para números de estatísticas.
- **Status Sync**: Indicadores visuais circulares e minimalistas para auditoria.

### 🛠️ Melhorias Técnicas
- **Code Cleanup**: Remoção de variáveis e funções não utilizadas.
- **JSX Optimization**: Correção de erros de sintaxe e renderização condicional.
- **Data Logic**: Padronização de nomes de campos (ex: `seguranca` garantido).

## 📊 Arquitetura Visual
```mermaid
graph TD
    A[Admin Dashboard] --> B[Sidebar Líquida]
    A --> C[Header Flutuante]
    A --> D[Bento Stats Grid]
    D --> D1[Métricas Clean]
    A --> E[Auditoria View]
    E --> E1[Tabela Minimalista]
    A --> F[Floating Pill Modal]
```

---
**Versão Física:** `/versao/v1.6-redesign-ultra-clean`
**Tag Git:** `v1.6`
