# RELEASE NOTES - v1.14 📉
## Ecoordina Smart - Sorting Intelligence Fix

Esta versão corrige a lógica de ordenação da tabela de colaboradores, garantindo que os dados sejam apresentados na ordem cronológica correta (admissão mais recente primeiro).

### 🐛 Correção Crítica

1.  **Ordenação por Data de Admissão**:
    *   **Problema**: A ordenação anterior falhava ao processar datas em formato técnico misto ou com inputs manuais, jogando alguns registros recentes para o final da lista.
    *   **Solução**: Implementação de um parser universal (`dayjs` com `customParseFormat`) dentro da função de `sort`.
    *   **Resultado**: A lista agora respeita rigorosamente a ordem: **Mais Recente --> Mais Antigo**, independentemente do formato da data (DD/MM/YYYY ou YYYY-MM-DD).

### ⚙️ Detalhes Técnicos

*   **Arquivo**: `App.tsx`
*   **Função**: `getTime` dentro do `filteredCollabs.sort()`.
*   **Melhoria**: Uso de `dayjs(d, formats).valueOf()` para converter strings de data em timestamps numéricos precisos.

---
**Equipe Antigravity** | *Precisão em cada detalhe.*
