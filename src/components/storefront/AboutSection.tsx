import React from 'react';
// import { Play } from 'lucide-react'; // unused

import { Link } from 'react-router-dom';

export const AboutSection: React.FC = () => {
  return (
    <section className="w-full py-8 md:py-12 px-4 md:px-8 bg-[#0a0d0a] relative overflow-hidden" id="sobre">
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          
          {/* Texto (Mobile: Fica acima do vídeo, Desktop: Fica na esquerda) */}
          <div className="w-full md:w-1/2 flex flex-col justify-center order-2 md:order-1">
            <h2 className="text-[#33e36a] text-xs md:text-sm font-bold uppercase tracking-widest mb-4">
              PRODUTOS GAMER E TECNOLOGIA
            </h2>
            <h3 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-[#eef4ea] mb-6 leading-[1.1] tracking-tighter">
              Tudo para o seu <br className="hidden lg:block"/> Setup com os <br className="hidden lg:block"/> melhores preços
            </h3>
            
            <p className="text-[#8b977f] text-sm md:text-base lg:text-lg mb-8 leading-relaxed max-w-xl">
              Imagine comprar tudo o que você precisa para o seu setup gamer com descontos incríveis, total suporte de uma equipe especializada. Confira nossas ofertas e descubra um novo mundo de possibilidades...
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

          {/* Imagem da Seção */}
          <div className="w-full md:w-1/2 relative rounded-2xl overflow-hidden group order-1 md:order-2 shadow-2xl border border-[#1b241a]">
            <img 
              src="/sobrenos.jpeg" 
              alt="Sobre Nós" 
              className="w-full aspect-video md:aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

        </div>
      </div>
    </section>
  );
};
