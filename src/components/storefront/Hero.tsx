import React, { useEffect, useRef } from 'react';

export const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;

    const updateVideoProgress = () => {
      if (!videoRef.current || !containerRef.current) return;
      
      const { top, height } = containerRef.current.getBoundingClientRect();
      
      // O progresso vai de 0 (quando o topo do container está no topo da tela)
      // até 1 (quando o fundo do container está no topo da tela)
      let progress = -top / height;
      
      // Garante que o progresso fique entre 0 e 1
      progress = Math.max(0, Math.min(1, progress));
      
      const duration = videoRef.current.duration;
      if (duration && !isNaN(duration)) {
        videoRef.current.currentTime = progress * duration;
      }
    };

    const handleScroll = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(updateVideoProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', updateVideoProgress);
    }
    
    // Chamada inicial para garantir o frame correto na montagem
    updateVideoProgress();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', updateVideoProgress);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        src="/hero_video.mp4"
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        preload="auto"
      />
      
      {/* Overlay gradient e textos */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4">
        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 text-center drop-shadow-2xl">
          ELEVE SEU <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">JOGO</span>
        </h1>
        <p className="text-lg md:text-2xl text-slate-200 font-light mb-8 max-w-2xl text-center drop-shadow-md">
          Desbrave novas realidades. Rolagem para continuar sua jornada.
        </p>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-pulse">
          <span className="text-xs uppercase tracking-[0.2em] text-white/70 mb-3 font-semibold">Scroll</span>
          <div className="w-px h-16 bg-gradient-to-b from-white/80 to-transparent" />
        </div>
      </div>
    </div>
  );
};
