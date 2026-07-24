import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

const clientPhotos = [
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.11 (1).jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.11.jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.12 (1).jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.12.jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.13 (1).jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.13 (2).jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.13.jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.14 (1).jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.14 (2).jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.14 (3).jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.14 (4).jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.14.jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.15 (1).jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.15 (2).jpeg',
  '/DEP/WhatsApp Image 2026-07-19 at 13.48.15.jpeg'
];

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'João Silva',
    role: 'Gamer Casual',
    avatar: 'https://ui-avatars.com/api/?name=Joao+Silva&background=22c55e&color=fff',
    rating: 5,
    text: 'A experiência de compra foi incrível! O produto chegou super rápido e em perfeito estado. O atendimento da Black Core é diferenciado.',
    date: 'há 2 dias',
    verified: true,
  },
  {
    id: 2,
    name: 'Marina Costa',
    role: 'Streamer',
    avatar: 'https://ui-avatars.com/api/?name=Marina+Costa&background=22c55e&color=fff',
    rating: 5,
    text: 'Comprei e não me arrependo. Tudo de primeira linha! Recomendo muito pra quem busca qualidade.',
    date: 'há 1 semana',
    verified: true,
  },
  {
    id: 3,
    name: 'Carlos Mendes',
    role: 'Entusiasta',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendes&background=22c55e&color=fff',
    rating: 5,
    text: 'Preços imbatíveis e entrega expressa. A embalagem veio muito bem protegida e o atendimento foi 10.',
    date: 'há 2 semanas',
    verified: true,
  },
  {
    id: 4,
    name: 'Ana Souza',
    role: 'Gamer Competitiva',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Souza&background=22c55e&color=fff',
    rating: 4,
    text: 'O produto é fantástico, a loja foi super transparente em todo o processo da compra até a entrega.',
    date: 'há 1 mês',
    verified: true,
  },
  {
    id: 5,
    name: 'Rafael Gomes',
    role: 'Colecionador',
    avatar: 'https://ui-avatars.com/api/?name=Rafael+Gomes&background=22c55e&color=fff',
    rating: 5,
    text: 'Sempre compro aqui. A Black Core já virou minha loja de confiança para tudo relacionado a games.',
    date: 'há 1 mês',
    verified: true,
  },
  {
    id: 6,
    name: 'Beatriz Lima',
    role: 'Designer',
    avatar: 'https://ui-avatars.com/api/?name=Beatriz+Lima&background=22c55e&color=fff',
    rating: 5,
    text: 'Qualidade surreal. Parabéns à equipe pelo atendimento premium do início ao fim.',
    date: 'há 2 meses',
    verified: true,
  },
  {
    id: 7,
    name: 'Felipe Santos',
    role: 'Cliente Fiel',
    avatar: 'https://ui-avatars.com/api/?name=Felipe+Santos&background=22c55e&color=fff',
    rating: 5,
    text: 'Sempre compro meus equipamentos e consoles com eles. Chegou tudo certinho como sempre.',
    date: 'há 2 meses',
    verified: true,
  },
  {
    id: 8,
    name: 'Larissa Andrade',
    role: 'Consumidora',
    avatar: 'https://ui-avatars.com/api/?name=Larissa+Andrade&background=22c55e&color=fff',
    rating: 5,
    text: 'Primeira vez comprando e com certeza comprarei novamente. Muito satisfeita!',
    date: 'há 3 meses',
    verified: true,
  },
  {
    id: 9,
    name: 'Matheus Oliveira',
    role: 'PC Gamer',
    avatar: 'https://ui-avatars.com/api/?name=Matheus+Oliveira&background=22c55e&color=fff',
    rating: 5,
    text: 'Setup renovado graças à loja. Recomendo pra todo mundo que quer hardware de ponta.',
    date: 'há 3 meses',
    verified: true,
  },
  {
    id: 10,
    name: 'Juliana Castro',
    role: 'Mãe',
    avatar: 'https://ui-avatars.com/api/?name=Juliana+Castro&background=22c55e&color=fff',
    rating: 5,
    text: 'Comprei de presente pro meu filho e ele adorou. O suporte me ajudou a escolher o modelo certo.',
    date: 'há 4 meses',
    verified: true,
  },
  {
    id: 11,
    name: 'Rodrigo Alves',
    role: 'Cliente',
    avatar: 'https://ui-avatars.com/api/?name=Rodrigo+Alves&background=22c55e&color=fff',
    rating: 4,
    text: 'Gostei bastante do atendimento. O envio foi no mesmo dia da compra.',
    date: 'há 4 meses',
    verified: true,
  },
  {
    id: 12,
    name: 'Camila Rocha',
    role: 'Gamer Competitiva',
    avatar: 'https://ui-avatars.com/api/?name=Camila+Rocha&background=22c55e&color=fff',
    rating: 5,
    text: 'Tudo de ótima qualidade. Equipamento já está sendo testado e aprovado.',
    date: 'há 5 meses',
    verified: true,
  },
  {
    id: 13,
    name: 'Thiago Nogueira',
    role: 'Cliente',
    avatar: 'https://ui-avatars.com/api/?name=Thiago+Nogueira&background=22c55e&color=fff',
    rating: 5,
    text: 'Veio muito bem embalado. Dá pra notar o cuidado que a loja tem com o cliente.',
    date: 'há 5 meses',
    verified: true,
  },
  {
    id: 14,
    name: 'Vanessa Pires',
    role: 'Cliente VIP',
    avatar: 'https://ui-avatars.com/api/?name=Vanessa+Pires&background=22c55e&color=fff',
    rating: 5,
    text: 'Sempre que preciso venho aqui. Atendimento impecável.',
    date: 'há 6 meses',
    verified: true,
  },
  {
    id: 15,
    name: 'Igor Monteiro',
    role: 'Streamer',
    avatar: 'https://ui-avatars.com/api/?name=Igor+Monteiro&background=22c55e&color=fff',
    rating: 5,
    text: 'Tudo funcionando perfeitamente, excelente custo benefício.',
    date: 'há 6 meses',
    verified: true,
  }
];

