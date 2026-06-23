import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// Interfaces de Tipado
interface Track {
  id: string;
  title: string;
  artist: string;
  addedBy: string;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  type?: 'user' | 'system' | 'admin';
}

export default function App() {
  // --- ESTADOS GLOBALES ---
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Control de rol administrativo
  const [userNickname, setUserNickname] = useState<string>('Invitado_' + Math.floor(Math.random() * 1000));
  
  // --- ESTADOS DEL REPRODUCTOR DE MÚSICA ---
  const [playlist, setPlaylist] = useState<Track[]>([
    { id: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', addedBy: 'System' },
    { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', addedBy: 'System' }
  ]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [songInput, setSongInput] = useState<string>('');

  // --- ESTADOS DEL CHAT ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');

  // --- ESTADOS DEL BINGO (Versión Buena: 1 Solo Cartón) ---
  const [bingoBoard, setBingoBoard] = useState<number[]>([]);
  const [markedNumbers, setMarkedNumbers] = useState<number[]>([]);
  const [lastCalledNumber, setLastCalledNumber] = useState<number | null>(null);
  const [gameHistory, setGameHistory] = useState<number[]>([]);

  // --- EFECTOS INICIALES ---
  useEffect(() => {
    generateSingleBingoBoard();
    sendSystemMessage('Bienvenido a Anita Hub. Sincronización activa.');
  }, []);

  // --- LOGICA DEL REPRODUCTOR (Extractor de IDs de YouTube) ---
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(songInput);
    
    if (!videoId) {
      alert('Por favor, introduce una URL de YouTube válida.');
      return;
    }

    const newTrack: Track = {
      id: videoId,
      title: `Canción Sugerida (${videoId})`, 
      artist: 'YouTube Track',
      addedBy: userNickname
    };

    setPlaylist([...playlist, newTrack]);
    sendSystemMessage(`¡${userNickname} añadió una canción a la cola!`);
    setSongInput('');
  };

  const nextTrack = () => {
    if (playlist.length > 0) {
      setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    }
  };

  // --- LÓGICA DEL BINGO (Un solo tablero por usuario) ---
  const generateSingleBingoBoard = () => {
    const numbers: number[] = [];
    while (numbers.length < 15) {
      const num = Math.floor(Math.random() * 90) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    setBingoBoard(numbers.sort((a, b) => a - b));
    setMarkedNumbers([]);
  };

  const toggleMarkNumber = (num: number) => {
    if (markedNumbers.includes(num)) {
      setMarkedNumbers(markedNumbers.filter(n => n !== num));
    } else {
      setMarkedNumbers([...markedNumbers, num]);
    }
  };

  // --- CONTROLES EXCLUSIVOS DE ADMIN (Bingo) ---
  const handleAdminCallNumber = () => {
    if (!isAdmin) return;
    if (gameHistory.length >= 90) {
      sendSystemMessage('Todos los números han sido cantados.');
      return;
    }

    let num: number;
    do {
      num = Math.floor(Math.random() * 90) + 1;
    } while (gameHistory.includes(num));

    setLastCalledNumber(num);
    setGameHistory([...gameHistory, num]);
    sendSystemMessage(`[BINGO] El Administrador cantó el número: ${num}`, 'admin');
  };

  const handleAdminResetBingo = () => {
    if (!isAdmin) return;
    setLastCalledNumber(null);
    setGameHistory([]);
    generateSingleBingoBoard();
    sendSystemMessage('El Administrador ha reiniciado la partida de Bingo.', 'admin');
  };

  // --- LÓGICA DEL CHAT ---
  const sendSystemMessage = (text: string, type: 'user' | 'system' | 'admin' = 'system') => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(),
      user: type === 'system' ? '⚙️ SISTEMA' : type === 'admin' ? '👑 ADMIN' : userNickname,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleSendUserMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Math.random().toString(),
      user: userNickname,
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: isAdmin ? 'admin' : 'user'
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans flex flex-col selection:bg-purple-600 selection:text-white">
      
      {/* HEADER / BARRA DE ROL */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-black tracking-wider text-purple-500">ANITA HUB</span>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">v3.0 Stable</span>
        </div>
        
        <div className="flex items-center space-x-4 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
          <input 
            type="text" 
            value={userNickname} 
            onChange={(e) => setUserNickname(e.target.value)}
            className="bg-black text-sm border border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500 text-white font-medium"
            placeholder="Tu Nickname"
          />
          <button 
            onClick={() => setIsAdmin(!isAdmin)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isAdmin 
                ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-transparent'
            }`}
          >
            {isAdmin ? 'Modo: Admin Active' : 'Modo: Espectador'}
          </button>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL TRIPLE COLUMNA */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        
        {/* COLUMNA 1: PLAYLIST (3/12 cols) */}
        <section className="lg:col-span-3 bg-zinc-950 rounded-2xl border border-zinc-800 p-4 flex flex-col shadow-xl">
          <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center justify-between">
            <span>Cola de Reproducción</span>
            <span className="bg-purple-950 text-purple-400 text-xs px-2 py-0.5 rounded-md font-mono">{playlist.length}</span>
          </h2>

          {/* Formulario para añadir canciones (Cualquier usuario) */}
          <form onSubmit={handleAddSong} className="mb-4 space-y-2">
            <input 
              type="text"
              value={songInput}
              onChange={(e) => setSongInput(e.target.value)}
              placeholder="Pega link de YouTube aquí..."
              className="w-full text-xs bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-all"
            />
            <button 
              type="submit"
              className="w-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              Añadir a la Playlist
            </button>
          </form>

          {/* Lista de temas */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {playlist.map((track, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border transition-all ${
                  idx === currentTrackIndex 
                    ? 'bg-purple-950/40 border-purple-500/50 shadow-md' 
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <p className="text-xs font-bold text-white truncate">{track.title}</p>
                <div className="flex justify-between items-center mt-1 text-[10px] text-zinc-500">
                  <span className="truncate">Via: {track.addedBy}</span>
                  {idx === currentTrackIndex && <span className="text-purple-400 font-bold animate-pulse">SONANDO NOW</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COLUMNA 2: ESCENARIO PRINCIPAL Y BINGO (5/12 cols) */}
        <section className="lg:col-span-5 flex flex-col space-y-6 overflow-y-auto pr-1">
          
          {/* VIDEO PLAYER (Reproductor Sincronizado) */}
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-2 shadow-xl aspect-video relative group overflow-hidden">
            {playlist.length > 0 ? (
              <iframe
                className="w-full h-full rounded-xl"
                src={`https://www.youtube.com/embed/${playlist[currentTrackIndex]?.id}?autoplay=1&controls=1&rel=0`}
                title="Anita Hub Live Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-sm">
                No hay vídeos en cola.
              </div>
            )}
            <button 
              onClick={nextTrack}
              className="absolute bottom-4 right-4 bg-black/80 hover:bg-purple-600 border border-zinc-700 hover:border-transparent text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg backdrop-blur-sm"
            >
              Forzar Salto ⏭️
            </button>
          </div>

          {/* PANEL DE BINGO PROFESIONAL (1 Solo Cartón) */}
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Tu Cartón de Bingo</h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">Haz clic sobre tus números para marcarlos.</p>
              </div>
              {lastCalledNumber && (
                <div className="bg-purple-600 text-white text-xl font-black w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-purple-400 animate-bounce">
                  {lastCalledNumber}
                </div>
              )}
            </div>

            {/* Matriz Única del Cartón */}
            <div className="grid grid-cols-5 gap-2.5 mb-6">
              {bingoBoard.map((num) => {
                const isMarked = markedNumbers.includes(num);
                const wasCalled = gameHistory.includes(num);
                return (
                  <button
                    key={num}
                    onClick={() => toggleMarkNumber(num)}
                    className={`h-14 rounded-xl text-sm font-mono font-black transition-all duration-150 border flex flex-col items-center justify-center relative overflow-hidden ${
                      isMarked 
                        ? 'bg-purple-600 border-purple-400 text-white font-extrabold shadow-inner scale-[0.97]' 
                        : wasCalled
                          ? 'bg-zinc-800/90 border-green-500/50 text-green-400'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <span>{num}</span>
                    {wasCalled && !isMarked && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />}
                  </button>
                );
              })}
            </div>

            {/* SECCIÓN ADMINISTRATIVA EXCLUSIVA */}
            {isAdmin && (
              <div className="border-t border-zinc-800/60 pt-4 mt-2 bg-zinc-900/30 p-3 rounded-xl border border-zinc-800">
                <p className="text-[10px] font-black tracking-widest text-red-400 uppercase mb-3">Panel de Control: Locutor de Bingo</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAdminCallNumber}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98]"
                  >
                    Cantar Número (Autoplay) 🎯
                  </button>
                  <button
                    onClick={handleAdminResetBingo}
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-bold py-3 rounded-xl transition-all"
                  >
                    Reiniciar Partida 🔄
                  </button>
                </div>
                {gameHistory.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] text-zinc-500 font-medium mb-1">Historial de números cantados:</p>
                    <p className="text-xs font-mono text-zinc-400 break-words tracking-tight bg-black/40 p-2 rounded-lg border border-zinc-900">
                      {gameHistory.join(' - ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* COLUMNA 3: CHAT EN TIEMPO REAL (4/12 cols) */}
        <section className="lg:col-span-4 bg-zinc-950 rounded-2xl border border-zinc-800 p-4 flex flex-col shadow-xl h-[400px] lg:h-auto">
          <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4">Chat Comunitario</h2>
          
          {/* Caja de mensajes */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 text-xs custom-scrollbar">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-2.5 rounded-xl border transition-all ${
                  msg.type === 'admin' 
                    ? 'bg-red-950/20 border-red-900/50' 
                    : msg.type === 'system' 
                      ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400' 
                      : 'bg-zinc-900/70 border-zinc-800/40'
                }`}
              >
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className={`font-black ${
                    msg.type === 'admin' ? 'text-red-400' : msg.type === 'system' ? 'text-purple-400' : 'text-zinc-300'
                  }`}>{msg.user}</span>
                  <span className="text-[9px] text-zinc-600 font-mono">{msg.timestamp}</span>
                </div>
                <p className="text-zinc-300 leading-relaxed font-normal break-words">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Input de Chat */}
          <form onSubmit={handleSendUserMessage} className="flex space-x-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Escribe en el chat..."
              className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-all"
            />
            <button 
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 rounded-xl text-xs transition-all active:scale-[0.95]"
            >
              Enviar
            </button>
          </form>
        </section>

      </main>
    </div>
  );
}