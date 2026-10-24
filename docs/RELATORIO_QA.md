# Relatório de QA: versão 1.0.0

Testes automatizados com Playwright e Chromium (motor do Chrome e do Edge), em 24/10/2026. Scripts em `sandbox/`.

## Resultados

| Verificação | Resultado |
|---|---|
| 26 telas em modo apresentação a 1600 × 900, 1920 × 1080, 1366 × 768 e 1024 × 768 | zero erros no console; nenhum elemento ultrapassa a borda do quadro (verificação automática por tela) |
| Modo estudo a 390 × 844 (celular em pé), 844 × 390 (celular deitado) e 1280 × 800 | sem rolagem horizontal da página; a matriz das síndromes rola lateralmente dentro do próprio quadro no celular |
| Laboratório do ciclo | troca de ponto e de achado, reprodução, passo por fase, som em 1×, camada de pressão pleural: sem erro; eventos e cursor alinhados ao traçado |
| Mecânica ventilatória | quatro condições; pressão pleural direita vai a zero no pneumotórax |
| Percussão | condições, pontos posterior e anterior, comparação entre lados no mesmo nível |
| Mapa de ausculta | exercício: erro ao começar fora do ápice, sequência completa aceita com mensagem final |
| Gravações | carregamento dos 10 trechos, espectrograma desenhado, comparação em sequência com cursor, ficha de procedência |
| Escute e identifique | resposta, retorno explicativo e espectrograma após a resposta |
| Síndromes | três modos; filtro "maciça + frêmito diminuído" deixa derrame e atelectasia, com a dica da traqueia; exercício com retorno |
| Padrões respiratórios | seis padrões; exercício de 30 s com conferência da contagem |
| Ressonância vocal | vogal sintetizada carregada ao abrir; filtros e espectrograma do resultado |
| Descritor e registro | frases montadas; avisos de incoerência aparecem nas combinações previstas |
| Arquivo offline por `file://` | todas as imagens e gravações embutidas (data URI) carregadas; nenhuma requisição externa; contexto seguro (microfone permitido) |
| Site em subdiretório (`/semiologia/`) | 26 telas, gravação tocada e espectrograma desenhado; nenhuma requisição externa |
| Desempenho | 60 quadros por segundo na capa, mecânica, laboratório em reprodução, padrões, frêmito e gravação |
| Áudio sem gesto | nenhum som ao carregar; o contexto de áudio só nasce no clique; um som por vez |
| Peso | site 2,6 MB (JavaScript 373 kB, CSS 129 kB, gravações 1,1 MB, imagens 0,9 MB); arquivo offline 3,3 MB |

## Corrigido durante o QA

Regras responsivas aplicadas ao modo apresentação em telas de até 1100 px (projetor 1024 × 768): passaram a valer só no modo estudo. Componentes sem altura no modo estudo e no celular (anatomia, laboratório, percussão, mapa de ausculta, mecânica). Sobreposição de rótulos no desenho da técnica de percussão. Retorno do exercício de contagem apagado logo após aparecer. Legenda sem cor na anatomia de superfície. Concordância de número no descritor ("atrito difuso"). Desenhos refeitos: mãos da expansibilidade, ângulo de Lovibond, sinal de Schamroth. Espectrograma do murmúrio esquemático com filtro mais íngreme, para concentrar a energia nas frequências baixas.

## Não testado nesta fase

Firefox e Safari (motores não disponíveis no ambiente de teste), saída real de áudio em alto-falante e projetor, microfone real, toque em aparelhos físicos, leitores de tela, contraste no projetor da sala. Recomendado conferir na sala: Chrome ou Edge, tela cheia (F), volume do sistema, permissão do microfone.

## Limitações conhecidas

As gravações são pediátricas e limitadas a cerca de 800 Hz pelo aparelho do acervo; a interface informa idade e ponto de cada uma. Os sons esquemáticos ensinam o momento do som no ciclo, não o timbre. Os filtros da ressonância vocal são aproximações. No celular, os traçados do laboratório ficam pequenos; o modo estudo em computador ou tablet é o mais confortável para essa tela.

