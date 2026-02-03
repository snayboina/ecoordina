# Guia de Rollback (Retorno de Versão)

Se por algum motivo você desejar voltar para a versão anterior ou restaurar o layout anterior, siga as instruções abaixo:

## Como solicitar o Rollback
Para restaurar a versão anterior (v1.3), basta enviar a seguinte mensagem no chat:

> **"Antigravity, desejo realizar o rollback para a versão v1.3. Por favor, restaure os arquivos da pasta /versao/v1.3-sincronizacao-event-based-final para as pastas originais do projeto."**

## O que o Antigravity fará:
1. Localizará o backup físico na pasta `/versao/v1.3...`.
2. Substituirá os arquivos atuais (`App.tsx`, `index.css`, etc.) pelos arquivos daquela versão.
3. Realizará um novo deploy para garantir que a produção também volte ao estado anterior.
4. Removerá a tag de versão problemática se necessário.

## Prevenção
Todas as versões são salvas fisicamente na pasta `/versao` antes de cada deploy, garantindo que nenhum dado ou layout seja perdido permanentemente.
