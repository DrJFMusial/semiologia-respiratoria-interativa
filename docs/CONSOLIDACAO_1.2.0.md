# Consolidação da aula respiratória — 1.2.0

## Comparação e decisões

Fonte da revisão recebida: ZIP 1.1.0 ao lado do HTML offline indicado pelo professor. Base da publicação: commit 9640b8eca6cac92638d0ab7c83e4bbcea11f9ebc do repositório público.

A contribuição funcional nova incorporada é a tela de artefatos (comparação pele/roupa e desafio). O pacote recebido também tinha diferenças que revertiam melhorias posteriores da publicação: tema, autoria, áudio de sibilos e minimização dos dados do SPRSound. Essas reversões não foram incorporadas. Os demais conteúdos foram preservados a partir da publicação.

## Estridor

Arquivo fornecido pelo professor, integral (aproximadamente 17,2 s no navegador de teste); hash na ficha ao lado do MP3. Sem filtragem, normalização, corte ou mudança de velocidade no arquivo. Decodificação e redução de canais para mono acontecem em memória. A origem clínica, autoria original e licença específica não foram informadas; identificação pública limitada a arquivo selecionado pelo professor. Não é rotulado como áudio sintetizado nem como trecho SPRSound.

O sintetizador antigo de estridor foi removido do caminho de reprodução. A opção no laboratório carrega o arquivo e mostra sua forma de onda/espectrograma. Os controles que poderiam sugerir demarcações fisiológicas inexistentes são desabilitados. Não existe fallback silencioso para o tom antigo.

## Verificações

- Testes Node dos sibilos: quatro aprovados após a extensão do sintetizador para o módulo de artefatos.
- Compilação Vite para site e arquivo único offline aprovada.
- Navegador: 27 telas; estridor carregado no laboratório, sem fases artificiais; reprodução habilitada; botão na tela de contínuos toca e informa 17,2 s.
- Navegador: atividade de artefatos, desafio inicialmente bloqueado para conferir; responder libera repetição sobre a pele, com retorno explicativo.
- Layout das telas de contínuos e artefatos conferido em 1600 × 900.
- Tema e aviso autoral da publicação anterior preservados no código.

A escuta humana, o projetor físico, todos os navegadores e a auditoria clínica integral não foram realizados nesta revisão. Os relatórios anteriores são históricos e não significam repetição integral de suas baterias.

## Referências para os ajustes pedagógicos

- Artigo Transmission of lung sounds through light clothing: https://pubmed.ncbi.nlm.nih.gov/17202806/ — artefatos e limitações da ausculta sobre roupa; o filtro desta atividade é apenas ilustrativo.
- Fundamentals of Lung Auscultation (NEJM, 2014): https://doi.org/10.1056/NEJMra1302901 — estridor geralmente inspiratório, mas pode ser bifásico ou expiratório.