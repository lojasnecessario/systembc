import React from 'react';

export const AboutSection: React.FC = () => {
  return (
    <section className="w-full py-24 px-4 md:px-8 bg-black relative overflow-hidden" id="sobre">
      <div className="absolute inset-0 bg-green-500/5 blur-[150px] rounded-full w-full h-[500px] top-1/2 -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-row items-center gap-6 md:gap-16">
          
          {/* Imagem */}
          <div className="w-1/2 md:w-1/2 h-[250px] md:h-[500px] relative rounded-3xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" 
              alt="Setup Gamer Black Core" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Elemento de design flutuante (opcional) */}
            <div className="absolute bottom-6 left-6 z-20 backdrop-blur-md bg-black/50 border border-white/10 rounded-2xl p-4 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                  <span className="text-green-400 font-bold text-lg">+10k</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Clientes</p>
                  <p className="text-neutral-400 text-sm">satisfeitos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Texto */}
          <div className="w-1/2 md:w-1/2 flex flex-col justify-center">
            <h2 className="text-sm md:text-base font-bold text-green-500 uppercase tracking-[0.2em] mb-3">
              Sobre Nós
            </h2>
            <h3 className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
              A Essência do <br className="hidden md:block" /> Seu Setup
            </h3>
            
            <p className="text-neutral-400 text-xs md:text-lg mb-6 md:mb-8 leading-relaxed max-w-xl">
              Nascemos da paixão por tecnologia de ponta. A <strong className="text-white">Black Core</strong> não é apenas uma loja, é o destino definitivo para quem busca performance extrema e design impecável. Selecionamos rigorosamente cada hardware, console e periférico para elevar a sua experiência a um patamar que você nunca imaginou.
            </p>

            <div className="flex items-center gap-4">
              <button className="bg-white text-black px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-base hover:bg-neutral-200 transition-colors">
                Nossa História
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
