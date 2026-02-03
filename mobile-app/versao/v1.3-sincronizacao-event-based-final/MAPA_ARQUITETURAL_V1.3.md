# Mapa Arquitetural v1.3 - Sincronização Instantânea

Este mapa descreve o fluxo lógico do sistema de sincronização, desde o evento no Google Drive até a atualização final no banco de dados.

```mermaid
graph TD
    %% Definição de Estilos
    classDef trigger fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    classDef webhook fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    classDef decision fill:#FFC107,stroke:#FFA000,stroke-width:2px,color:#000
    classDef action fill:#424242,stroke:#212121,stroke-width:2px,color:#fff
    classDef ignore fill:#9E9E9E,stroke:#616161,stroke-width:2px,color:#fff

    %% Fluxograma
    START[("🔔 Google Drive<br/>Arquivo Modificado")]:::trigger
    
    WEBHOOK["👨‍💻 Webhook n8n<br/>Recebe Evento"]:::webhook
    
    VALID_EVT{"✅ Validar Evento<br/>change/update?"}:::decision
    
    IGNORE["⏩ Ignorar"]:::ignore
    
    FETCH["📄 Buscar Arquivo<br/>Mais Recente"]:::action
    
    TIME_CHECK{"⏱️ Validar Tempo<br/> < 1 minuto?"}:::decision
    
    READ_XLSX["📊 Ler Planilha<br/>(XLSX)"]:::action
    
    TRANSFORM["⚙️ Transformar Dados<br/>(Regras de Negócio)"]:::action
    
    COMPARE{"⚖️ Comparar com<br/>Supabase?"}:::decision
    
    SKIP["⭕ Pular (Sem Mudança)"]:::ignore
    
    DB_UPDATE["🚀 Atualizar Banco<br/>(UPSERT)"]:::trigger

    %% conexões
    START --> WEBHOOK
    WEBHOOK --> VALID_EVT
    
    VALID_EVT -- "inválido" --> IGNORE
    VALID_EVT -- "válido" --> FETCH
    
    FETCH --> TIME_CHECK
    
    TIME_CHECK -- "não" --> IGNORE
    TIME_CHECK -- "sim" --> READ_XLSX
    
    READ_XLSX --> TRANSFORM
    TRANSFORM --> COMPARE
    
    COMPARE -- "igual" --> SKIP
    COMPARE -- "diferente" --> DB_UPDATE
```

### Explicação do Mapa:
1.  **Gatilho:** O Google Drive dispara um sinal assim que você salva ou sobe o arquivo.
2.  **Webhook:** O n8n "atende a chamada" e começa o processamento.
3.  **Validações:** O sistema verifica se o arquivo é o correto e se a mudança é recente o suficiente para evitar processamento duplicado.
4.  **Transformação:** As datas e nomes são normalizados para o formato do banco.
5.  **Comparação Inteligente:** O sistema só gasta recursos se houver uma diferença real entre o que está no Excel e o que está no Supabase.
