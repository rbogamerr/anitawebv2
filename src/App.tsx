import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';

interface ChatMessage {
  id: number;
  message: string;
  username: string;
  is_admin: boolean;
  type?: 'normal' | 'system' | 'woot' | 'grab';
  created_at: string;
}

interface DJ {
  id: string;
  name: string;
  seed: string;
  sprite: 'lorelei' | 'bottts' | 'pixel-art' | 'adventurer';
  role: 'jefa' | 'vip' | 'dj' | 'user';
  lastReaction?: string;
}

interface Particle {
  id: number;
  char: string;
  x: number; // porcentaje horizontal
  scale: number;
}

const BACKUP_TRACKS = [
  { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio - Beats to Relax/Study', artist: 'Lofi Girl' },
  { id: 'K4DyBUG242c', title: 'On & On (feat. Daniel Levi)', artist: 'Cartoon [NCS]' },
  { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up (Plug.dj Anthem)', artist: 'Rick Astley' },
  { id: '5qap5aO4i9A', title: 'Synthwave Radio - Chill retro beats', artist: 'Lofi Girl' }
];

export default function App() {
  // Sesión Jefa
  const [username] = useState('Anita_sorrita');
  const [isAdmin] = useState(true);
  const [dbStatus, setDbStatus] = useState('Conectando...');

  // Personalización interactiva
  const [myLookSeed, setMyLookSeed] = useState('Anita_God_v1');

  // Reproductor
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [videoId, setVideoId] = useState(BACKUP_TRACKS[0].id);
  const [songTitle, setSongTitle] = useState(`${BACKUP_TRACKS[0].artist} — ${BACKUP_TRACKS[0].title}`);

  // Audiencia y Cabina
  const [inBooth, setInBooth] = useState(true);
  const [djList, setDjList] = useState<DJ[]>([
    { id: '1', name: 'Anita_sorrita', seed: 'Anita_God_v1', sprite: 'lorelei', role: 'jefa' },
    { id: '2', name: 'Zaza_Hype', seed: 'ZazaBot_99', sprite: 'bottts', role: 'vip' },
    { id: '3', name: 'El_Castizo', seed: 'Madrid_2026', sprite: 'pixel-art', role: 'dj' },
    { id: '4', name: 'Kimi_Dev', seed: 'KimiCode', sprite: 'adventurer', role: 'user' },
    { id: '5', name: 'Neko_Chan', seed: 'CatGirl_x', sprite: 'pixel-art', role: 'user' },
    { id: '6', name: 'Gamer_Pro', seed: 'Cyber_01', sprite: 'bottts', role: 'user' }
  ]);

  // Votaciones y estado Rave
  const [woots, setWoots] = useState(18);
  const [grabs, setGrabs] = useState(4);
  const [mehs, setMehs] = useState(0);
  const [hasWooted, setHasWooted] = useState(false);
  const [hasGrabbed, setHasGrabbed] = useState(false);
  const [isPartyMode, setIsPartyMode] = useState(false);

  // Partículas flotantes
  const [particles, setParticles] = useState<Particle[]>([]);

  // Chat
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isSupabaseReady = supabase && typeof supabase.from === 'function';

  useEffect(() => {
    if (!isSupabaseReady) { setDbStatus('Modo Local ⚠️'); return; }
    setDbStatus('Sincronizado ⚡');
  }, [isSupabaseReady]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Mantener sincronizado el look de Anita en la lista si lo cambia
  useEffect(() => {
    setDjList(list => list.map(d => d.name === username ? { ...d, seed: myLookSeed } : d));
  }, [myLookSeed, username]);

  const triggerParticles = (char: string, count = 6) => {
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      char,
      x: Math.floor(Math.random() * 75) + 12,
      scale: 0.8 + Math.random() * 0.7
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(curr => curr.filter(p => !newParticles.some(n => n.id === p.id)));
    }, 2200);
  };

  const sendChatMessage = (text: string, msgType: 'normal' | 'system' | 'woot' | 'grab' = 'normal') => {
    const newMsg: ChatMessage = {
      id: Date.now(),
      message: text,
      username: msgType === 'system' ? 'SISTEMA' : username,
      is_admin: isAdmin,
      type: msgType,
      created_at: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendChatMessage(message.trim(), 'normal');
    setMessage('');
  };

  // BOTONES DE REACCIÓN
  const handleWoot = () => {
    if (!hasWooted) setWoots(w => w + 1);
    setHasWooted(true);
    setIsPartyMode(true);
    triggerParticles('🔥', 10);
    sendChatMessage(`¡${username} está bailando como loco! (+1 WOOT 🔥)`, 'woot');
  };

  const handleGrab = () => {
    if (!hasGrabbed) setGrabs(g => g + 1);
    setHasGrabbed(true);
    triggerParticles('⭐', 8);
    sendChatMessage(`⭐ ${username} ha robado esta canción para su playlist.`, 'grab');
  };

  const handleMeh = () => {
    setMehs(m => m + 1);
    triggerParticles('💩', 4);
    sendChatMessage(`A ${username} le sangran los oídos con esto 💩`, 'system');
  };

  const handleQuickEmote = (emote: string, label: string) => {
    triggerParticles(emote, 7);
    sendChatMessage(`Lanza un emote a la pista: ${emote.repeat(4)} (${label})`, 'woot');
  };

  // CONTROLES DE CABINA
  const handleSaltarDJ = () => {
    if (!isAdmin) return;
    const nextIndex = (currentTrackIndex + 1) % BACKUP_TRACKS.length;
    setCurrentTrackIndex(nextIndex);
    setVideoId(BACKUP_TRACKS[nextIndex].id);
    setSongTitle(`${BACKUP_TRACKS[nextIndex].artist} — ${BACKUP_TRACKS[nextIndex].title}`);
    
    setWoots(0); setGrabs(0); setMehs(0);
    setHasWooted(false); setHasGrabbed(false); setIsPartyMode(false);
    
    setDjList(prev => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });

    sendChatMessage(`👑 Anita ha saltado la canción. Nuevo DJ al mando: ${djList[1]?.name || 'Auto-DJ'}`, 'system');
  };

  const toggleBooth = () => {
    if (inBooth) {
      setDjList(l => l.filter(d => d.name !== username));
      setInBooth(false);
    } else {
      setDjList(l => [{ id: '1', name: username, seed: myLookSeed, sprite: 'lorelei', role: 'jefa' }, ...l]);
      setInBooth(true);
    }
  };

  const rerollMyAvatar = () => {
    const randomHash = 'Anita_' + Math.random().toString(36).substring(2, 7);
    setMyLookSeed(randomHash);
    triggerParticles('✨', 5);
  };

  return (
    <div style={{ backgroundColor: '#050505', color: '#ffffff', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', overflow: 'hidden', boxSizing: 'border-box', userSelect: 'none' }}>
      
      {/* HOJA DE ESTILOS DE ANIMACIÓN AVANZADA */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0px) scale(0.5) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-280px) scale(1.6) rotate(25deg); opacity: 0; }
        }
        @keyframes spinVinyl {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseLed {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; boxShadow: 0 0 8px #53FC18; }
        }
        @keyframes chillDance {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-3deg); }
        }
        @keyframes raveDance {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
          30% { transform: translateY(-14px) scale(1.1) rotate(-6deg); }
          70% { transform: translateY(-8px) scale(1.05) rotate(6deg); }
        }
        @keyframes neonFloorGlow {
          0%, 100% { border-bottom-color: #333; boxShadow: 0 0 0 rgba(0,0,0,0); }
          50% { border-bottom-color: #53FC18; boxShadow: 0 -15px 35px rgba(83,252,24,0.25); }
        }
        .anim-chill { animation: chillDance 1.2s ease-in-out infinite; }
        .anim-rave { animation: raveDance 0.38s ease-in-out infinite; }
        .rave-floor { animation: neonFloorGlow 1s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #db2777; }
        .btn-glow:hover { filter: brightness(1.2); transform: translateY(-1px); }
      `}</style>

      {/* HEADER SUPERIOR */}
      <header style={{ height: '56px', background: '#0a0a0a', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 100, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '12px', height: '12px', background: '#53FC18', borderRadius: '50%', boxShadow: '0 0 12px #53FC18' }} />
          <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '2px', color: '#fff' }}>
            ANITA<span style={{ color: '#53FC18' }}>.DJ</span>
          </span>
          <span style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#db2777', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', letterSpacing: '1px' }}>
            SALA PREMIUM
          </span>
        </div>

        {/* Perfil de Usuario con Reroll */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={rerollMyAvatar}
            className="btn-glow"
            style={{ background: 'rgba(219,39,119,0.15)', border: '1px solid #db2777', color: '#f472b6', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' }}
            title="Generar nuevo peinado/ropa al azar"
          >
            <span>🎲</span> Cambiar Look
          </button>

          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1a1a1a', border: '2px solid #53FC18', overflow: 'hidden', padding: '1px', boxShadow: '0 0 10px rgba(83,252,24,0.3)' }}>
            <img src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${myLookSeed}`} style={{ width: '100%', height: '100%' }} alt="Mi Avatar" />
          </div>

          <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{username}</span>

          <span style={{ fontSize: '10px', color: '#888', background: '#141414', padding: '4px 8px', borderRadius: '4px', border: '1px solid #222' }}>
            {dbStatus}
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ display: 'flex', flex: 1, height: 'calc(100vh - 56px)', width: '100%', overflow: 'hidden' }}>
        
        {/* COLUMNA IZQUIERDA: LISTA DJs (20%) */}
        <section style={{ width: '20%', background: '#080808', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #141414', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#888', letterSpacing: '1px' }}>WAITING LIST ({djList.length}/50)</span>
            <span style={{ fontSize: '12px' }}>🎧</span>
          </div>

          <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {djList.map((dj, i) => {
              const isPlaying = i === 0;
              return (
                <div key={dj.id + dj.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: isPlaying ? 'linear-gradient(90deg, rgba(219,39,119,0.2) 0%, rgba(0,0,0,0) 100%)' : '#101010', borderRadius: '10px', border: isPlaying ? '1px solid #db2777' : '1px solid #1a1a1a', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isPlaying ? '#db2777' : '#222', padding: '2px', overflow: 'hidden' }}>
                      <img src={`https://api.dicebear.com/8.x/${dj.sprite}/svg?seed=${dj.seed}`} style={{ width: '100%', height: '100%' }} alt="img" />
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: isPlaying ? '800' : '600', color: isPlaying ? '#f472b6' : '#ddd', display: 'block' }}>{dj.name}</span>
                      <span style={{ fontSize: '9px', color: isPlaying ? '#53FC18' : '#666', fontWeight: 'bold' }}>{isPlaying ? '▶ PINCHANDO' : `#${i}`}</span>
                    </div>
                  </div>
                  {isAdmin && !isPlaying && (
                     <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', opacity: 0.6 }} title="Expulsar de la cola">×</button>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ padding: '14px', background: '#0d0d0d', borderTop: '1px solid #1a1a1a' }}>
            <button 
              onClick={toggleBooth}
              className="btn-glow"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: inBooth ? '#2b2b2b' : 'linear-gradient(135deg, #db2777, #9333ea)', color: '#fff', fontWeight: '800', fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }}
            >
              {inBooth ? '🚶‍♂️ Salir de la cola' : '🙋‍♂️ Subir a pinchar'}
            </button>
          </div>
        </section>

        {/* COLUMNA CENTRAL: ESCENARIO PLUG.DJ (58%) */}
        <section style={{ width: '58%', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at 50% 30%, #171717 0%, #050505 100%)', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
          
          {/* BARRA SUPERIOR DE TÍTULO DE CANCIÓN */}
          <div style={{ padding: '12px 24px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px', animation: isPartyMode ? 'pulseLed 0.5s infinite' : 'none' }}>📻</span>
              <div>
                <span style={{ fontSize: '9px', color: '#53FC18', fontWeight: 'bold', letterSpacing: '1px' }}>SONANDO AHORA EN LA SALA</span>
                <span style={{ fontSize: '14px', fontWeight: '900', color: '#fff', display: 'block' }}>{songTitle}</span>
              </div>
            </div>

            {isAdmin && (
              <button 
                onClick={handleSaltarDJ} 
                className="btn-glow" 
                style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', boxShadow: '0 0 10px rgba(239,68,68,0.4)' }}
              >
                ⏭️ Forzar Salto
              </button>
            )}
          </div>

          {/* REPRODUCTOR YOUTUBE */}
          <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box', zIndex: 10 }}>
            <div style={{ width: '100%', maxWidth: '780px', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.08)', background: '#000' }}>
              <iframe
                title="Plug DJ Screen"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                style={{ width: '100%', height: '100%', border: 0 }}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>

          {/* CAPA DE PARTÍCULAS FLOTANTES (ABSOLUTA) */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '150px', pointerEvents: 'none', zIndex: 30, overflow: 'hidden' }}>
            {particles.map(p => (
              <div 
                key={p.id} 
                style={{ position: 'absolute', bottom: '10px', left: `${p.x}%`, fontSize: `${Math.floor(28 * p.scale)}px`, animation: 'floatUp 2s ease-out forwards', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.8))' }}
              >
                {p.char}
              </div>
            ))}
          </div>

          {/* ESCENARIO REAL CON CABINA DE DJ Y PÚBLICO */}
          <div className={isPartyMode ? 'rave-floor' : ''} style={{ height: '150px', background: 'linear-gradient(180deg, rgba(15,15,15,0) 0%, #111111 100%)', borderBottom: '3px solid #222', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 20 }}>
            
            {/* CABINA DE DJ FÍSICA (CENTRO ESCENARIO) */}
            <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 25 }}>
              
              {/* Avatar del DJ actual pinchando */}
              <div className={isPartyMode ? 'anim-rave' : 'anim-chill'} style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#1f1f1f', border: '3px solid #db2777', padding: '2px', boxShadow: '0 0 25px rgba(219,39,119,0.6)', overflow: 'hidden', position: 'relative', backgroundClip: 'padding-box' }}>
                <img src={`https://api.dicebear.com/8.x/${djList[0]?.sprite || 'bottts'}/svg?seed=${djList[0]?.seed || 'dj'}`} style={{ width: '100%', height: '100%' }} alt="Active DJ" />
              </div>

              {/* Mesa de mezclas gráfica */}
              <div style={{ width: '140px', height: '36px', background: 'linear-gradient(90deg, #1f1f1f 0%, #0a0a0a 50%, #1f1f1f 100%)', border: '2px solid #333', borderTop: '2px solid #db2777', borderRadius: '6px', marginTop: '-12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', boxShadow: '0 12px 20px rgba(0,0,0,0.9)' }}>
                {/* Plato izquierdo */}
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #444', background: 'repeating-radial-gradient(circle, #111 0, #111 2px, #222 3px)', animation: 'spinVinyl 1.8s linear infinite' }} />
                {/* Ecualizador LED */}
                <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '16px' }}>
                  <div style={{ width: '5px', height: isPartyMode ? '100%' : '60%', background: '#53FC18', transition: 'height 0.1s' }}/>
                  <div style={{ width: '5px', height: isPartyMode ? '80%' : '40%', background: '#53FC18', transition: 'height 0.1s' }}/>
                  <div style={{ width: '5px', height: isPartyMode ? '90%' : '70%', background: '#db2777', transition: 'height 0.1s' }}/>
                  <div style={{ width: '5px', height: isPartyMode ? '100%' : '30%', background: '#db2777', transition: 'height 0.1s' }}/>
                </div>
                {/* Plato derecho */}
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #444', background: 'repeating-radial-gradient(circle, #111 0, #111 2px, #222 3px)', animation: 'spinVinyl 1.8s linear infinite reverse' }} />
              </div>
              <span style={{ fontSize: '9px', background: '#db2777', color: '#fff', fontWeight: '900', padding: '1px 8px', borderRadius: '10px', marginTop: '-6px', letterSpacing: '1px' }}>DJ BOOTH</span>
            </div>

            {/* PÚBLICO EN LA PISTA DE BAILE */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '22px', paddingBottom: '12px', zIndex: 15 }}>
              {djList.slice(1).map((user) => (
                <div key={'dance' + user.id} className={isPartyMode ? 'anim-rave' : 'anim-chill'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px', boxShadow: '0 8px 16px rgba(0,0,0,0.6)' }}>
                    <img src={`https://api.dicebear.com/8.x/${user.sprite}/svg?seed=${user.seed}`} style={{ width: '100%', height: '100%' }} alt="dancer" />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#aaa', marginTop: '4px', background: 'rgba(0,0,0,0.7)', padding: '1px 6px', borderRadius: '4px' }}>
                    {user.name.split('_')[0]}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* BARRA INFERIOR DE VOTACIONES (LA TRINIDAD PLUG.DJ) */}
          <div style={{ padding: '16px 24px', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20 }}>
            <div style={{ display: 'flex', gap: '14px', width: '100%', maxWidth: '520px' }}>
              
              {/* WOOT */}
              <button 
                onClick={handleWoot} 
                className="btn-glow"
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: hasWooted ? '2px solid #53FC18' : '1px solid rgba(83,252,24,0.3)', background: hasWooted ? 'rgba(83,252,24,0.15)' : '#141414', color: '#53FC18', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: hasWooted ? '0 0 20px rgba(83,252,24,0.4)' : 'none', transition: 'all 0.1s' }}
              >
                🔥 WOOT! <span style={{ background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', color: '#fff' }}>{woots}</span>
              </button>

              {/* GRAB */}
              <button 
                onClick={handleGrab} 
                className="btn-glow"
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: hasGrabbed ? '2px solid #c084fc' : '1px solid rgba(192,132,252,0.3)', background: hasGrabbed ? 'rgba(192,132,252,0.15)' : '#141414', color: '#c084fc', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: hasGrabbed ? '0 0 20px rgba(192,132,252,0.4)' : 'none', transition: 'all 0.1s' }}
              >
                ⭐ GRAB <span style={{ background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', color: '#fff' }}>{grabs}</span>
              </button>

              {/* MEH */}
              <button 
                onClick={handleMeh} 
                className="btn-glow"
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)', background: '#141414', color: '#f87171', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                💩 MEH <span style={{ background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', color: '#fff' }}>{mehs}</span>
              </button>

            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '10px', color: '#666', fontWeight: 'bold', display: 'block' }}>EN CABINA AHORA</span>
              <span style={{ fontSize: '15px', fontWeight: '900', color: '#db2777' }}>{djList[0]?.name || 'Auto-DJ'}</span>
            </div>
          </div>

        </section>

        {/* COLUMNA DERECHA: CHAT ULTRA DINÁMICO (22%) */}
        <section style={{ width: '22%', background: '#0a0a0a', borderLeft: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          
          <div style={{ padding: '16px', background: '#0f0f0f', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💬</span>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#fff', letterSpacing: '1px' }}>GLOBAL ROOM CHAT</span>
          </div>

          {/* LISTA DE MENSAJES */}
          <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={{ padding: '10px', background: 'linear-gradient(135deg, rgba(219,39,119,0.15), rgba(0,0,0,0))', borderLeft: '3px solid #db2777', borderRadius: '6px', fontSize: '12px', lineHeight: '1.4' }}>
              <span style={{ color: '#f472b6', fontWeight: '900' }}>ANITA_BOT:</span> ¡Sala activa! Genera tu look arriba a la izquierda y vota para desatar la Rave.
            </div>

            {chatMessages.map((m) => {
              let bg = 'transparent';
              let col = '#ddd';
              if (m.type === 'woot') { bg = 'rgba(83,252,24,0.08)'; col = '#53FC18'; }
              if (m.type === 'grab') { bg = 'rgba(192,132,252,0.08)'; col = '#c084fc'; }

              return (
                <div key={m.id} style={{ fontSize: '13px', padding: m.type !== 'normal' ? '8px 10px' : '2px 0', background: bg, borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {m.is_admin && m.type === 'normal' && <span style={{ fontSize: '11px' }}>👑</span>}
                    <span style={{ fontWeight: '800', color: m.is_admin ? '#f472b6' : '#a855f7', fontSize: '12px' }}>
                      {m.username}:
                    </span>
                  </div>
                  <span style={{ color: col, paddingLeft: m.type === 'normal' ? '20px' : '0', wordBreak: 'break-word', fontSize: '12px' }}>{m.message}</span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* BARRA HYPE EXPRESS (ACCESOS DIRECTOS DE EMOTES) */}
          <div style={{ padding: '8px 14px', background: '#050505', borderTop: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>EXPRESS:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => handleQuickEmote('💃', 'Bailar')} className="btn-glow" style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}>💃</button>
              <button onClick={() => handleQuickEmote('💖', 'Love')} className="btn-glow" style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}>💖</button>
              <button onClick={() => handleQuickEmote('🍺', 'Salud')} className="btn-glow" style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}>🍺</button>
              <button onClick={() => handleQuickEmote('🚀', 'To the moon')} className="btn-glow" style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}>🚀</button>
            </div>
          </div>

          {/* INPUT CHAT MANUAL */}
          <form onSubmit={handleManualSubmit} style={{ padding: '12px', background: '#0d0d0d', borderTop: '1px solid #1a1a1a' }}>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Habla con la sala..." 
              style={{ width: '100%', background: '#171717', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </form>

        </section>

      </main>
    </div>
  );
}