---
description: Workflows de verificações padrão para o projeto.
---

# Verificações Padrão

Sempre que uma nova funcionalidade for implementada ou uma página for criada, siga estas etapas:

## 1. Listagem de Alterações
- Liste todos os componentes e arquivos criados ou modificados de forma detalhada.

## 2. Responsividade
- Verifique a responsividade em resoluções de Desktop (1920x1080, 1440x900).
- Verifique a responsividade em dispositivos Mobile (iPhone 12/13/14, Pixel 5).
- Garanta que nenhum elemento quebre layout ou transborde (overflow).

## 3. Segurança
- Verifique se há exposição de segredos ou chaves de API.
- Garanta que as permissões de acesso (se houver) estejam configuradas.

## 4. Banco de Dados
- Verifique se a nova feature exige migrations.
- Caso exija, documente os passos de migração necessários.
