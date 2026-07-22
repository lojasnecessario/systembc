import React, { useState, useEffect } from 'react';
import { Hero } from '../../components/storefront/Hero';
import { BrandSlider } from '../../components/storefront/BrandSlider';
import { StoreAdvantages } from '../../components/storefront/StoreAdvantages';
import { CategoryList } from '../../components/storefront/CategoryList';
import { ProductGridSection } from '../../components/storefront/ProductGridSection';
import { AboutSection } from '../../components/storefront/AboutSection';
import { HighlightsSection } from '../../components/storefront/HighlightsSection';
import { FeaturedProducts } from '../../components/storefront/FeaturedProducts';
import { supabase } from '../../lib/supabase';

export const Home: React.FC = () => {
  const [grids, setGrids] = useState<any[]>([]);

  useEffect(() => {
    const fetchGrids = async () => {
      try {
        const { data: gridsData, error } = await supabase
          .from('product_grids')
          .select('id, title, category_id, categories(slug), order_grid')
          .eq('is_active', true)
          .order('order_grid', { ascending: true });

        if (error) throw error;

        if (gridsData && gridsData.length > 0) {
          // Para cada grid, buscar os itens
          const gridsWithItems = await Promise.all(gridsData.map(async (grid) => {
            const { data: items } = await supabase
              .from('product_grid_items')
              .select('id, order_index, products(id, name, slug, main_image, price, promotional_price, is_new)')
              .eq('grid_id', grid.id)
              .order('order_index', { ascending: true });

            return {
              ...grid,
              items: items?.map(item => ({
                id: item.id,
                order_index: item.order_index,
                product: Array.isArray(item.products) ? item.products[0] : item.products
              })) || []
            };
          }));
          
          setGrids(gridsWithItems);
        }
      } catch (error) {
        console.error('Erro ao buscar vitrines:', error);
      }
    };

    fetchGrids();
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-[#06120d] via-black to-[#020604] min-h-screen">
      <div className="relative">
        <Hero />
        <div className="absolute bottom-0 left-0 w-full z-20">
          <BrandSlider />
        </div>
      </div>
      
      <CategoryList />
      
      {/* Vitrines Dinâmicas (Grids) */}
      {grids.length > 0 && (
        <div className="relative border-t border-b border-[#11381b]/50 mt-4 mb-4">
          {/* Degrades de Fundo (Início e Fim) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#0c3116]/80 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-[#0c3116]/80 to-transparent" />
          </div>
          
          <div className="relative z-10">
            {grids.map(grid => (
              <ProductGridSection key={grid.id} grid={grid} />
            ))}
          </div>
        </div>
      )}
      
      {/* Seção Sobre Nós */}
      <AboutSection />
      
      {/* Seção de Destaques (Promoção) */}
      <HighlightsSection />
      
      {/* Produtos em Destaque */}
      <FeaturedProducts />
      
      {/* Seção de Vantagens na Última Posição */}
      <StoreAdvantages />
      
    </div>
  );
};

