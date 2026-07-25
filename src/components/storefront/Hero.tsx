import React from 'react';
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {



  return (
    <div className="relative w-full min-h-[100svh] md:min-h-0 md:h-[700px] bg-[#0a0d0a] overflow-hidden group flex items-center pt-24 pb-36 md:pt-0 md:pb-32">
      
      {/* Background Video (Auto-play) */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        {/* Vídeo Desktop */}
        <video 
          autoPlay
          muted 
          playsInline
          preload="none"
          poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
          className="w-full h-full object-cover hidden md:block"
        >
          <source src="/herovideo.mp4" type="video/mp4" />
        </video>
        
        {/* Vídeo Mobile */}
        <video 
          autoPlay
          muted 
          playsInline
          preload="none"
          poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
          className="w-full h-full object-cover block md:hidden"
        >
          <source src="/heromobile.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Overlay Escuro para Legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d0a] via-[#0a0d0a]/80 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d0a]/50 via-transparent to-[#0a0d0a] pointer-events-none z-10" />
      
      {/* Conteúdo do Banner */}
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 md:pt-[120px]">
        <div className="max-w-2xl mt-8 md:mt-0">
          <span className="text-white font-medium text-[10px] md:text-sm tracking-[0.2em] mb-3 md:mb-4 flex items-center gap-2 animate-fade-in-up">
            ELEVE SEU JOGO <span className="text-[#33e36a]">/////////</span>
          </span>
          <h1 className="text-[42px] leading-[0.9] sm:text-6xl md:text-7xl lg:text-[90px] font-heading font-black text-white uppercase tracking-tighter mb-5 md:mb-6 flex flex-col animate-fade-in-up animation-delay-100">
            <span className="drop-shadow-xl">VIVA O GAME.</span>
            <span className="text-[#33e36a] drop-shadow-[0_0_15px_rgba(51,227,106,0.3)]">SINTA A VITÓRIA.</span>
          </h1>
          <p className="text-[#eef4ea] text-xs md:text-base mb-8 md:mb-10 max-w-lg font-medium leading-relaxed tracking-wide animate-fade-in-up animation-delay-200">
            OS MELHORES GAMES, ELETRÔNICOS E ACESSÓRIOS<br className="hidden md:block"/>
            <span className="md:hidden"> </span>PARA LEVAR SUA EXPERIÊNCIA AO <span className="text-[#33e36a] font-bold">PRÓXIMO NÍVEL.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 md:mb-10 animate-fade-in-up animation-delay-300">
            <div className="flex items-center gap-3">
              <div className="text-[#33e36a]"><Truck size={28} strokeWidth={1.5} /></div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-bold uppercase tracking-wider">Envio Rápido</span>
                <span className="text-[#a1a1aa] text-[11px] uppercase tracking-wider">para todo o Brasil</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[#33e36a]"><ShieldCheck size={28} strokeWidth={1.5} /></div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-bold uppercase tracking-wider">Compra Segura</span>
                <span className="text-[#a1a1aa] text-[11px] uppercase tracking-wider">site 100% protegido</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[#33e36a]"><Award size={28} strokeWidth={1.5} /></div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-bold uppercase tracking-wider">Garantia</span>
                <span className="text-[#a1a1aa] text-[11px] uppercase tracking-wider">dos melhores</span>
              </div>
            </div>
          </div>

          <Link 
            to="/categoria/pacotes" 
            className="group inline-flex items-center justify-between border border-[#33e36a] text-[#33e36a] hover:bg-[#33e36a] hover:text-[#06250f] font-bold uppercase text-sm px-6 py-4 rounded-lg transition-all shadow-[0_0_15px_rgba(51,227,106,0.15)] hover:shadow-[0_0_25px_rgba(51,227,106,0.4)] w-[280px] animate-fade-in-up animation-delay-400"
          >
            <span>Confira as Ofertas</span>
            <div className="border border-[#33e36a] group-hover:border-[#06250f] rounded-full p-1 transition-colors">
              <ChevronRight size={16} strokeWidth={3} />
            </div>
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
