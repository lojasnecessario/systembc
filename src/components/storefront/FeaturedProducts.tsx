import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ProductCard } from './ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, main_image, price, promotional_price, is_new')
          .eq('is_featured', true)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Erro ao buscar produtos em destaque:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <section className="relative py-12 md:py-16 bg-[#0a0a0a] overflow-hidden">
      {/* Elementos de background decorativos */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles size={14} className="animate-pulse" />
              Seleção Premium
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Produtos em <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Destaque</span>
            </h2>
            <p className="text-neutral-400 mt-4 max-w-xl text-sm md:text-base leading-relaxed">
              Os títulos mais aclamados e cobiçados do momento, escolhidos a dedo para elevar o nível da sua gameplay.
            </p>
          </div>
          
          <div className="shrink-0 hidden md:block">
            <Link 
              to="/categoria/todos" 
              className="group flex items-center gap-2 text-sm font-bold text-white hover:text-green-400 transition-colors"
            >
              Ver todos os jogos
              <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-green-500/10 group-hover:border-green-500/30 transition-all">
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>

        {/* Grid de Produtos Dinâmico */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <div 
              key={product.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
        {/* Botão Mobile */}
        <div className="mt-10 flex justify-center md:hidden">
          <Link 
            to="/categoria/todos" 
            className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-colors"
          >
            Ver todos os jogos
            <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </section>
  );
};
