# Publicação no GitHub Pages

Repositório público: https://github.com/drjfmusial/semiologia-respiratoria-interativa
Aula: https://drjfmusial.github.io/semiologia-respiratoria-interativa/

O código deste repositório é a distribuição 1.0.0 da aula de Semiologia Respiratória Interativa, com tema escuro solicitado para a publicação.

## Build reproduzível

Node.js 22 e npm: executar `npm ci` e `npm run build`. O diretório publicável é `dist/`, gerado do código-fonte. `base: './'` mantém os recursos relativos, compatíveis com o subdiretório do repositório e com desenvolvimento local. O build offline existente continua disponível em `npm run build:offline`.

## Deploy

Settings → Pages → Source: GitHub Actions. O workflow `.github/workflows/deploy.yml` instala dependências pelo lockfile, compila e envia somente `dist/` ao GitHub Pages. A tag `v1.0.0` identifica o código da primeira publicação validada. O código-fonte fica em `main`; não é necessária uma segunda ferramenta de build.

## Recursos e privacidade

Atribuições em `CREDITOS_E_LICENCAS.md` e na tela de referências. O microfone da ressonância vocal é opcional: requer autorização do usuário, usa memória local e não envia a gravação a servidor. Não há backend, cadastro nem analytics no código auditado. Os trechos clínicos e sua proveniência estão descritos em `AUDITORIA_PUBLICACAO.md`.

## Endereços

- Apresentação: `?modo=apresentacao`
- Estudo: `?modo=estudo`
- Tela específica: `#/6`

A publicação usa cópia separada. Os arquivos originais da entrega e a aplicação cardiovascular foram preservados.