export const Testimonials: React.FC = () => {
  const photoScrollRef = useRef<HTMLDivElement>(null);

  const scrollPhotos = (direction: 'left' | 'right') => {
    if (photoScrollRef.current) {
      const { current } = photoScrollRef;
      // Scroll by approximately half the container width for a smoother experience
      const scrollAmount = direction === 'left' ? -(current.offsetWidth / 1.5) : (current.offsetWidth / 1.5);
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 overflow-x-hidden">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6 relative z-10">
          O Que Dizem <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">Nossos Clientes</span>
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto relative z-10 leading-relaxed">
          A satisfação da nossa comunidade é o que nos move. Confira as experiências reais de quem já elevou seu setup com a Black Core.
        </p>
        
        <div className="flex items-center justify-center gap-6 mt-10 relative z-10">
          <div className="flex flex-col items-center">
            <h3 className="text-3xl font-black text-white">4.9</h3>
            <div className="flex text-green-500 mt-1 mb-1">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Média Geral</span>
          </div>
          <div className="w-px h-12 bg-white/10"></div>
          <div className="flex flex-col items-center">
            <h3 className="text-3xl font-black text-white">+5k</h3>
            <span className="text-xs text-neutral-500 uppercase tracking-widest font-bold mt-2">Avaliações</span>
          </div>
        </div>

        <div className="mt-10 relative z-10 flex justify-center">
          <Link to="/google" className="flex items-center gap-2 bg-transparent border border-green-500/50 hover:bg-green-500/10 text-green-400 font-bold uppercase tracking-wider text-sm px-6 py-3 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.15)] hover:shadow-[0_0_25px_rgba(34,197,94,0.3)]">
            Veja Nossas Avaliações no Google
          </Link>
        </div>
      </div>

      {/* Adaptive Photos Slider Section */}
      <div className="w-full relative mb-24 max-w-[1600px] mx-auto px-2 md:px-8">
        <div className="text-center mb-10 px-4">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
            Nossos Clientes com a <span className="text-green-500">Mão na Massa</span>
          </h2>
          <p className="text-neutral-400 mt-2 text-sm md:text-base">Fotos reais dos produtos recebidos pela galera Black Core.</p>
        </div>

        <button 
          onClick={() => scrollPhotos('left')}
          className="absolute left-4 md:left-12 top-[60%] -translate-y-1/2 z-20 bg-black/80 hover:bg-green-500 text-white p-4 rounded-full border border-white/20 backdrop-blur-md transition-all hidden md:block cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.8)]"
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          onClick={() => scrollPhotos('right')}
          className="absolute right-4 md:right-12 top-[60%] -translate-y-1/2 z-20 bg-black/80 hover:bg-green-500 text-white p-4 rounded-full border border-white/20 backdrop-blur-md transition-all hidden md:block cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.8)]"
        >
          <ChevronRight size={32} />
        </button>

        <div 
          ref={photoScrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 pt-2 scrollbar-hide scroll-smooth items-center px-4 md:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {clientPhotos.map((photo, index) => (
            <div 
              key={index} 
              className="snap-center shrink-0 h-[280px] sm:h-[350px] md:h-[450px] lg:h-[550px] rounded-xl md:rounded-3xl overflow-hidden border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-[#0a0a0a] group relative"
            >
              {/* Overlay suave nas fotos */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
              
              <img 
                src={photo} 
                alt={`Foto de cliente ${index + 1}`} 
                className="h-full w-auto object-contain scale-100 group-hover:scale-105 transition-transform duration-700 ease-in-out"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Masonry Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
            O Que <span className="text-green-500">Eles Estão Dizendo</span>
          </h2>
        </div>
        
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="break-inside-avoid bg-[#111111] border border-white/5 rounded-2xl p-6 relative group hover:border-green-500/30 transition-colors duration-500 overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote size={48} className="text-green-500" />
              </div>
              
              <div className="flex items-start gap-4 mb-5 relative z-10">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                />
                <div>
                  <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    {testimonial.name}
                    {testimonial.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </h4>
                  <p className="text-neutral-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex text-green-500 mb-4 relative z-10">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < testimonial.rating ? 'fill-current' : 'text-neutral-700'}`} 
                  />
                ))}
              </div>
              
              <p className="text-neutral-300 leading-relaxed mb-6 relative z-10 text-sm md:text-base flex-1">
                "{testimonial.text}"
              </p>
              
              <div className="text-xs text-neutral-600 font-medium relative z-10 mt-2 pt-4 border-t border-white/5">
                {testimonial.date}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="max-w-4xl mx-auto px-4 mt-24 text-center">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-green-500/20 rounded-3xl p-10 md:p-14 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full"></div>
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4 relative z-10">
            Junte-se a Nossa Comunidade
          </h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto relative z-10">
            Garanta seus produtos com a qualidade e segurança que só a Black Core oferece. Sua próxima grande experiência começa aqui.
          </p>
          <button className="bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-wider text-sm px-8 py-4 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] relative z-10">
            Ver Produtos
          </button>
        </div>
      </div>

    </div>
  );
};
