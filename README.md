# MeuRelatorio

Aplicacao web para acompanhar relatorios financeiros, lancamentos, topicos de despesa e exportacoes por projeto.

## O que o sistema faz

- Autenticacao com sessao.
- Controle de acesso por perfil e por projeto.
- Cadastro e edicao de topicos financeiros.
- Registro e consulta de lancamentos.
- Resumos por periodo, topico e grupo.
- Exportacao em Excel, CSV e PDF.
- Painel administrativo para projetos, usuarios e permissoes.
- Suporte a dados locais em JSON ou banco Supabase.

## Tecnologias

- Node.js
- Express
- Supabase
- React
- Vite
- Tailwind CSS
- PDFKit
- xlsx-populate
- ESLint
- Prettier

## Requisitos

- Node.js `>=20 <23`
- npm
- Projeto Supabase, caso use persistencia remota

No Windows, se o PowerShell bloquear `npm`, execute os comandos com `npm.cmd`.

## Como rodar localmente

Instale as dependencias:

```bash
npm install
```

Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure o `.env` e inicie o servidor:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Variaveis de ambiente

Exemplo basico:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY
APP_PROJECT_CODE=PEOCON
APP_PROJECT_NAME=Projeto PEOCON
AUTH_TOKEN_SECRET=SUBSTITUA_POR_UM_SEGREDO_LONGO_E_ALEATORIO
ALLOW_INSECURE_DEV_AUTH_SECRET=false
TRUST_PROXY=0
```

Usuarios devem ser configurados com `APP_LOGIN_USERS_JSON` usando senha em formato `passwordHash` PBKDF2.

Para gerar um hash:

```bash
npm run auth:hash
```

## Persistencia

Quando `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estao configurados, o sistema usa Supabase.

Sem essas variaveis, o sistema usa arquivos JSON locais. Para dados locais, prefira configurar `DATA_DIR` para uma pasta fora do repositorio.

Seeds versionados:

```text
data/seeds/PEOCON/
data/seeds/FELLOW/
```

## Banco de dados

Os scripts SQL ficam em:

```text
banco-de-dados/migracoes/
```

Para uma base nova, use:

```text
banco-de-dados/migracoes/site_relatorio_schema.sql
```

Para ajustes em base existente:

```text
banco-de-dados/migracoes/007_fix_schema_integrity.sql
```

Depois de configurar o Supabase, rode:

```bash
npm run supa:bootstrap-project
```

## Scripts

```bash
npm run dev
npm start
npm run build:ui
npm run build
npm run build:safe
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run test
npm run security:check
npm run auth:hash
npm run auth:revoke-sessions
npm run admin:make-super
npm run supa:bootstrap-project
```

## Estrutura

```text
api/                         entrada serverless
banco-de-dados/migracoes/    scripts SQL
data/seeds/                  seeds por projeto
docs/                        documentacao auxiliar
public/                      arquivos servidos no navegador
scripts/                     rotinas operacionais
src/cliente/configuracao/    tela React de configuracao
src/servidor/                backend Express
templates/                   modelos Excel
tests/                       testes automatizados
server.js                    entrada local
vercel.json                  configuracao de deploy
vite.config.js               configuracao Vite
```

## Rotas

Interface:

- `/`
- `/login`
- `/hub`
- `/admin`

API:

- `GET /api/auth/status`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/topicos`
- `POST /api/topicos`
- `GET /api/lancamentos`
- `GET /api/resumo`
- `GET /api/export/excel`
- `GET /api/export/csv`
- `GET /api/export/pdf`
- `GET /api/health`

## Validacao

Antes de publicar:

```bash
npm run build
npm run lint
npm run test
npm run security:check
```

## Deploy

O projeto inclui `api/index.js` e `vercel.json` para deploy na Vercel ou ambiente compativel.

Antes do deploy:

1. Configure as variaveis de ambiente.
2. Aplique o schema no Supabase.
3. Configure usuarios com senha em hash.
4. Execute `npm run build`.

## Seguranca

- Nao commite `.env`.
- Nao versionar chaves, tokens, senhas reais ou dados de runtime.
- Use `AUTH_TOKEN_SECRET` forte e diferente por ambiente.
- Mantenha `DATA_DIR` fora do repositorio.
- Revogue sessoes quando alterar usuarios ou permissoes.

## Licenca

Projeto privado.
