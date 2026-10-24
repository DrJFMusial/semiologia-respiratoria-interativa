# Relatório técnico-pedagógico: versão 1.0.0

Semiologia Respiratória Interativa · E2M08 · 2026/2 · Prof. João Frederico Musial
Data: 24/10/2026

## 1. Síntese

A aula está completa: 26 telas, 15 componentes interativos próprios e 10 gravações clínicas licenciadas, sobre o núcleo técnico e visual da aula cardiovascular (modos apresentação e estudo, barra, menu, notas, pausa global, um som por vez, nada sem clique). A sequência segue o esboço aprovado, na ordem inspeção, palpação, percussão e ausculta, e termina na integração das síndromes e no registro. Nada foi publicado.

## 2. Sequência e tempo

| # | Tela | Seção | Componente | min |
|---|---|---|---|---|
| 1 | Capa | Abertura | tórax que respira com curva de volume | 1 |
| 2 | Roteiro do exame do tórax | Abertura | revelação das quatro técnicas | 2 |
| 3 | Caso condutor (Caso didático) | Abertura | texto | 2 |
| 4 | Anatomia de superfície | Bases | três vistas, seis camadas, fichas por estrutura | 2 |
| 5 | Mecânica ventilatória | Bases | pressões alveolar e pleural; pneumotórax, derrame, obstrução | 3* |
| 6 | Laboratório do ciclo respiratório | Bases | tórax, fase, volume, fluxo, pressão pleural, som e espectrograma | 4 |
| 7 | Sintomas respiratórios | Anamnese | revelação por sintoma | 2* |
| 8 | Forma do tórax | Inspeção | ilustrações, comparação lado a lado, corte axial | 2 |
| 9 | Baqueteamento digital | Inspeção | ilustrações, ângulo de Lovibond e sinal de Schamroth em vetor | 1 |
| 10 | Padrões respiratórios | Inspeção | seis padrões e exercício de contagem | 3 |
| 11 | Expansibilidade | Palpação | ilustração e mãos animadas: simétrica, unilateral, bilateral | 2 |
| 12 | Frêmito toracovocal | Palpação | caminho da vibração em seis situações | 2 |
| 13 | Percussão | Percussão | técnica em vetor e mapa posterior e anterior com cinco sons | 3 |
| 14 | Técnica e sequência da ausculta | Ausculta | mapa de pontos com exercício (posterior, lateral, anterior) | 2 |
| 15 | Sons normais | Ausculta | três sons esquemáticos e murmúrio gravado | 3 |
| 16 | Sibilos e roncos | Ausculta | gravações com espectrograma e comparação | 3 |
| 17 | Estertores finos e grossos | Ausculta | gravações com espectrograma e comparação | 3 |
| 18 | Atrito pleural e estridor | Ausculta | quadro comparativo e esquemas | 1 |
| 19 | Ressonância vocal | Ausculta | voz gravada no navegador ou vogal sintetizada, com filtros | 2 |
| 20 | Escute e identifique | Fixação | cinco gravações sorteadas, espectrograma após a resposta | 3 |
| 21 | Síndromes pleuropulmonares | Integração | matriz em três modos: explorar, do achado à síndrome, exercício | 4 |
| 22 | Como descrever um ruído adventício | Registro | descritor com avisos de coerência | 2 |
| 23 | Registro no prontuário | Registro | construtor com avisos de coerência entre técnicas | 2 |
| 24 | Checklist da estação | Fechamento | caixas sem armazenamento | 1 |
| 25 | Para levar | Fechamento | texto | 1 |
| 26 | Referências e créditos | Fechamento | créditos gerados das fichas | 0 |

Total: 56 min. *Mecânica e sintomas podem ficar para o estudo: 51 min. O tempo está nas notas de cada tela.

## 3. O que há de novo em relação à aula cardiovascular

**Gravações clínicas.** Leitor de WAV próprio (sem reamostragem), tocador com laço, cursor sincronizado, comparação em sequência e ficha de procedência com licença, modificações e SHA-256 do original. O rótulo do acervo aparece sempre ao lado do termo em português.

**Espectrograma.** FFT própria, janela de Hann de 32 ms, passo de 4 ms, faixa de 0 a 1 kHz para gravações (o acervo não tem energia acima de 800 Hz) e 0 a 1,5 kHz no laboratório. Escala sequencial clara para escura, legível no projetor. Os eventos anotados pelo acervo aparecem como faixas coloridas: violeta para sons contínuos, telha para descontínuos.

