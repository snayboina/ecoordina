# Gerenciamento de Versões (Backup Manual)

Este documento explica como funciona a pasta de backup criada e como você pode restaurar o código para esta versão específica no futuro.

## 📂 Estrutura da Pasta

A pasta `versao/` contém cópias de segurança dos arquivos principais na data atual:

- `App.tsx.bak`: Cópia do componente principal da aplicação.
- `index.css.bak`: Cópia dos estilos globais e definições de tema.
- `api.ts.bak`: Cópia das integrações com serviços e Supabase.

## ⏪ Como Restaurar esta Versão

Se você precisar voltar para esta versão exata, siga estes passos:

### Método 1: Restaurar Arquivos Individuais (Manual)
Basta copiar o conteúdo do arquivo `.bak` e colar de volta no arquivo original correspondente dentro da pasta `src/`.

### Método 2: Restaurar via Linha de Comando (PowerShell)
Execute os seguintes comandos no terminal na raiz do projeto:

```powershell
copy versao\App.tsx.bak src\App.tsx
copy versao\index.css.bak src\index.css
copy versao\api.ts.bak src\services\api.ts
```

## 🚀 Recomendação: Uso do Git

Embora a pasta `versao/` seja útil para backups rápidos, o projeto já utiliza **Git**, que é a forma profissional de gerenciar versões. 

- Para salvar o estado atual: `git commit -am "Sua mensagem aqui"`
- Para ver o histórico: `git log --oneline`
- Para voltar ao último salvamento: `git restore .`

> [!NOTE]
> Use a pasta `versao/` para mudanças experimentais rápidas, mas sempre prefira Commits do Git para marcos importantes do desenvolvimento.
