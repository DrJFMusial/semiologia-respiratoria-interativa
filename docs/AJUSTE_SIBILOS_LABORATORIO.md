# Sibilos no laboratório do ciclo respiratório

O autor solicitou a substituição do som de sibilos no laboratório pelo arquivo `P04_sibilos.mp3` e informou que o áudio é próprio e sintetizado, autorizando seu uso. A substituição se restringe ao laboratório; a biblioteca clínica SPRSound não foi alterada.

O original de 12,460375 s foi preservado localmente. A distribuição utiliza um trecho de 2,35 a 3,75 s, escolhido para inserção na expiração do modelo de 5 s. Não se comprime a gravação inteira para caber no ciclo. A preparação converte os dois canais para mono, reamostra para 16 kHz, aplica rampas de 10 ms e ganho constante, e exporta WAV PCM de 16 bits. Não há estiramento temporal nem alteração de altura. A ficha `src/assets/audio-lab/sibilos-autor.json` documenta os hashes e o processamento.

O som do autor substitui o tom harmônico antigo no laboratório. O fundo respiratório, o modelo obstrutivo, os demais achados e os pontos de ausculta mantêm o funcionamento existente. A faixa de evento no traçado superior e no painel sonoro termina junto com o trecho efetivamente inserido. O espectrograma dos sibilos usa escala até 2 kHz e é calculado a partir das mesmas amostras usadas na reprodução. Volume, fluxo e pressão são curvas didáticas, não medições obtidas do MP3.

O carregamento é identificado na interface. Em caso de falha, há mensagem explícita e o botão de som fica indisponível para esse achado; não se apresenta o tom antigo como se fosse o arquivo do autor. Trocas rápidas de achado/ponto, pausa global e saída do slide não podem reativar uma reprodução pendente.

O cursor usa o início agendado e o deslocamento do Web Audio, evitando saltar para o fim do ciclo antes do começo do áudio. Os rótulos dos eventos também passam a redefinir seu alinhamento em cada desenho, corrigindo o corte do início da palavra observado no gráfico.

Verificação: `node --test tests/lab-sibilos.test.js` valida o formato, o intervalo expiratório, a duração e a identidade do trecho após descontar o fundo respiratório. A comparação local com a versão anterior confirmou 16 sinais idênticos nos demais usos da síntese. Os testes de interface compararam o buffer reproduzido com o sinal do gráfico em cinco resoluções e nos dois temas, incluindo pausa/retomada e troca de ponto. Também foram testados pausa global, saída do slide e troca de achado durante o carregamento, falha de rede com recuperação e reprodução no pacote offline. Evidências de teste ficam em `evidencias/sibilos/`, fora do repositório público.
