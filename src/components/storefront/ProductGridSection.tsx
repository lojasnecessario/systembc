import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ListFilter, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  main_image: string | null;
  price: number;
  promotional_price: number | null;
  is_new: boolean;
}

interface GridItem {
  id: string;
  order_index: number;
  product: Product;
}

interface Grid {
  id: string;
  title: string;
  category_id: string | null;
  categories?: { slug: string };
  items: GridItem[];
}

export const ProductGridSection: React.FC<{ grid: Grid }> = ({ grid }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!grid.items || grid.items.length === 0) return null;

  const viewAllLink = grid.category_id && grid.categories?.slug 
    ? `/categoria/${grid.categories.slug}` 
    : null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full pt-6 pb-8 md:pt-10 md:pb-16 px-4 md:px-8 relative bg-transparent">


      <div className="max-w-[1400px] mx-auto relative z-10 group">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#16A34A] text-[13px] font-bold uppercase tracking-wider">🚀</span>
              <span className="text-[#16A34A] text-[13px] font-bold uppercase tracking-wider">
                BOMBANDO NO SITE AGORA
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-[#eae8e8] uppercase tracking-tighter mb-1">
              {grid.title}
            </h2>
            <p className="text-[#fefbfb] opacity-80 text-sm md:text-base max-w-xl font-medium">
              Os games que tão saindo igual água. Preço imbatível, é só correr pro abraço.
            </p>
          </div>
          
          {viewAllLink && (
            <Link 
              to={viewAllLink}
              className="hidden md:flex items-center gap-2 bg-[#141A12] border border-[#1b241a] hover:border-[#33e36a] text-[#eef4ea] px-6 py-3 rounded-lg transition-colors font-bold text-sm uppercase tracking-wider"
            >
              <ListFilter size={18} />
              Ver todos
            </Link>
          )}
        </div>

        {/* Grade de Produtos (Slider) */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x hide-scrollbar scroll-smooth"
          >
            {grid.items.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-[200px] md:w-[280px] snap-center">
                <ProductCard product={item.product} />
              </div>
            ))}
          </div>

          {/* Navegação do Slider */}
          <button 
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-5 top-[40%] -translate-y-1/2 w-12 h-12 bg-[#141A12] border border-[#1b241a] hover:border-[#33e36a] hover:bg-[#1a2217] rounded-full items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20 shadow-lg"
          >
            <ChevronLeft size={24} className="text-[#eef4ea] hover:text-[#33e36a]" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-5 top-[40%] -translate-y-1/2 w-12 h-12 bg-[#141A12] border border-[#1b241a] hover:border-[#33e36a] hover:bg-[#1a2217] rounded-full items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20 shadow-lg"
          >
            <ChevronRight size={24} className="text-[#eef4ea] hover:text-[#33e36a]" />
          </button>
        </div>
        
        {/* Botão Ver Todos Mobile */}
        {viewAllLink && (
          <div className="mt-8 md:hidden">
            <Link 
              to={viewAllLink}
              className="flex items-center justify-center gap-2 bg-[#141A12] border border-[#1b241a] text-[#eef4ea] w-full py-4 rounded-xl transition-colors font-bold text-sm uppercase"
            >
              <ListFilter size={18} />
              Ver todos
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
