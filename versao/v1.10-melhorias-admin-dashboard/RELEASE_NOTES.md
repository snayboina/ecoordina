# RELEASE NOTES - v1.10 🚀

## Melhorias no Admin Dashboard

Esta versão foca em aprimorar a experiência do usuário, consistência de marca e estabilidade de sessão no painel administrativo.

### 🛠 Alterações Realizadas

#### 💎 UI/UX & Branding
- **Branding:** Removido o termo "SaaS" de todos os logos (Tela de Login e Sidebar), mantendo a identidade como **ECOORDINA SMART**.
- **Interatividade:** Aplicado `cursor: pointer` globalmente para todos os botões do sistema, garantindo feedback visual imediato ao usuário.
- **Limpeza Visual:** Removido o botão de seta verde/vermelho do modal de detalhes do colaborador, tornando a seção de "Tempo Total de Liberação" puramente informativa.

#### 🔐 Segurança & Performance
- **Persistência de Sessão:** Implementada lógica de retenção de login por **10 minutos** via `localStorage`. Agora, o usuário permanece logado mesmo após recarregar a página ou fechar o navegador por um curto período.
- **Sincronização de Dados:** O banner de "Última Atualização" agora reflete a data real de modificação no Supabase, garantindo maior fidedignidade às informações exibidas.

### 📊 Estrutura de Dados
- Nenhuma alteração de schema nesta versão.

### 🧪 Verificação
- [x] Teste de persistência de sessão (10 min).
- [x] Verificação visual do logo em diferentes telas.
- [x] Verificação do cursor em botões de exportação (Excel/PDF).
- [x] Sincronização de data com base no banco de dados.

---
*Gerado automaticamente pelo CI/CD Google Antigravity em 04/02/2026.*
