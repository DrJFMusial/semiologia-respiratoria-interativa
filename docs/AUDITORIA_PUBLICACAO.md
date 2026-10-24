# Auditoria de publicação — 24/10/2026

## Origem e versão

Entrega original preservada em `E2M08_SEMIOLOGIA_RESPIRATORIA_INTERATIVA_v1.0.0`. Antes das alterações, recompilamos `codigo-fonte` com Vite 5.4.11 e comparamos por SHA-256 com `site-github-pages`: todos os arquivos coincidiram. O HTML offline não foi usado como origem da publicação.

O package.json declara 1.0.0. O lockfile tinha nome cardiovascular e versão 0.2.0 herdados; corrigimos somente os metadados da raiz, mantendo as versões e integridades das dependências. O caminho relativo `base: './'` já atende ao subdiretório do Pages.

## Áudios e licenças

Foram auditados os dez WAV efetivamente importados por `src/core/clips.js`, com fichas em `src/assets/audio/clips.json`. Os dez SHA-256 de originais declarados nas fichas coincidem com arquivos baixados diretamente do repositório oficial SPRSound. Script de conferência: `sandbox/auditar-audio.mjs`.

Fontes verificadas:

- https://github.com/SJTU-YONGFU-RESEARCH-GRP/SPRSound/blob/main/LICENSE — CC BY 4.0.
- https://github.com/SJTU-YONGFU-RESEARCH-GRP/SPRSound/blob/main/BioCAS2022/README.md — remete à licença da raiz.
- https://github.com/SJTU-YONGFU-RESEARCH-GRP/SPRSound/blob/main/BioCAS2023/README.md — remete à licença da raiz.

A licença permite compartilhar e adaptar, com atribuição, link da licença e indicação das alterações. As fichas e os créditos mantêm autores, fonte, rótulos e modificações. Não identificamos cláusula adicional restritiva nos documentos oficiais consultados. Nenhum áudio teve licença pendente nesta auditoria.

Os WAV distribuídos contêm apenas blocos `fmt ` e `data`, sem blocos de metadados pessoais. A cópia pública omite identificadores de pacientes e de registros, idade e sexo. A procedência usa somente identificadores locais dos trechos, hash do original, autores, acervo e licença. Não foram incluídos cadastros nem tabelas Patient Summary. O nome do caso condutor foi substituído por uma designação didática sem identificação. O gerador original de trechos, que embutia identificadores, fica preservado somente na entrega local.

Não há credenciais, backend ou envio de dados no código examinado. A gravação opcional de voz permanece na memória do navegador. A auditoria técnica não certifica a anonimização realizada pelos responsáveis pelo acervo.

Ilustrações: autoria e autorização do professor conforme documentação original. Fontes: SIL OFL 1.1. reveal.js: MIT. Cópias das licenças acompanham também a distribuição web em `licencas/`, acessíveis na tela de créditos. Mantidos os direitos autorais do conteúdo didático.

## Alterações de distribuição

- Modo escuro solicitado: paleta de interface, botão acessível, preferência local persistente e tema inicial do sistema.
- Superfícies adaptadas ao tema, sem inverter imagens clínicas ou a escala científica do espectrograma.
- Lockfile identificado como aplicação respiratória 1.0.0.
- Workflow existente mantido, com Node 22 e configuração oficial do Pages.
- README e instruções de publicação atualizados; documentação original preservada.
- Licenças de runtime incluídas no site.

## Verificação

A rodada de interação percorreu ciclo, mecânica, inspeção, padrões respiratórios, expansibilidade, frêmito, percussão, ausculta, comparação de gravações, espectrogramas, quiz, matriz de síndromes, ressonância vocal, descritor e registro, sem erros de JavaScript.

Matriz de temas claro/escuro em 1920×1080, 1366×768, 390×844, 844×390 e 768×1024: 26 telas montadas; sem respostas HTTP de erro. Navegação por menu e setas, troca de modos, tela cheia, áudio, volume, pausa global e persistência de tema verificados. Imagens com carregamento lazy são verificadas ao visitar suas telas, não classificadas como quebradas antes do carregamento.

Limites: testes em Chrome; não representam execução em hardware móvel físico nem em todos os navegadores. Não foi concedido acesso ao microfone durante a auditoria. O espectrograma mantém sua escala clara de intensidade original também no tema escuro para preservar a interpretação científica.


