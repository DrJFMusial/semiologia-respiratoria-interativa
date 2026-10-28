# Créditos e licenças

## Autoria do conteúdo

Conteúdo didático, caso condutor e roteiro: Prof. João Frederico Musial, Medicina, Centro Universitário Campo Real. Todos os direitos reservados ao autor, salvo indicação abaixo.

## Gravações clínicas

Trechos do **SPRSound: SJTU Paediatric Respiratory Sound Database** (Shanghai Jiao Tong University e hospitais afiliados), licença **Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)**, https://creativecommons.org/licenses/by/4.0/. Repositório: https://github.com/SJTU-YONGFU-RESEARCH-GRP/SPRSound. Cópia da licença em `src/assets/audio/LICENSE-SPRSound-CC-BY-4.0.txt`.

Citação: Zhang Q. et al. SPRSound: Open-Source SJTU Paediatric Respiratory Sound Database. *IEEE Transactions on Biomedical Circuits and Systems*, 2022.

Modificações feitas em cada trecho: corte do intervalo indicado na ficha, remoção do nível DC, rampas de 30 ms no início e no fim, ganho único (sem filtragem nem compressão) e regravação do cabeçalho WAV (o original declara `nBlockAlign` incorreto). Os rótulos clínicos foram mantidos exatamente como no acervo; a interface mostra o rótulo original ao lado do termo em português.

| Trecho | Rótulo original | SHA-256 original | Intervalo (s) |
|---|---|---|---|
| normal-1 | Normal | 70b626e6a3b031e9d2432b9bf7bd876cf55d71b1cd4a877c5243baee60430f97 | 0,8–6,3 |
| normal-2 | Normal | d739161f3c2f4a238e723dd3e14e8250d765dfafff6a31f3f145c675eb6258e8 | 0,1–8,8 |
| sibilo-1 | Wheeze | 965dc3d5330c17e6861f08803bd75887e4a4a889886abb5da7230099c4177ef5 | 1,5–8,2 |
| sibilo-2 | Wheeze | 5dd4dc0a92d03fbbd3f322cd7b1f5ae731a5a1c40230fca6a660db1aef3fd6ec | 0,8–8,6 |
| ronco-1 | Rhonchi | 3ec1d702a39a3892606555723d01e497f46376ca401e63eae079e3b5fa4215ec | 3–14,2 |
| ronco-2 | Rhonchi | 92b87fd4d85316f4ec71bfe3f20c7f49900f00f8756c2ff28a7cc4c12e1ca7ce | 2,4–8,4 |
| fino-1 | Fine Crackle | 899eb80ed88c55c2c5b9411f9f2afabed5135b6e438e572aa5e75bc17f81e1a8 | 4,6–15,36 |
| fino-2 | Fine Crackle | 812d6a0e895e4da5d1129ae50a7c3dccefffee9455b7f74dc43c231ba5cc59ba | 5,4–9,8 |
| grosso-1 | Coarse Crackle | 140df5f85a4753a57389aef395149a542ec1e28f369ba4e989f53e2dfdc9e1cb | 3,4–7,7 |
| grosso-2 | Coarse Crackle | b18266c3edb2cd252375bdefa6ee3a13c375e11eddbb1b4f4026a371df7aa75b | 6,3–8,6 |

Dados de paciente, identificadores originais, idade e sexo foram omitidos da publicação. A rastreabilidade técnica usa hashes de origem e identificadores locais de trechos.

A licença CC BY 4.0 permite pesquisa, uso didático local e redistribuição pública, inclusive de versões modificadas, com atribuição, link para a licença e indicação das modificações. As fichas completas, com o SHA-256 de cada arquivo original, estão em `src/assets/audio/clips.json` e são exibidas na própria aula.

## Sons sintetizados

Laboratório do ciclo, sons normais esquemáticos, posição dos estertores, atrito, sons de percussão e vogal da ressonância vocal são sintetizados no navegador por este projeto (`src/core/synth.js`) e identificados na tela como "som sintetizado esquemático". Não são registros clínicos.

No laboratório, a opção **Sibilos** utiliza um trecho de `P04_sibilos.mp3`, fornecido por Prof. João Frederico Musial e informado por ele como áudio próprio sintetizado, com autorização para uso na aula. O trecho de 2,35–3,75 s é convertido para mono/16 kHz, recebe rampas de 10 ms e ganho constante, sem mudança de velocidade ou altura. É inserido na expiração do ciclo esquemático de 5 s. A forma de onda e o espectrograma são calculados sobre o sinal efetivamente reproduzido; as curvas de volume, fluxo e pressão permanecem modelos ilustrativos. Os hashes, intervalo e processamento constam de `src/assets/audio-lab/sibilos-autor.json`. Os direitos sobre esse áudio próprio são reservados ao autor. As gravações clínicas SPRSound e suas licenças permanecem inalteradas.

