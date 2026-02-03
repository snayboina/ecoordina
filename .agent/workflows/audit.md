---
description: Auditoria completa de qualidade do código e da aplicação (Web/Mobile)
---

# Auditoria Completa de Qualidade

Este workflow realiza uma avaliação abrangente da qualidade técnica, funcional e estrutural da aplicação, garantindo que o sistema esteja pronto para produção.

## Critérios de Avaliação:

### 1. Funcionalidade
- O aplicativo funciona conforme o esperado?
- Todos os fluxos principais estão operacionais?
- Todos os botões, links e formulários respondem corretamente?

### 2. Design e Responsividade
- O layout segue o padrão definido?
- Há consistência visual (cores, tipografia, espaçamentos)?
- A aplicação é responsiva em Desktop e Mobile (sem quebras ou overflow)?

### 3. Qualidade do Código
- Código limpo, organizado e sem trechos mortos/comentados?
- Nomes de variáveis claros e semânticos?
- Funções pequenas, focadas e com responsabilidade única?

### 4. Testes
// turbo
1. Execute `npm run test`
- A cobertura de testes é superior a 70%?
- Os testes cobrem fluxos críticos e regras de negócio?

### 5. Console e Logs
- Ausência de erros ou warnings críticos no console?
- Logs úteis para diagnóstico sem exposição de dados sensíveis?

### 6. Performance
- Tempo de carregamento aceitável?
- Ausência de memory leaks, loops desnecessários ou consumo excessivo?

### 7. Segurança
- Autenticação e autorização funcionam corretamente?
- Proteção de dados sensíveis (tokens, senhas)?
- Uso de HTTPS e proteção contra vulnerabilidades (XSS, CSRF, Injeção)?

### 8. Acessibilidade (A11y)
- Navegável por teclado?
- Contraste adequado e textos alternativos em imagens?
- Labels corretos em campos de formulário?

### 9. Usabilidade (UX)
- Fluxos intuitivos e fáceis de compreender?
- Feedback visual adequado (loading, sucesso, erro)?

### 10. Compatibilidade
- Funciona corretamente nos principais navegadores (Chrome, Firefox, Safari, Edge)?
- Compatibilidade mobile (Android/iOS) garantida?

### 11. Resiliência e Offline
- Comportamento adequado em instabilidade de conexão?
- Mensagens claras de erro de rede?

### 12. Arquitetura e Manutenibilidade
- Separação clara de responsabilidades (Interface, Domínio, Dados)?
- Baixo acoplamento e facilidade para adicionar novas features?

### 13. Escalabilidade
- Uso eficiente de chamadas de API, cache e recursos de infraestrutura?

### 14. Build e Deploy
- Processo de build automatizado e confiável?
- Pipeline de CI/CD configurado ou preparado?

### 15. Configuração e Ambientes
- Variáveis de ambiente corretamente configuradas para cada ambiente?

### 16. Compliance
- Conformidade com LGPD/GDPR e políticas de privacidade acessíveis?

---

## Relatório Final

Gere um relatório consolidado com o status de cada item:

✅ **Aprovado** | ⚠️ **Parcial** | ❌ **Reprovado**

Destaque pontos fortes, riscos identificados e recomendações de próximos passos.
