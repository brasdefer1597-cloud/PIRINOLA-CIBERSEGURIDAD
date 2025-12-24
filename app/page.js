'use client';

import { useState, useEffect } from 'react';
import { FACES } from '../constants/faces'; // Importamos la definición
import Pirinola3D from '../components/Pirinola3D'; // Componente 3D (Placeholer o Real)

export default function ChalamandraDecode() {
  const [gameState, setGameState] = useState('IDLE'); // IDLE, SPINNING, RESULT
  const [outcome, setOutcome] = useState(null);
  const [history, setHistory] = useState([]);

  // --- ALGORITMO DE DECISIÓN (Weighted Random) ---
  const spinLogic = () => {
    // Convertir objeto FACES a array
    const options = Object.values(FACES);

    // Filtrar repetición inmediata (Mejora UX)
    const candidates = history.length > 0
      ? options.filter(opt => opt.id !== history[0].id)
      : options;

    const totalWeight = candidates.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    let selected = candidates[0];
    for (let item of candidates) {
      if (random < item.weight) {
        selected = item;
        break;
      }
      random -= item.weight;
    }
    return selected;
  };

  const handleSpin = () => {
    if (gameState === 'SPINNING') return;

    setGameState('SPINNING');
    setOutcome(null);

    // Simular tiempo de giro (o esperar evento del componente 3D)
    setTimeout(() => {
      const result = spinLogic();
      setOutcome(result);
      setHistory([result, ...history].slice(0, 5)); // Guardar últimos 5
      setGameState('RESULT');
    }, 2500); // 2.5s de suspenso
  };

  const resetGame = () => {
    setGameState('IDLE');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0E2A24] text-[#F6F2EA] font-sans overflow-hidden relative">

      {/* FONDO: Partículas o Gradiente */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a4d40_0%,_#0E2A24_70%)] z-0" />

      {/* HEADER */}
      <header className="z-10 text-center mb-8">
        <h1 className="text-2xl tracking-[0.2em] text-[#C9A44C] font-serif">CHALAMANDRA OS</h1>
        <p className="text-xs opacity-60 mt-2 tracking-widest">WINTER DECODE EVENT</p>
      </header>

      {/* VIEWPORT 3D (La Pirinola) */}
      <div className="z-10 w-64 h-64 mb-8 cursor-pointer relative" onClick={handleSpin}>
         {/* Aquí iría <Canvas> de React Three Fiber */}
         <Pirinola3D isSpinning={gameState === 'SPINNING'} targetFace={outcome?.id} />
      </div>

      {/* CONTROLES / RESULTADOS */}
      <div className="z-20 w-full max-w-md px-6 text-center">

        {/* ESTADO: IDLE (Esperando) */}
        {gameState === 'IDLE' && (
          <div className="animate-fade-in">
            <button
              onClick={handleSpin}
              className="border border-[#C9A44C] text-[#C9A44C] hover:bg-[#C9A44C] hover:text-[#0E2A24] px-8 py-3 tracking-widest uppercase transition-all duration-300 text-sm font-medium"
            >
              Girar y Decodificar
            </button>
            <p className="text-xs mt-4 opacity-50 italic">"La red gira aunque tú no mires"</p>
          </div>
        )}

        {/* ESTADO: SPINNING (Girando) */}
        {gameState === 'SPINNING' && (
          <div className="text-[#C9A44C] text-sm tracking-widest animate-pulse">
            DECODIFICANDO PATRONES...
          </div>
        )}

        {/* ESTADO: RESULT (Resultado) */}
        {gameState === 'RESULT' && outcome && (
          <div className="bg-[#0E2A24]/90 backdrop-blur-md border-t-2 border-[#C9A44C] p-6 shadow-2xl animate-slide-up text-left">
            <span className="text-xs font-bold tracking-widest opacity-50 block mb-2">EVENTO_DETECTADO</span>

            <h2 className="text-2xl font-serif text-[#C9A44C] mb-2">{outcome.title}</h2>
            <p className="text-sm leading-relaxed opacity-90 mb-4">{outcome.message}</p>

            <div className="bg-black/20 p-3 mb-4 text-xs italic border-l-2 border-[#C9A44C]/30">
              💡 {outcome.lesson}
            </div>

            <button
              className="text-[#F6F2EA] text-sm underline underline-offset-4 hover:text-[#C9A44C] transition-colors"
              onClick={() => console.log('Action triggered:', outcome.cta)}
            >
              {outcome.cta} &gt;
            </button>

            <div className="mt-6 text-center">
               <button onClick={resetGame} className="text-xs opacity-40 hover:opacity-100 uppercase tracking-widest">
                 Girar otra vez
               </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
