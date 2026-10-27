# Identificação autoral — 27/10/2026

**Autor:** Prof. João Frederico Musial.

**Natureza:** Material didático digital interativo.

© 2026 João Frederico Musial. Todos os direitos reservados sobre os elementos originais, com as ressalvas de [COPYRIGHT.md](../COPYRIGHT.md) e das licenças de terceiros.

## Estrutura analisada antes da implementação

O projeto é uma aplicação estática de JavaScript modular, compilada com Vite. Reveal.js organiza a apresentação de 26 arquivos em `src/slides/`; não há roteador de páginas nem backend. `src/main.js` reúne o conteúdo e registra os componentes. No modo estudo, um adaptador permite a rolagem contínua das mesmas telas. `src/core/shell.js` concentra menu de seções, modos, volume, redução de movimento, tema e tela cheia.

O registro compartilhado em `src/core/registry.js` controla a ativação dos componentes por visibilidade. Os simuladores estão organizados por técnica de exame em `src/simulators/`. Áudio, síntese, espectrogramas e desenhos de tórax possuem módulos próprios em `src/core/`. Os estilos são separados em fontes, tokens, base, composição das telas, componentes, conteúdo responsivo, ajustes respiratórios e tema claro/escuro.

O build existente possui alvos web (`dist/`) e offline (`dist-offline/`). O GitHub Actions publica somente o alvo web com a configuração de caminhos relativos já existente. Nenhuma configuração de publicação ou dependência foi alterada.

## Implementação

- `index.html`: rodapé semântico único, aviso completo em diálogo nativo, metadados author/copyright e Open Graph. Mantidos título, descrição, idioma, viewport e favicon existentes.
- `src/core/authorship.js`: abertura, fechamento, contenção do foco e retorno ao botão de origem. Escape e o botão Fechar encerram o diálogo. Teclas usadas no aviso não acionam os atalhos da aula.
- `src/styles/authorship.css`: paleta herdada dos temas existentes; rodapé permanentemente visível; área reservada ao rodapé e à barra da apresentação; espaço final de rolagem no modo estudo; diálogo rolável com botão de fechamento em cabeçalho aderente.
- `src/main.js` e `src/core/shell.js`: integração dos estilos e do comportamento compartilhado nos dois modos.
- `COPYRIGHT.md` e `README.md`: identificação autoral, limites do aviso, direitos de terceiros e fontes legais.
- `sandbox/autoria-qa.cjs`: testes de teclado, foco, limites da janela, sobreposições e permanência do rodapé nas 26 telas, em temas claro/escuro, além do formato offline.

## Verificação

Builds web e offline executados com sucesso. Matriz de seis resoluções (1920×1080, 1366×768, 390×844, 844×390, 768×1024 e 320×640), nos temas claro e escuro. As verificações abrangem as 26 telas em cada combinação, diálogo acessível por nome, Enter/Espaço, Tab/Shift+Tab, Escape, restauração do foco, contenção dos atalhos, tela cheia, metadados e permanência durante inatividade.

Os testes existentes de interação percorreram os simuladores, gravações e exercícios sem erros de JavaScript. Os arquivos de aulas, simuladores, imagens, fontes e áudios permanecem inalterados. A configuração de build/deploy, o lockfile e as dependências também permanecem inalterados.

As evidências geradas ficam em `evidencias/autoria/`, fora do versionamento. O teste requer Playwright e Chrome disponíveis no ambiente de testes, sem adicioná-los às dependências da aplicação. Para testar outro endereço: definir `QA_URL` e executar `node sandbox/autoria-qa.cjs`.

## Limites e ressalvas

Os testes de interface usam Chrome e resoluções simuladas; não substituem verificação em dispositivos físicos ou com um leitor de tela instalado. O diálogo usa semântica nativa, nome e descrição acessíveis, fundo inerte e controle explícito de foco. O aviso identifica a autoria e as condições de utilização; não constitui registro formal nem mecanismo técnico de bloqueio de cópia.

Materiais de terceiros mantêm suas licenças. Não foi criado arquivo LICENSE permissivo nem alterada a autorização dos trechos SPRSound, do reveal.js ou das fontes tipográficas.
