import React from 'react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutSection: React.FC = () => {
  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-8 bg-[#0a0d0a] relative overflow-hidden" id="sobre">
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          
          {/* Texto (Mobile: Fica acima do vídeo, Desktop: Fica na esquerda) */}
          <div className="w-full md:w-1/2 flex flex-col justify-center order-2 md:order-1">
            <h2 className="text-[#33e36a] text-xs md:text-sm font-bold uppercase tracking-widest mb-4">
              JOGOS XBOX MÍDIA DIGITAL
            </h2>
            <h3 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-[#eef4ea] mb-6 leading-[1.1] tracking-tighter">
              Economize até 70% na <br className="hidden lg:block"/> compra dos seus Jogos <br className="hidden lg:block"/> de Xbox com total segurança
            </h3>
            
            <p className="text-[#8b977f] text-sm md:text-base lg:text-lg mb-8 leading-relaxed max-w-xl">
              Imagine comprar seus jogos de Xbox com até 70% de desconto e ter eles para sempre, com total suporte de uma equipe especializada. Assista o vídeo para e saiba como isso é possível...
            </p>

            <div>
              <Link 
                to="/#produtos"
                className="inline-block bg-[#33e36a] hover:bg-[#11a544] text-[#06250f] px-8 py-4 rounded-xl font-bold uppercase tracking-wide transition-colors"
              >
                Confira as ofertas do dia
              </Link>
            </div>
          </div>

          {/* Vídeo Thumbnail (Mobile: Fica abaixo do texto? Não, no print o texto tá encima e o botão embaixo. O vídeo não aparece no print mobile, mas vamos colocar acima do texto no mobile por padrão visual) */}
          <div className="w-full md:w-1/2 relative rounded-2xl overflow-hidden group order-1 md:order-2 cursor-pointer shadow-2xl border border-[#1b241a]">
            <img 
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" 
              alt="Vídeo Promocional" 
              className="w-full aspect-video md:aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
            />
            {/* Overlay Escuro Inferior (Para o título do vídeo) */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent z-10" />
            
            {/* Título Estilo YouTube */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-full overflow-hidden border border-white/20">
                 {/* Fake Avatar */}
                 <div className="w-full h-full bg-[#33e36a] flex items-center justify-center text-[#06250f] font-bold text-xs">BC</div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm leading-tight line-clamp-1 drop-shadow-md">
                  Blackcore Jogos Xbox Mídia Digital com até 70% OFF
                </span>
              </div>
            </div>

            {/* Ícone de Play Estilo Shorts/YT */}
            <div className="absolute inset-0 z-30 flex items-center justify-center">
              <div className="w-16 h-12 bg-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-500 transition-colors shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                <Play className="text-white ml-1 fill-white" size={24} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
