/**
 * email.service.ts
 * Exemplo de serviço de email que consome o branding global.
 */
import { BRAND_CONFIG } from './brand.config';

export const generateEmailTemplate = (content: string) => {
  return `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
      <div style="background-color: ${BRAND_CONFIG.PRIMARY_COLOR}; padding: 30px; text-align: center;">
        <img src="${BRAND_CONFIG.LOGOS.MAIN}" alt="${BRAND_CONFIG.APP_NAME}" style="height: 50px;" />
      </div>
      <div style="padding: 40px;">
        <h2 style="color: ${BRAND_CONFIG.PRIMARY_COLOR};">Olá!</h2>
        <p>${content}</p>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999;">
          <p>${BRAND_CONFIG.COMPANY_NAME} &copy; 2026</p>
          <p>Suporte: ${BRAND_CONFIG.SUPPORT_EMAIL}</p>
          <div style="margin-top: 10px;">
            <a href="${BRAND_CONFIG.SOCIAL_LINKS.instagram}" style="color: ${BRAND_CONFIG.PRIMARY_COLOR}; text-decoration: none;">Instagram</a> |
            <a href="${BRAND_CONFIG.SOCIAL_LINKS.linkedin}" style="color: ${BRAND_CONFIG.PRIMARY_COLOR}; text-decoration: none;">LinkedIn</a>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const sendWelcomeEmail = async (userEmail: string) => {
  console.log(`[Simulação] Enviando email para ${userEmail}...`);
  // Lógica real de envio aqui (ex: SendGrid, Resend, etc)
};
