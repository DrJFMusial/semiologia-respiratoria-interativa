/**
 * Roteiro do exame do tórax: quatro técnicas, cada uma com a pergunta que
 * responde. No modo apresentação o professor revela uma técnica por vez;
 * no modo estudo todas ficam abertas.
 */
const ETAPAS = [
  {
    id: 'inspecao', n: 1, nome: 'Inspeção', verbo: 'Olhar',
    pergunta: 'Qual a forma do tórax? Como o paciente respira: frequência, ritmo, amplitude, esforço?',
    como: 'Tórax exposto, paciente sentado; olhar de frente, de costas e de perfil, e contar a frequência sem avisar.',
    peso: 'alto',
  },
  {
    id: 'palpacao', n: 2, nome: 'Palpação', verbo: 'Sentir',
    pergunta: 'Os dois lados se expandem igual? A voz vibra na parede igual dos dois lados?',
    como: 'Mãos espalmadas nas bases e nos ápices (expansibilidade); face palmar ou borda ulnar em pontos simétricos enquanto o paciente diz "trinta e três" (frêmito).',
    peso: 'alto',
  },
  {
    id: 'percussao', n: 3, nome: 'Percussão', verbo: 'Percutir',
    pergunta: 'O som é claro pulmonar, maciço ou hipersonoro? Em que ponto ele muda?',
    como: 'Percussão dígito-digital, de cima para baixo, comparando sempre o mesmo nível dos dois lados.',
    peso: 'alto',
  },
  {
    id: 'ausculta', n: 4, nome: 'Ausculta', verbo: 'Ouvir',
    pergunta: 'O murmúrio está presente e simétrico? Há ruídos adventícios? Como a voz se transmite?',
    como: 'Diafragma sobre a pele, respiração pela boca, um ciclo completo em cada ponto, em zigue-zague entre os lados.',
    peso: 'alto',
  },
];

export function roteiro(node) {
  node.innerHTML = `<ol class="rt-track">${ETAPAS.map((e) => `
    <li class="rt-step" data-id="${e.id}">
      <button type="button" class="rt-head" aria-expanded="false">
        <span class="rt-n">${e.n}</span>
        <span class="rt-name">${e.nome}</span>
        <span class="rt-verb">${e.verbo}</span>
      </button>
      <div class="rt-body">
        <p class="rt-q">${e.pergunta}</p>
        <p class="rt-how">${e.como}</p>
      </div>
    </li>`).join('')}</ol>`;
  const steps = [...node.querySelectorAll('.rt-step')];
  const open = (s, on) => { s.classList.toggle('open', on); s.querySelector('.rt-head').setAttribute('aria-expanded', String(on)); };
  steps.forEach((s) => s.querySelector('.rt-head').addEventListener('click', () => open(s, !s.classList.contains('open'))));
  const sync = () => { if (document.body.classList.contains('modo-estudo')) steps.forEach((s) => open(s, true)); };
  sync();
  return { activate: sync };
}

