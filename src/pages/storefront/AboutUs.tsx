import React from 'react';
import { AboutSection } from '../../components/storefront/AboutSection';
import { StoreAdvantages } from '../../components/storefront/StoreAdvantages';

export const AboutUs: React.FC = () => {
  return (
    <div className="w-full bg-[#0a0d0a] min-h-screen pt-28 md:pt-40 pb-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-4 text-center">
        <h1 className="text-3xl md:text-5xl font-heading font-black text-[#eef4ea] uppercase tracking-tighter">
          Sobre a Blackcore
        </h1>
        <p className="text-[#8b977f] text-sm md:text-base max-w-2xl mx-auto mt-4">
          Conheça mais sobre a nossa história, missão e o motivo de sermos a melhor opção para seus jogos digitais.
        </p>
      </div>

      <AboutSection />
      
      <div className="mt-12">
        <StoreAdvantages />
      </div>
    </div>
  );
};