**Síntese esquemática.** Ciclo respiratório com inspiração senoidal e expiração passiva; murmúrio, som traqueal, som brônquico, estertores (onduletas curtas de frequência e duração diferentes para finos e grossos), sibilos, roncos, estridor e atrito, todos com o envelope do fluxo; sons de percussão por ressonância excitada; vogal por formantes. Tudo rotulado como esquemático.

**Tórax frontal paramétrico.** Um único desenho com estados de pneumotórax, derrame, consolidação, atelectasia e hiperinsuflação, usado na capa, no laboratório, na mecânica e na matriz.

**Ressonância vocal com a voz do aluno.** Grava 3 s pelo microfone (na memória da página, nada é enviado) ou usa uma vogal sintetizada; quatro filtros aproximados mostram o sentido do achado (abafado, nítido, anasalado, ausente) com o espectrograma do resultado. Resolve a falta da gravação do professor prevista no esboço e permite que cada aluno ouça a própria voz.

## 4. Decisões tomadas sem consulta (revisáveis)

1. Caso condutor: consolidação na base direita (Caso didático sem identificação), conforme proposto no esboço, porque não havia material anterior.
2. Ilustrações com erro semiotécnico não foram usadas: percussão (substituída por desenho vetorial) e as duas do sinal de Schamroth (substituídas por esquema vetorial). O arquivo `02_R2` (ausculta posterior com toalha) foi substituído por `torax_lateral.png`.
3. Estridor e atrito pleural sem gravação clínica: tela própria com quadro comparativo e esquemas sintetizados, sinalizados como "gravação clínica pendente". Os candidatos de estridor do SPRSound não foram usados, conforme a auditoria.
4. Gravações complementares de adultos (HF_Lung_V1, KAUH) e do manequim (HLS-CMDS) não foram baixadas: não houve aprovação explícita dessas bases.
5. Tela de mecânica ventilatória acrescentada (não estava no esboço) porque a mecânica foi listada como prioridade; ela antecipa os achados de pneumotórax, derrame e obstrução.
6. Tela de baqueteamento separada da forma do tórax, e matriz das síndromes com seis linhas (acrescentado o broncoespasmo).
7. Frequência respiratória normal no adulto apresentada como 12 a 20 irpm.

## 5. Arquitetura

Vite 5, reveal.js 5, JavaScript puro, SVG, Canvas e Web Audio. As regras responsivas valem só no modo estudo, para que projetores de 1024 × 768 e tablets em modo apresentação mantenham a composição de 1600 × 900 escalada. Pacotes: site estático (`dist/`, 2,6 MB) e arquivo único offline (`dist-offline/index.html`, 3,3 MB).

## 6. Pendências do professor

1. **Ouvir as gravações em sala** (caixas da sala e projetor) e confirmar cada trecho; o grosso-2 tem um transiente perto de 7,2 s do original que pode ser artefato de contato.
2. **Conferir no Porto** os valores e as descrições que a aula afirma: frequência respiratória normal (12 a 20 irpm), limites de pulmão e pleura (6ª, 8ª e 10ª costelas; T10 e T12), fissuras, ângulo de Lovibond (cerca de 160° e 180° ou mais), comportamento de estertores e atrito com a tosse, descrição de egofonia ("i" ouvido como "ê") e as células da matriz das síndromes. A proposta de nomenclatura de Pasterkamp e colaboradores (2016) está citada, mas o texto completo não foi lido.
3. Decidir sobre gravações de estridor, atrito pleural, som traqueal e brônquico e exemplos adultos: HF_Lung_V1 e KAUH (CC BY 4.0), manequim HLS-CMDS (verificar direitos do fabricante) ou gravação própria com estetoscópio digital.
4. Testar o microfone na sala (permissão do navegador; volume moderado para evitar microfonia).
5. Autorizar e nomear o repositório antes de qualquer publicação.

## 7. Resumo

A aula cobre o exame completo do tórax em 26 telas, com 15 componentes interativos, 10 gravações clínicas rastreáveis e espectrograma em todas elas. Os simuladores explicam o mecanismo de cada achado (ar, líquido ou sólido entre o pulmão e a mão ou o ouvido) e a matriz final obriga a pensar no conjunto, não no sinal isolado. As lacunas de gravação (estridor, atrito, adultos) estão marcadas na própria tela e dependem de decisão sobre as bases complementares.

