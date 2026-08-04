import React, { useState, useEffect, lazy } from 'react';
import { Hero } from '../../components/storefront/Hero';
import { BrandSlider } from '../../components/storefront/BrandSlider';
import { CategoryList } from '../../components/storefront/CategoryList';
import { supabase } from '../../lib/supabase';
import { LazySection } from '../../components/LazySection';

// Seções abaixo da dobra carregadas via Code Splitting + IntersectionObserver
const ProductGridSection = lazy(() => import('../../components/storefront/ProductGridSection').then(m => ({ default: m.ProductGridSection })));
const HighlightsSection = lazy(() => import('../../components/storefront/HighlightsSection').then(m => ({ default: m.HighlightsSection })));
const AboutSection = lazy(() => import('../../components/storefront/AboutSection').then(m => ({ default: m.AboutSection })));
const TestimonialsSection = lazy(() => import('../../components/storefront/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
const StoreAdvantages = lazy(() => import('../../components/storefront/StoreAdvantages').then(m => ({ default: m.StoreAdvantages })));

let cachedGrids: any[] | null = null;

export const Home: React.FC = () => {
  const [grids, setGrids] = useState<any[]>(cachedGrids || []);

  useEffect(() => {
    if (cachedGrids) return;

    const fetchGrids = async () => {
      try {
        const { data: gridsData, error } = await supabase
          .from('product_grids')
          .select('id, title, category_id, categories(slug), order_grid')
          .eq('is_active', true)
          .order('order_grid', { ascending: true });

        if (error) throw error;

        if (gridsData && gridsData.length > 0) {
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
          
          cachedGrids = gridsWithItems;
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
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-0 left-0 w-[150px] md:w-[300px] h-full bg-gradient-to-r from-[#0c3116]/90 to-transparent" />
          </div>
          
          <div className="relative z-10">
            {grids.map((grid, index) => (
              index === 0 ? (
                <ProductGridSection key={grid.id} grid={grid} />
              ) : (
                <LazySection key={grid.id} height="600px">
                  <ProductGridSection grid={grid} />
                </LazySection>
              )
            ))}
          </div>
        </div>
      )}
      
      {/* Seção de Destaques (Promoção) */}
      <LazySection height="400px">
        <HighlightsSection />
      </LazySection>
      
      {/* Seção Sobre Nós */}
      <LazySection height="600px">
        <AboutSection />
      </LazySection>
      
      {/* Avaliações / Depoimentos */}
      <LazySection height="500px">
        <TestimonialsSection />
      </LazySection>
      
      {/* Seção de Vantagens na Última Posição */}
      <LazySection height="300px">
        <StoreAdvantages />
      </LazySection>
      
    </div>
  );
};

