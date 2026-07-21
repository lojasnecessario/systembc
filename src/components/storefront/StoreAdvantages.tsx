import React from 'react';
import { Send, UserCircle, TicketPercent, Headset } from 'lucide-react';

const advantages = [
  { 
    icon: <Send size={24} />, 
    title: 'Entrega digital na hora',
    description: 'Entrega super rapida' 
  },
  { 
    icon: <UserCircle size={24} />, 
    title: 'Jogue na sua conta',
    description: 'Jogue na sua conta pessoal, obtenha conquistas direto nela.' 
  },
  { 
    icon: <TicketPercent size={24} />, 
    title: 'Até 30% OFF',
    description: 'Entre para nosso grupo e receba cupons diários' 
  },
  { 
    icon: <Headset size={24} />, 
    title: 'Suporte de gamer pra gamer',
    description: 'Time real no WhatsApp pra te ajudar antes, durante e depois da compra.' 
  }
];

export const StoreAdvantages: React.FC = () => {
  return (
    <div className="w-full bg-[#0a0d0a] py-12 px-4 md:px-8 border-b border-[#1b241a]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header da Seção */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#33e36a] text-sm font-bold">👑</span>
            <span className="text-[#33e36a] text-xs font-bold uppercase tracking-widest">
              PORQUE A BLACKCORE ?
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-black text-[#eef4ea] uppercase tracking-tighter">
            Vantagens de comprar com a gente
          </h2>
        </div>

        {/* Grade de Vantagens (Scroll Horizontal no Mobile, Grid no Desktop) */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 md:pb-0 snap-x md:snap-none hide-scrollbar">
          {advantages.map((item, index) => (
            <div 
              key={index}
              className="flex-shrink-0 w-[280px] md:w-auto bg-[#141A12] border border-[#1b241a] rounded-xl p-6 snap-center flex flex-col justify-between group hover:border-[#33e36a] transition-colors"
            >
              <div className="w-12 h-12 bg-transparent border border-[#33e36a]/30 rounded-lg flex items-center justify-center text-[#33e36a] mb-6 group-hover:bg-[#33e36a]/10 transition-colors">
                {item.icon}
              </div>
              <div>
                <h3 className="text-[#eef4ea] font-heading font-bold text-lg mb-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-[#8b977f] text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
