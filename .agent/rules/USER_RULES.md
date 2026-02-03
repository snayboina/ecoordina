---
trigger: always_on
---

# REGRAS DO USUÁRIO

Este arquivo define regras críticas que o agente deve seguir neste workspace.

## REGRAS IMPORTANTES

1. **FOCO TOTAL:** FOQUE APENAS no que o usuário está pedindo especificamente.
2. **INTEGRIDADE DO CÓDIGO:** NÃO MEXA em partes do código que não foram mencionadas explicitamente.
3. **DOCUMENTAÇÃO:** NÃO CRIE arquivos de documentação (.md) a menos que peça explicitamente.
4. **SISTEMA EM PRODUÇÃO:** O código já está funcionando - apenas adicione ou altere o que foi solicitado.
5. **ESTABILIDADE:** NÃO QUEBRE funcionalidades existentes.
6. **CIRÚRGICO:** Faça apenas as alterações estritamente necessárias para implementar a funcionalidade pedida.
7. **RESPONSIVIDADE:** Sempre verificar responsividade. O sistema deve ser sempre responsivo para Desktop e Mobile.
8. **REVISÃO:** Sempre revise o código usado para confirmar se está correto e funcional.

## RESUMO DE EXECUÇÃO
Faça exatamente o que for pedido, nada mais, nada menos. Preserve tudo que já funciona.

## TRADUÇÃO (MANDATÓRIO)
- **ID:** #TRADUZIR
- **REGRA:** Traduza tudo para PORTUGUÊS (BRASIL). Todo o texto gerado, comentários explicativos e comunicações devem ser em português brasileiro.

## 📌 PROTOCOLO DE FINALIZAÇÃO E VERSIONAMENTO – CI/CD GOOGLE ANTIGRAVITY

Sempre que qualquer ação, criação ou mudança for concluída no código ou fluxo, você DEVE obrigatoriamente realizar o seguinte protocolo antes de encerrar o atendimento:

### 1. Pergunta de Fechamento (Obrigatória)
Pergunte explicitamente ao usuário:
👉 **“Deseja realizar o protocolo de fechamento (Criar nova Versão, Tag, Release Notes para o GitHub, enviar para o Git e fazer Deploy)?”**

### 2. Ações em caso de confirmação (SIM):
Se o usuário concordar, execute em sequência:
1.  **Versão Física:** Criar uma nova subpasta em `/versao` contendo as alterações (Ex: `v1.3-sincronizacao-event-based`).
2.  **Documentação:** Gerar um diagrama **Mermaid** atualizado e explicações para o `RELEASE_NOTES.md`.
3.  **Git & Tag:** Adicionar as mudanças ao Git, realizar commit e criar uma tag técnica (Ex: `v1.3`).
4.  **GitHub Push:** Enviar todos os arquivos e tags para o repositório remoto (`git push origin main --tags`).
5.  **Deploy:** Validar e disparar o deploy (ex: Vercel) para garantir que a produção esteja atualizada.

### 3. Ações em caso de recusa (NÃO):
1. Apenas finalize as alterações solicitadas.
2. Não crie pastas de versão ou tags.
3. Encerre o processo normalmente.

**REGRA DE OURO:** Nunca encerre uma tarefa de código ou infraestrutura sem fazer essa pergunta completa.
