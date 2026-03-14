# 📔 Release Notes - v1.2

**Data:** 01/02/2026
**Foco:** Otimização de Performance e Refinamento de Interface

---

## 🚀 Principais Funcionalidades

### 1. Novo Fluxo de Sincronização (UPSERT Otimizado)
Redesenhamos o fluxo do n8n para ser cirúrgico e veloz.
- **Bulk Fetch**: Agora o sistema busca todos os registros do Supabase uma única vez (1 chamada vs 150+ chamadas anteriores).
- **Processamento em Memória**: A comparação entre a planilha e o banco de dados ocorre instantaneamente dentro de um nó de código.
- **Tráfego Reduzido**: Apenas as colunas necessárias para a visualização no App são baixadas e comparadas.

### 2. Filtro de Admissão (Foco 2026)
Implementamos um filtro automático no n8n que ignora registros de admissão fora do per�odo de **01/01/2026 a Ontem**. Isso mantém o banco de dados limpo e focado no ciclo atual.

### 3. Mapeamento Inteligente de Colunas
O sistema agora é resiliente a variações nos títulos das colunas da planilha:
- **Chapa**: Identifica `CHAPA`, `MATRICULA`, `MAT`, etc.
- **Nome**: Identifica `NOME`, `NOME COMPLETO`, `COLABORADOR`.
- **Data Admissão**: Identifica `DAT. ADMISSÃO`, `ADMISSION DATE`, `ADMISSAO`.

### 4. Refinamento de UI (Labels)
- **GRD**: O card anteriormente rotulado como "Gerência" foi renomeado para **GRD**, alinhando a interface do App com a terminologia oficial.

---

## 🛠️ Manutenibilidade e Depuração
Adicionamos logs detalhados no nó `Transformar_Dados` do n8n. Ao rodar o fluxo, agora é possível ver no console exatamente:
- Quantas linhas foram lidas.
- Quais linhas foram filtradas por data.
- Quantos registros serão inseridos ou atualizados.

---

## 📂 Arquivos Alterados nesta Versão
- `fluxo json/Google Sheets → Supabase UPSERT Otimizado.json`
- `mobile-app/src/App.tsx`
