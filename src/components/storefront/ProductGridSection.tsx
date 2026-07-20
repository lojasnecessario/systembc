import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
  if (!grid.items || grid.items.length === 0) return null;

  // Link para 'Ver Todos'
  // Se tiver category_id e slug, aponta para a categoria. Senão, pode não mostrar ou ir pra geral.
  const viewAllLink = grid.category_id && grid.categories?.slug 
    ? `/categoria/${grid.categories.slug}` 
    : null;

  return (
    <section className="w-full py-12 px-4 md:px-8 bg-black">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-white/10 pb-4">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            {grid.title}
          </h2>
          
          {viewAllLink && (
            <Link 
              to={viewAllLink}
              className="group hidden md:flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-green-500 transition-colors uppercase tracking-widest"
            >
              Ver todos os jogos
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {grid.items.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
        
        {/* Ver Todos no Mobile */}
        {viewAllLink && (
          <div className="mt-8 text-center md:hidden">
            <Link 
              to={viewAllLink}
              className="inline-flex items-center justify-center gap-2 text-sm font-bold bg-[#1a1a1a] text-white w-full py-4 rounded-xl active:bg-[#222] transition-colors border border-white/5 uppercase"
            >
              Ver todos os jogos
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
