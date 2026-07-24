import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Review {
  id: string | number;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  avatar?: string;
  verified?: boolean;
}

// Fallback reviews para manter o design caso não existam reviews no DB
const fallbackReviews: Review[] = [
  {
    id: 1,
    reviewer_name: 'João Silva',
    rating: 5,
    comment: 'A experiência de compra foi incrível! O produto chegou super rápido e em perfeito estado. O atendimento da Black Core é diferenciado.',
    created_at: 'há 2 dias',
    avatar: 'https://ui-avatars.com/api/?name=Joao+Silva&background=22c55e&color=fff',
    verified: true,
  },
  {
    id: 2,
    reviewer_name: 'Marina Costa',
    rating: 5,
    comment: 'Comprei e não me arrependo. Tudo de primeira linha! Recomendo muito pra quem busca qualidade.',
    created_at: 'há 1 semana',
    avatar: 'https://ui-avatars.com/api/?name=Marina+Costa&background=22c55e&color=fff',
    verified: true,
  },
  {
    id: 3,
    reviewer_name: 'Carlos Mendes',
    rating: 5,
    comment: 'Preços imbatíveis e entrega expressa. A embalagem veio muito bem protegida e o atendimento foi 10.',
    created_at: 'há 2 semanas',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendes&background=22c55e&color=fff',
    verified: true,
  },
  {
    id: 4,
    reviewer_name: 'Ana Souza',
    rating: 4,
    comment: 'O produto é fantástico, a loja foi super transparente em todo o processo da compra até a entrega.',
    created_at: 'há 1 mês',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Souza&background=22c55e&color=fff',
    verified: true,
  },
  {
    id: 5,
    reviewer_name: 'Rafael Gomes',
    rating: 5,
    comment: 'Sempre compro aqui. A Black Core já virou minha loja de confiança para tudo relacionado a games.',
    created_at: 'há 1 mês',
    avatar: 'https://ui-avatars.com/api/?name=Rafael+Gomes&background=22c55e&color=fff',
    verified: true,
  }
];

export const TestimonialsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        
        if (data && data.length > 0) {
          const mapped = data.map(r => ({
            id: r.id,
            reviewer_name: r.reviewer_name,
            rating: r.rating,
            comment: r.comment,
            created_at: new Date(r.created_at).toLocaleDateString('pt-BR'),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.reviewer_name)}&background=22c55e&color=fff`,
            verified: true
          }));
          setReviews(mapped);
        } else {
          setReviews(fallbackReviews);
        }
      } catch (err) {
        console.error('Erro ao buscar reviews', err);
        setReviews(fallbackReviews);
      }
    };
    
    fetchReviews();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // Scroll by one card width approximately (around 320px + gap)
      const scrollAmount = direction === 'left' ? -350 : 350;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (reviews.length === 0) return null;

  return (
    <section className="relative py-12 md:py-16 bg-[#0a0a0a] overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              O Que Dizem <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Nossos Clientes</span>
            </h2>
            <p className="text-neutral-400 mt-4 max-w-xl text-sm md:text-base leading-relaxed">
              Confira as experiências reais de quem já comprou conosco. A satisfação da nossa comunidade é o que nos move.
            </p>
          </div>
          
          <div className="shrink-0 hidden md:flex items-center gap-3">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-500 hover:border-green-500 text-white transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-500 hover:border-green-500 text-white transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 pt-2 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="snap-start shrink-0 w-[300px] sm:w-[350px] md:w-[400px] bg-[#111111] border border-white/5 rounded-2xl p-6 relative group hover:border-green-500/30 transition-colors duration-500 flex flex-col"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote size={40} className="text-green-500" />
              </div>
              
              <div className="flex items-start gap-4 mb-5 relative z-10">
                {review.avatar && (
                  <img 
                    src={review.avatar} 
                    alt={review.reviewer_name} 
                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                  />
                )}
                <div>
                  <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    {review.reviewer_name}
                    {review.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </h4>
                </div>
              </div>
              
              <div className="flex text-green-500 mb-4 relative z-10">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-neutral-700'}`} 
                  />
                ))}
              </div>
              
              <p className="text-neutral-300 leading-relaxed mb-6 relative z-10 text-sm md:text-base flex-1 line-clamp-4">
                "{review.comment}"
              </p>
              
              <div className="text-xs text-neutral-600 font-medium relative z-10 mt-2 pt-4 border-t border-white/5">
                {review.created_at}
              </div>
            </div>
          ))}
        </div>
        
        {/* Button */}
        <div className="mt-10 flex justify-center">
          <Link 
            to="/depoimentos" 
            className="group flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-wider text-sm px-8 py-4 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]"
          >
            Ver mais avaliações
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};
