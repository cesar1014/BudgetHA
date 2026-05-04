# Atualização da página de relatórios e GitHub

## O que foi alterado

- A página de **Relatórios** foi simplificada com base no layout minimalista enviado como referência.
- O visual usa o tema do próprio projeto: variáveis CSS, fonte Manrope/Sora, cores claras/escuras e botões já existentes.
- Os filtros de **ano**, **semestre**, **todos**, período por data e busca continuam atualizando os dados do relatório.
- A visualização ficou mais objetiva:
  - cabeçalho com exportação;
  - três KPIs principais;
  - barra de execução;
  - despesas por grupo;
  - leitura executiva;
  - ranking e pontos de atenção.
- O arquivo `.gitignore` foi reforçado para evitar subir segredos, dados locais, builds e arquivos temporários.
- O arquivo `.env` foi removido do pacote final. Use `.env.example` como modelo.

## Arquivos principais alterados

- `public/index.html`
- `public/app.js`
- `public/styles.css`
- `.gitignore`

## Como subir no GitHub

```bash
git init
git add .
git commit -m "Atualiza pagina de relatorios e organiza gitignore"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

Se o repositório remoto já existir no projeto:

```bash
git remote -v
git add .
git commit -m "Atualiza pagina de relatorios e organiza gitignore"
git push
```

## Importante

Antes de rodar localmente, crie seu `.env` a partir do `.env.example`:

```bash
copy .env.example .env
npm install
npm start
```

No Windows PowerShell, também pode usar:

```powershell
Copy-Item .env.example .env
npm install
npm start
```
