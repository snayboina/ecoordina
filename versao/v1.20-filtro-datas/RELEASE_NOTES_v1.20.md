# Release Notes - v1.20 (Filtro de Datas n8n)

## 📅 Melhorias de Filtro Temporal (n8n)
- **Filtro Automático de Admissão e Liberação:** Todos os fluxos JSON do n8n que processam e sincronizam dados da planilha para o Supabase foram atualizados.
- **Período Focado:** Apenas colaboradores com *Data de Admissão* e *Data de Liberação E-COORDINA* situadas entre `01/01/2026` e `Ontem (today - 1)` são processados.
- **Otimização de Banco:** Isso evita a importação de dados antigos ou futuros indesejados, mantendo as tabelas do Supabase limpas e as querys mais rápidas para a tabela `liberation_data`.

## 🗺️ Mapa de Dados e Estrutura (Mermaid)

```mermaid
flowchart TD
    A[Google Sheets \n Controle Complexo Azulão] -->|Aciona n8n| B([Fluxo n8n de Sincronização])
    B --> C{Filtro de Datas}
    C -->|Admissão / Liberação \n < 01/01/2026 \n ou > Ontem| D[Descartado]
    C -->|Dentro do Período \n Válido| E[Mapeamento Robusto - fuzzy]
    E --> F[(Supabase - liberation_data)]
    F --> G[Dashboard Web]
    F --> H[Mobile App]

    style A fill:#0d9488,stroke:#0f766e,color:#fff
    style B fill:#eab308,stroke:#ca8a04,color:#fff
    style C fill:#3b82f6,stroke:#2563eb,color:#fff
    style D fill:#ef4444,stroke:#dc2626,color:#fff
    style F fill:#10b981,stroke:#059669,color:#fff
```

---
*Deploy e Tag da versão v1.20 criados com sucesso.*
