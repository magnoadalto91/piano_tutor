# Sistema de Estudo de Teclado Musical — Piano Tutor App

## Contexto
Estou aprendendo teclado (possuo um Casio CT-S300 com saída USB-MIDI) e preciso de uma webapp educativa que me ajude a:
1. Entender figuras musicais (semibreve, mínima, semínima, colcheia, etc.)
2. Identificar notas na partitura e onde tocá-las no teclado
3. Praticar tocando no teclado físico com feedback em tempo real

---

## Stack Técnica
- **Frontend:** React (Vite) + TypeScript
- **Partituras:** VexFlow (renderização) + suporte a MusicXML via xml2abc ou similar
- **Áudio:** Tone.js (playback e metrônomo)
- **MIDI:** Web MIDI API nativa (Chrome) para conectar o CT-S300 via USB
- **Estilo:** Tailwind CSS
- **Sem backend** — tudo client-side
- **Deploy no Vercel** (plano Hobby, gratuito)
- **Banco de dados:** Neon (gratuito)
- **Storage de imagens:** Cloudinary (plano Free)
  - Imagens convertidas para WebP no frontend antes do upload (max 1280px, qualidade 0.82)
  - Deleção automática do Cloudinary ao remover foto/imagem

---

## Funcionalidades a Implementar

### 1. Teclado Visual Interativo
- Renderizar um teclado de piano (mínimo 4 oitavas, C3 a C7) na tela
- Teclas acendem ao passar o mouse (hover) mostrando o nome da nota (C4, D#4, etc.)
- Teclas acendem em verde quando tocadas corretamente via MIDI
- Teclas acendem em vermelho quando tocadas incorretamente
- Teclas acendem em amarelo para indicar "toque esta nota agora"

### 2. Dicionário de Figuras Musicais
- Painel educativo com cada figura: semibreve (4 tempos), mínima (2), semínima (1), colcheia (½), semicolcheia (¼)
- Animação visual mostrando a duração relativa de cada figura (barra de tempo animada)
- Ao clicar em uma figura, tocar o som correspondente via Tone.js com a duração exata
- Mostrar também pausas (silêncios) equivalentes

### 3. Leitor de Partitura Básico
- Renderizar partituras simples usando VexFlow diretamente no código (não precisa importar arquivo externo ainda)
- Incluir ao menos 3 exercícios pré-definidos de dificuldade crescente (ex: Dó Maior com semínimas, depois mínimas, depois misturado)
- Destacar a nota atual sendo praticada com um marcador visual
- Mostrar nome da nota + dedo sugerido (1=polegar ... 5=mínimo) acima de cada nota

### 4. Modo Prática com MIDI
- Ao conectar o CT-S300 (Web MIDI API), detectar automaticamente o dispositivo
- Modo "nota a nota": mostrar uma nota, esperar o usuário tocar, validar e avançar
- Feedback visual imediato (acertou/errou)
- Contador de acertos/erros por sessão
- Opção de repetir nota ou pular

### 5. Metrônomo
- BPM ajustável (40–200)
- Visualização de pulso (círculo que pisca no tempo)
- Opção ligar/desligar som do click
- Indicar compasso (4/4, 3/4, 2/4)

---

## Estrutura de Arquivos Esperada
piano-tutor/
├── src/
│   ├── components/
│   │   ├── PianoKeyboard.tsx      # Teclado visual
│   │   ├── SheetMusic.tsx         # Partitura com VexFlow
│   │   ├── NoteGuide.tsx          # Dicionário de figuras
│   │   ├── Metronome.tsx          # Metrônomo
│   │   └── MidiStatus.tsx         # Status conexão MIDI
│   ├── hooks/
│   │   ├── useMidi.ts             # Hook Web MIDI API
│   │   └── useMetronome.ts        # Hook Tone.js metrônomo
│   ├── data/
│   │   └── exercises.ts           # Exercícios pré-definidos
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── index.html

---

## Detalhes Importantes

**Web MIDI:**
- Usar `navigator.requestMIDIAccess()` com `{ sysex: false }`
- Tratar o caso em que o browser não suporta MIDI (mostrar mensagem amigável)
- O CT-S300 aparece como dispositivo MIDI padrão via USB
- Nota MIDI 60 = C4 (Dó central)

**VexFlow:**
- Usar `@coderline/vexflow` versão mais recente
- Renderizar em SVG (não Canvas) para melhor controle de CSS
- Destacar nota ativa adicionando classe CSS ao elemento SVG

**Tone.js:**
- Usar `Tone.Sampler` com samples de piano (ou `Tone.Synth` se samples não disponíveis)
- Metrônomo com `Tone.Transport` e `Tone.Loop`

**UX/Acessibilidade:**
- Interface em Português (pt-BR)
- Responsivo (funcionar em tablet também)
- Tema escuro por padrão (menos cansativo para praticar)
- Atalhos de teclado: Espaço = play/pause metrônomo, R = repetir nota atual

---

## Ordem de Desenvolvimento Sugerida
1. Scaffold do projeto com Vite + React + Tailwind
2. Componente PianoKeyboard funcional com hover
3. Hook useMidi + integração com PianoKeyboard
4. Dicionário de figuras musicais (NoteGuide)
5. Metrônomo funcional
6. Partitura básica com VexFlow + 3 exercícios
7. Modo prática com validação MIDI
8. Polimento de UI e responsividade

---

## Critério de Sucesso
O app deve permitir que eu abra no Chrome, conecte o CT-S300 via USB, selecione um exercício, e pratique tocando nota a nota com feedback visual imediato — sem precisar de nenhum conhecimento prévio de teoria para começar a usar.