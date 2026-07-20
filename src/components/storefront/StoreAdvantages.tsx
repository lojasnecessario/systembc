import React from 'react';
import { Truck, ShieldCheck, CreditCard, Clock, Headset, Repeat } from 'lucide-react';

const advantages = [
  { icon: <Truck size={24} />, text: 'Frete Grátis para Sul e Sudeste' },
  { icon: <ShieldCheck size={24} />, text: 'Compra 100% Segura' },
  { icon: <CreditCard size={24} />, text: 'Até 12x Sem Juros' },
  { icon: <Clock size={24} />, text: 'Envio em até 24h úteis' },
  { icon: <Headset size={24} />, text: 'Suporte Especializado 24/7' },
  { icon: <Repeat size={24} />, text: 'Troca Fácil em até 30 dias' },
];

export const StoreAdvantages: React.FC = () => {
  // Duplicamos o array para que o efeito infinito funcione perfeitamente
  const duplicatedAdvantages = [...advantages, ...advantages];

  return (
    <div className="w-full bg-neutral-900/40 border-y border-white/5 py-6 overflow-hidden relative">
      {/* Sombras nas laterais para suavizar o letreiro entrando/saindo */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-black to-transparent z-10" />

      {/* Marquee Wrapper */}
      <div className="flex whitespace-nowrap animate-marquee">
        {duplicatedAdvantages.map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 px-8 text-neutral-300 hover:text-green-400 transition-colors"
          >
            <div className="text-green-500">
              {item.icon}
            </div>
            <span className="text-sm md:text-base font-semibold tracking-wide uppercase">
              {item.text}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-white/10 ml-8" />
          </div>
        ))}
      </div>
    </div>
  );
};
