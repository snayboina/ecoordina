# Release Notes - v1.4 Admin (Cyber Teal Sync)

## 🎨 Identidade Visual (Design System)
- **Sincronização Global:** O Admin Dashboard agora utiliza a mesma paleta **Cyber Teal** (#00f3ff) e **Emerald** (#10b981) do aplicativo mobile.
- **Glassmorphism & Glow:** Implementação de sombras de impacto (`shadow-premium`) e efeitos de brilho neon nos botões e indicadores de status.
- **Login Renovado:** Tela de login atualizada com gradientes técnicos e novo Logo Pill.

## 📊 Melhorias na Exportação (Excel)
- **Formatação Profissional:** A exportação para Excel agora conta com:
    - **Cabeçalho Roxo:** Fundo roxo (#7030A0) com texto branco em negrito.
    - **Ajuste de Colunas:** Larguras de colunas otimizadas para cada tipo de dado.
    - **Bordas e Alinhamento:** Layout em grade com alinhamento centralizado para campos técnicos.
- **Consistência:** Os campos exportados agora refletem exatamente o que o usuário vê no dashboard administrativo.

## 🛠️ Detalhes Técnicos
- Adição da dependência `exceljs` para suporte a estilos avançados em arquivos `.xlsx`.
- Substituição de herança de cores estáticas por variáveis CSS de marca.
