import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Scrub de Vídeo
      if (videoRef.current && !Number.isNaN(videoRef.current.duration)) {
        // A cada 40 pixels de rolagem, avança 1 segundo de vídeo (bem mais rápido)
        const scrollFactor = 40; 
        let targetTime = window.scrollY / scrollFactor;
        
        // Limita o tempo do vídeo para não passar da duração total
        if (targetTime > videoRef.current.duration) {
          targetTime = videoRef.current.duration;
        }
        
        // Se a duração for válida, aplica o tempo usando requestAnimationFrame para ficar fluido
        requestAnimationFrame(() => {
          if (videoRef.current) {
            videoRef.current.currentTime = targetTime;
          }
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-full h-[600px] md:h-[700px] bg-[#0a0d0a] overflow-hidden group flex items-center pb-20 md:pb-32">
      
      {/* Background Video (Scrub-on-Scroll) */}
      <div className="absolute top-0 left-0 w-full h-[120%] z-0">
        <video 
          ref={videoRef}
          muted 
          playsInline
          className="w-full h-full object-cover opacity-50"
        >
          <source src="/videomov.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Overlay Escuro para Legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d0a] via-[#0a0d0a]/80 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d0a]/50 via-transparent to-[#0a0d0a] pointer-events-none z-10" />
      
      {/* Conteúdo do Banner */}
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-[120px]">
        <div className="max-w-xl">
          <span className="text-[#33e36a] font-bold text-sm md:text-base uppercase tracking-wider mb-2 block drop-shadow-md">
            OFERTAS ESPECIAIS
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-[#eef4ea] uppercase leading-tight mb-4 drop-shadow-xl">
            Tudo para o <br/> seu setup com <br/> super desconto
          </h1>
          <p className="text-[#8b977f] text-sm md:text-base mb-8 max-w-md uppercase font-semibold drop-shadow-md">
            Consoles, controles, jogos e acessórios. Garanta agora os melhores produtos para elevar o seu nível.
          </p>
          <Link 
            to="/categoria/pacotes" 
            className="inline-block bg-[#33e36a] hover:bg-[#11a544] text-[#06250f] font-black uppercase text-lg px-8 py-4 rounded-xl md:rounded-full transition-colors shadow-[0_0_20px_rgba(51,227,106,0.3)] hover:shadow-[0_0_30px_rgba(51,227,106,0.5)]"
          >
            Compre Agora
          </Link>
        </div>
      </div>

      {/* Navegação do Slider (Desktop) */}
      <button className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-30">
        <ChevronLeft size={28} />
      </button>
      <button className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-30">
        <ChevronRight size={28} />
      </button>
    </div>
  );
};
