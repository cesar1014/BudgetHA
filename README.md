# Site Relatorio

Projeto Node.js/Express com frontend estatico, painel administrativo e integracao com Supabase.

## Como rodar

```bash
npm install
npm run build:ui
npm start
```

Em desenvolvimento:

```bash
npm run dev
```

App local:

```txt
http://localhost:3000
```

## Estrutura

```txt
site-relatorio/
|-- api/                    # entrada para Vercel/serverless
|-- banco-de-dados/
|   `-- migracoes/          # schema SQL consolidado
|-- data/
|   `-- seeds/              # seeds versionados por projeto
|-- public/                 # HTML, CSS, JS e assets servidos ao navegador
|-- scripts/                # scripts operacionais e de seguranca
|-- src/
|   |-- cliente/
|   |   `-- configuracao/   # fonte React da tela de configuracao
|   `-- servidor/
|       |-- aplicacao.js    # app Express principal
|       |-- config/         # ambiente e caminhos de runtime
|       |-- infra/          # persistencia JSON local
|       |-- middleware/     # seguranca HTTP
|       `-- modulos/
|           |-- administracao/
|           |-- autenticacao/
|           |-- projetos/
|           `-- relatorios/
|-- templates/              # modelos Excel
|-- tests/                  # testes automatizados
|-- server.js               # entrada principal
`-- package.json
```

## Banco de dados

Os arquivos SQL ficam em `banco-de-dados/migracoes/`.

Para banco novo:

```txt
banco-de-dados/migracoes/site_relatorio_schema.sql
```

Para banco existente:

```txt
banco-de-dados/migracoes/007_fix_schema_integrity.sql
```

## Arquivos importantes

- `server.js`: entrada principal do projeto.
- `src/servidor/aplicacao.js`: backend Express completo.
- `src/servidor/config/ambiente.js`: carregador interno de `.env`.
- `src/servidor/modulos/autenticacao/senhas.js`: hash e verificacao de senha.
- `src/servidor/modulos/relatorios/nucleo-relatorios.js`: regras de relatorios.
- `src/cliente/configuracao/`: fonte da tela React de configuracao.

## Scripts uteis

```bash
npm start
npm run dev
npm run build
npm run test
npm run auth:hash
npm run admin:make-super
npm run security:check
```
