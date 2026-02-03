# ⚡ Guia de Customização Ultra-Rápida

Este sistema permite que você altere a identidade visual e as configurações globais de todo o projeto em segundos, editando apenas **um arquivo principal**.

## 🎯 Como funciona?

O projeto utiliza uma ponte entre o **TypeScript** e o **CSS** através de injeção dinâmica de variáveis no `App.tsx`.

## 🛠️ O Arquivo Mestre: `brand.config.ts`

Localizado em: [`src/arquitetura/brand.config.ts`](file:///c:/Users/Adm/Downloads/eoorddinasmart/mobile-app/src/arquitetura/brand.config.ts)

Para mudar a cor do projeto, altere a propriedade `PRIMARY_COLOR`:

```typescript
export const BRAND_CONFIG = {
  // --- Identidade Visual ---
  APP_NAME: "FRANCIS DEVELOPER",
  
  // --- Cores ---
  PRIMARY_COLOR: "#b040dc", // Sua nova cor aqui
  BG_COLOR: "#e2e4e7",      // Cor de fundo das telas
  
  // --- Tipografia ---
  FONT_SIZE: {
    HERO: "56px",   // Títulos gigantes
    TITLE: "24px",  // Títulos de seção
    BODY: "16px"    // Texto padrão
  },

  // --- Design ---
  RADIUS: {
    MAIN: "48px", // Arredondamento dos botões e painéis
  }
};
```

## 🎨 O que acontece quando você muda a cor?

Ao salvar o arquivo `brand.config.ts`, as seguintes áreas são atualizadas automaticamente:

1.  **Interface Mobile**: Ícones, botões primários, bordas de foco e indicadores de status.
2.  **Dashboard**: As cores dos cards e gráficos de barras refletem a cor primária escolhida.
3.  **Emails**: Todos os templates de email gerados pelo sistema usarão o seu novo `PRIMARY_COLOR`.
4.  **Branding**: O nome do aplicativo no cabeçalho e na tela de login mudará para o seu `APP_NAME`.

## 📁 Localização dos Documentos
- **Brainstorm de Customização**: [`arquitetura/customizacao/brainstorm_customizacao.md`](file:///c:/Users/Adm/Downloads/eoorddinasmart/mobile-app/arquitetura/customizacao/brainstorm_customizacao.md)
- **Documentação de Arquitetura**: [`arquitetura/arquitetura_mobile.md`](file:///c:/Users/Adm/Downloads/eoorddinasmart/mobile-app/arquitetura/arquitetura_mobile.md)

---
> [!TIP]
> Use códigos hexadecimais (ex: #FFFFFF) ou cores CSS padrão. O sistema de injeção cuidará de propagar o valor para todas as camadas de estilo (Tailwind, CSS Vanilla e Inline Styles).
