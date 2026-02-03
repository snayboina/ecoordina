/**
 * brand.config.ts
 * Arquivo central de configuração de marca e variáveis globais.
 * Altere aqui para mudar a identidade em todo o projeto.
 */

export const BRAND_CONFIG = {
    // --- Identidade Visual ---
    APP_NAME: "ECOORDINA SMART",
    COMPANY_NAME: "Ecoordina Smart Tech",
    SLOGAN: "Transform repetitve processes into solutions",

    // --- Cores (Utilizadas em componentes React e estilos dinâmicos) ---
    PRIMARY_COLOR: "#47536f", // Fiord - Azul acinzentado escuro
    ACCENT_COLOR: "#b05d75",  // Tapestry - Rosa terroso
    BG_COLOR: "#f5f5f4",      // Warm gray 100

    // --- Contatos & Social ---
    SUPPORT_EMAIL: "suporte@elecnor.es",
    SOCIAL_LINKS: {
        github: "https://github.com/francis-developer",
        linkedin: "https://linkedin.com/in/francisvieira",
        instagram: "@francis.developer"
    },

    // --- Design System Tokens ---
    RADIUS: {
        MAIN: "48px",
        CARD: "32px",
        INPUT: "full"
    },

    // --- Tipografia (Tamanhos de Fonte) ---
    FONT_SIZE: {
        HERO: "36px",   // Sua jornada operacional...
        TITLE: "24px",  // Títulos de seção
        BODY: "16px",   // Texto padrão
        SMALL: "12px"   // Textos auxiliares
    },

    // --- Espaçamento (Margens e Distâncias) ---
    SPACING: {
        SECTION_GAP: "32px",    // Distância entre blocos grandes
        ELEMENT_GAP: "16px",    // Distância entre botões/inputs
        LOGO_TOP: "48px",       // Margem superior do logo inicial
        CONTAINER_PADDING: "24px" // Respiro lateral das telas
    },

    // --- Ativos (URLs de Imagens) ---
    LOGOS: {
        MAIN: "https://res.cloudinary.com/duyb5dsw0/image/upload/v1769556456/Whisk_d93805c8624cb73b747439948d305d92eg_plg0wt.png",
        FAVICON: "/favicon.ico"
    }
};

export type BrandConfig = typeof BRAND_CONFIG;
