# Semiologia Respiratória Interativa

**Aula pública:** https://drjfmusial.github.io/semiologia-respiratoria-interativa/

Versão de distribuição **1.0.0**, com modos claro e escuro. O botão de lua/sol na barra alterna o tema; a preferência fica salva somente no navegador. Sem preferência salva, acompanha o tema do sistema.

Objetivo: apoiar o ensino e o estudo da inspeção, palpação, percussão e ausculta respiratória, com simuladores, espectrogramas, exercícios e matriz de síndromes pleuropulmonares.

E2M08 · Introdução à Propedêutica Médica · Semestre 2026/2
Prof. João Frederico Musial · Medicina · Centro Universitário Campo Real

Aplicação educacional estática (HTML5, CSS, JavaScript) para a aula de semiologia respiratória. Um único código serve a dois usos:

- **Modo apresentação**: tela 16:9 (1600 × 900) escalada sem corte para qualquer projetor, navegação por setas, notas do apresentador.
- **Modo estudo**: documento rolável e responsivo para computador, tablet e celular, com os mesmos simuladores.

Versão **1.0.0**: 26 telas, cerca de 56 minutos (51 se mecânica e sintomas ficarem para o estudo). Sem back-end, login ou coleta de dados. Arquitetura herdada da aula *Semiologia Cardiovascular Interativa*.

## Requisitos

- Node.js 18 ou superior e npm.
- Navegador atual: Chrome, Edge, Firefox ou Safari.

## Instalar e executar

```bash
npm ci
npm run dev          # http://localhost:5173
```

Modos por endereço: `?modo=apresentacao` ou `?modo=estudo`. Em telas estreitas (até 820 px, ou celular deitado) o modo estudo é o padrão.

## Gerar os pacotes

```bash
npm run build          # dist/          site estático para o GitHub Pages
npm run build:offline  # dist-offline/  um único index.html autocontido (duplo clique, sem internet)
npm run build:all      # os dois
```

O `dist/` usa caminhos relativos e funciona em qualquer subdiretório. O `dist-offline/index.html` traz JavaScript, estilos, fontes, imagens e gravações embutidos (cerca de 3,3 MB).

## Atalhos

| Tecla | Ação |
|---|---|
| ← → | Slide anterior ou seguinte (fora dos simuladores) |
| Clique no laboratório, depois ← → | Fase anterior ou seguinte do ciclo respiratório |
| Espaço (simulador em foco) | Reproduzir ou pausar |
| M | Menu de seções |
| X | Pausar todas as animações e sons |
| S | Notas do apresentador |
| F | Tela cheia |

## Estrutura

```
index.html
src/
  main.js                    monta os slides, escolhe o modo, registra componentes
  slides/NN-nome.html        um arquivo por tela, em ordem alfabética
  core/
    audio.js                 motor de áudio: um som por vez, nada sem clique
    clips.js                 gravações clínicas: leitura do WAV, fichas, termos
    spectro.js               forma de onda e espectrograma (FFT própria)
    synth.js                 ciclo respiratório e sons ESQUEMÁTICOS (laboratório, percussão, vogal)
    thorax.js                tórax frontal esquemático (pneumotórax, derrame, consolidação, atelectasia, hiperinsuflação)
    registry.js, shell.js, ui.js   herdados da aula cardiovascular
  components/                capa, roteiro, revelar/pontos/checklist, descritor, registro, créditos
  simulators/
    superficie/              anatomia de superfície em três vistas
    mecanica/                pressões e fluxo; pneumotórax, derrame, obstrução
    ciclo/                   laboratório do ciclo respiratório com espectrograma
    inspecao/                formas do tórax, baqueteamento (Lovibond e Schamroth), padrões respiratórios
    palpacao/                expansibilidade e frêmito toracovocal
    percussao/               técnica e mapa de percussão
    ausculta/                mapa de pontos, gravações clínicas, sons normais, ressonância vocal
    quiz/                    escute e identifique
    sindromes/               matriz das síndromes pleuropulmonares
  assets/images/             ilustrações do professor em WebP
  assets/audio/              trechos do SPRSound (WAV), clips.json (fichas) e licença
tools/clips.py               gera os trechos e as fichas a partir dos arquivos ORIGINAIS do SPRSound
docs/                        relatório, QA, créditos, publicação
```

### Procedência dos trechos de áudio

A distribuição pública usa fichas sem identificadores de paciente, idade ou sexo. Os hashes dos originais e as atribuições são preservados. O gerador original que contém os identificadores do acervo permanece apenas na entrega local.

## Publicação no GitHub Pages

O GitHub Actions executa 
pm ci`, gera `dist/` e publica a cada envio para `main`. Ver [`docs/PUBLICACAO_GITHUB_PAGES.md`](docs/PUBLICACAO_GITHUB_PAGES.md).

## Dependências

| Pacote | Versão | Licença | Uso |
|---|---|---|---|
| reveal.js | 5.2.1 | MIT | motor de apresentação |
| vite | 5.4.11 | MIT | desenvolvimento e build |
| vite-plugin-singlefile | 2.0.3 | MIT | arquivo único offline |

Fontes Inter e IBM Plex Mono (OFL 1.1). Créditos completos em [`docs/CREDITOS_E_LICENCAS.md`](docs/CREDITOS_E_LICENCAS.md).

