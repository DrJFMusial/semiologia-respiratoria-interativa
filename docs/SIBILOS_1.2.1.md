# Atualização 1.2.1 — novo áudio de sibilos

No laboratório do ciclo (slide 6), a opção Sibilos usa o novo sibilo.mp3 fornecido pelo professor. O arquivo original de aproximadamente 10,1 s permanece preservado byte a byte em src/assets/audio-lab/sibilo-professor.mp3. Nesta versão, o modelo usa aproximadamente 1,32–2,72 s, janela contínua de maior energia, com rampas de 10 ms nas bordas. Decodificação em 16 kHz e média dos canais para mono, sem mudança de velocidade ou altura. Nenhuma fase clínica é inferida do MP3: a inserção expiratoria pertence ao modelo didático.

SHA-256 original: f752ff98d12e44556dd0c56131173d7b12efa71e7fd868a8f943b72f938599c1.

Verificação: seis testes Node aprovados (síntese/inserção e seleção do trecho); builds online e offline aprovados; arquivo carregado e reprodução habilitada no navegador, com intervalo mostrado e sem erros de console. Não houve escuta clínica independente. As gravações SPRSound e as outras opções do laboratório permanecem na versão já publicada.

Abra AULA_OFFLINE_Semiologia_Respiratoria_v1.2.1.html com duplo clique. A pasta licencas acompanha os links de créditos. Site: https://drjfmusial.github.io/semiologia-respiratoria-interativa/