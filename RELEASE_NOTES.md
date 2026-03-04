# Release Notes - v1.18

## 🚀 Novidades

### 📱 Mobile App
- **Filtros de Data de Admissão:** Adicionados campos de "Início Admissão" e "Fim Admissão" com interface premium e funcionalidade em tempo real.
- **Paridade com Web:** Lógica de status unificada (necessário 4 "OK" para liberação).
- **Novo Ícone:** Substituição do ícone padrão por uma identidade visual exclusiva EcoordinaSmart.
- **Parsing de Datas:** Implementada lógica robusta para entender múltiplos formatos de data (ISO e PT-BR).

### 🛠️ Correções e Melhorias
- Correção de bug de tela em branco no Mobile causado por mapeamento de campos.
- Atualização do período padrão de visualização até 31/03/2026.

## 📊 Arquitetura Atualizada

```mermaid
graph TD
    subgraph "Fontes de Dados"
        S[(Supabase)]
        G[Google Sheets]
    end

    subgraph "Aplicações"
        M[Mobile App]
        D[Admin Dashboard]
    end

    G -- "Sync Automatizado" --> S
    S -- "Lógica de 4 OKs" --> M
    S -- "Lógica de 4 OKs" --> D
    
    subgraph "Filtros Mobile"
        F1[Função]
        F2[Status]
        F3[Data Admissão]
    end
    
    M --- F1
    M --- F2
    M --- F3
```

## 📸 Demonstração do Novo Ícone

![Ícone v1.18](file:///c:/Users/Adm/Downloads/eoorddinasmart/mobile-app/public/app-icon.png)
