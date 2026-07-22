import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  order_grid: number;
}

export const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, image, order_grid')
          .eq('is_active', true)
          .order('order_grid', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="w-full pt-8 pb-2 md:pb-4 px-4 md:px-8 bg-[#0a0d0a]">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-[#33e36a] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full pt-8 pb-2 md:pb-4 px-4 md:px-8 bg-[#0a0d0a] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10 group">
        <div className="mb-4 text-center">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-[#eef4ea] uppercase tracking-tight">
            Categorias em <span className="text-[#33e36a]">Destaque</span>
          </h2>
        </div>

        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar scroll-smooth"
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categoria/${category.slug}`}
                className="flex-shrink-0 w-[100px] md:w-[120px] flex flex-col items-center gap-3 group/card snap-center"
              >
                {/* Container da Imagem */}
                <div className="relative w-full aspect-square flex items-center justify-center rounded-full transition-all duration-500 group-hover/card:bg-[#33e36a]">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-[85%] h-[85%] object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover/card:scale-125 group-hover/card:-translate-y-4 group-hover/card:drop-shadow-[0_25px_25px_rgba(0,0,0,0.8)]"
                    />
                  ) : (
                    <ImageIcon size={40} className="text-[#6b7563] group-hover/card:text-[#0a0d0a] transition-colors duration-300" />
                  )}
                </div>
                
                {/* Título */}
                <h3 className="text-[11px] md:text-sm font-heading font-bold text-[#eef4ea] group-hover/card:text-[#33e36a] transition-colors duration-300 text-center uppercase tracking-wide">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>

          {/* Navegação do Slider */}
          <button 
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#141A12] border border-[#1b241a] hover:border-[#33e36a] hover:bg-[#1a2217] rounded-full items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20 shadow-lg"
          >
            <ChevronLeft size={24} className="text-[#eef4ea] hover:text-[#33e36a]" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#141A12] border border-[#1b241a] hover:border-[#33e36a] hover:bg-[#1a2217] rounded-full items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20 shadow-lg"
          >
            <ChevronRight size={24} className="text-[#eef4ea] hover:text-[#33e36a]" />
          </button>
        </div>
      </div>
    </section>
  );
};
