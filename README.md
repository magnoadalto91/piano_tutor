Piano Tutor

Webapp de estudo de teclado musical. Conecta o teclado físico pela porta USB-MIDI e dá retorno em tempo real do que está sendo tocado, com dicionário de figuras rítmicas, leitor de partitura e metrônomo. Desenvolvido para um Casio CT-S300, mas funciona com qualquer teclado MIDI.

Stack

Frontend: React 18, Vite 5, TypeScript Partitura: VexFlow 4, renderizado em SVG Áudio: Tone.js MIDI: Web MIDI API nativa (requer Chrome ou navegador com suporte) Estilo: Tailwind CSS 3 Deploy: Vercel

Não há backend: tudo roda no cliente.

Funcionalidades
Teclado visual interativo. Quatro oitavas (C3 a C7). A tecla acende ao passar o mouse mostrando o nome da nota, em verde quando tocada corretamente, em vermelho quando errada e em amarelo para indicar a próxima nota.
Dicionário de figuras musicais. Semibreve, mínima, semínima, colcheia e semicolcheia, com animação da duração relativa e o som correspondente ao clicar. Inclui as pausas equivalentes.
Leitor de partitura. Exercícios de dificuldade crescente renderizados com VexFlow, com marcador na nota atual, nome da nota e dedo sugerido.
Modo prática com MIDI. Detecta o teclado automaticamente, mostra uma nota, espera a execução, valida e avança. Contador de acertos e erros por sessão, com opção de repetir ou pular.
Metrônomo. BPM de 40 a 200, pulso visual, som opcional e indicação de compasso (4/4, 3/4, 2/4).
Como rodar
bash
npm install
npm run dev

Abra no Chrome e conecte o teclado por USB antes de entrar no modo prática. A nota MIDI 60 corresponde ao dó central (C4). Se o navegador não suportar Web MIDI, a aplicação avisa e as demais funções continuam disponíveis.

Estrutura
src/components/PianoKeyboard.tsx   teclado visual
src/components/SheetMusic.tsx      partitura com VexFlow
src/components/NoteGuide.tsx       dicionário de figuras
src/components/Metronome.tsx       metrônomo
src/components/MidiStatus.tsx      status da conexão MIDI
src/hooks/useMidi.ts               acesso à Web MIDI API
src/hooks/useMetronome.ts          metrônomo com Tone.Transport
src/data/exercises.ts              exercícios pré-definidos
Notas de implementação
A interface é em português e o tema escuro é o padrão, por ser menos cansativo durante a prática
A partitura é renderizada em SVG para permitir destacar a nota ativa por classe CSS
Responsivo, funciona em tablet