## Ilustrações

Ilustrações do professor, convertidas para WebP com recorte e ajuste de transparência (sem outras alterações): tórax posterior, tórax lateral direito, expansibilidade, frêmito, ausculta posterior e axilar, tórax normal, em tonel, pectus excavatum e carinatum, dedo normal e baqueteamento. Produzidas pelo autor com ferramenta de geração de imagem e revisadas por ele.

Não usadas por erro semiotécnico identificado na auditoria: percussão (posição dos dedos) e as duas imagens do sinal de Schamroth. Foram substituídas por desenhos vetoriais feitos para esta aula.

Desenhados em código para esta aula: tórax frontal esquemático, anatomia de superfície (três vistas), mãos da expansibilidade, esquema do frêmito, técnica de percussão, mapas de percussão e ausculta anterior, ângulo de Lovibond, sinal de Schamroth, cortes axiais das formas do tórax, padrões respiratórios.

## Código e fontes de terceiros

| Componente | Versão | Licença |
|---|---|---|
| reveal.js | 5.2.1 | MIT |
| Vite | 5.4.11 | MIT (só build) |
| vite-plugin-singlefile | 2.0.3 | MIT (só build) |
| Inter | | SIL OFL 1.1 |
| IBM Plex Mono | | SIL OFL 1.1 |

## Referências bibliográficas do conteúdo

- PORTO, C. C.; PORTO, A. L. *Semiologia médica*. 8. ed. Rio de Janeiro: Guanabara Koogan, 2019.
- SWARTZ, M. H. *Tratado de semiologia médica*. 7. ed. Rio de Janeiro: Elsevier, 2015.
- PASTERKAMP, H. et al. Towards the standardisation of lung sound nomenclature. *European Respiratory Journal*, v. 47, n. 3, p. 724-732, 2016.
- ZHANG, Q. et al. SPRSound: open-source SJTU paediatric respiratory sound database. *IEEE Transactions on Biomedical Circuits and Systems*, 2022.



## Atualização 1.2.0 — 28/10/2026

Consolidação da atividade de artefatos da versão 1.1.0 fornecida pelo professor com os ajustes previamente publicados: tema claro/escuro, aviso autoral acessível, ligação com a aula cardiovascular, proteção dos dados do acervo SPRSound e sibilos do autor. Total: 27 telas.

A opção Estridor utiliza agora Estridor.mp3, enviado pelo professor, integral e sem alteração do arquivo, da velocidade ou da altura. A reprodução decodifica o MP3 no navegador e usa a média dos canais para mono em memória, na taxa do contexto de áudio. Não se atribui a esse arquivo a licença SPRSound nem autoria original não informada. Hash e procedência: src/assets/audio-lab/estridor-professor.json.

O estridor está no laboratório e na tela de sons contínuos. No laboratório, as fases e variáveis fisiológicas não são apresentadas como se fossem medidas da gravação: o traçado sonoro corresponde ao arquivo integral, enquanto os controles de fase, ponto e velocidade ficam desabilitados para essa opção. As outras opções mantêm o modelo didático.

A atividade de pele/roupa permanece uma síntese didática. A regularidade dos eventos é uma convenção do modelo; não constitui critério diagnóstico absoluto.

## Substituição dos sibilos — 1.2.1 (28/10/2026)

No laboratório do ciclo respiratório, o trecho anterior de P04_sibilos.mp3 foi substituído pelo novo sibilo.mp3 fornecido pelo professor. O MP3 original é preservado sem alteração em src/assets/audio-lab/sibilo-professor.mp3. SHA-256: f752ff98d12e44556dd0c56131173d7b12efa71e7fd868a8f943b72f938599c1.

O navegador decodifica em 16 kHz, faz a média dos canais para mono e seleciona uma janela contínua de 1,4 s de maior energia, com rampas de 10 ms nas bordas. Não há aceleração nem mudança de altura. A seleção é acústica, não uma anotação clínica de fases; a janela é inserida na expiração do modelo didático. O intervalo utilizado é exibido na tela e os gráficos correspondem ao sinal final reproduzido. O arquivo não é apresentado como sintetizado nem recebe licença SPRSound. Sua autoria original e natureza clínica/sintética não foram informadas; identificação limitada a arquivo fornecido pelo professor. Os trechos da biblioteca SPRSound permanecem inalterados.