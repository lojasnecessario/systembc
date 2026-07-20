import React, { useState, useEffect } from 'react';
import { Hero } from '../../components/storefront/Hero';
import { StoreAdvantages } from '../../components/storefront/StoreAdvantages';
import { CategoryList } from '../../components/storefront/CategoryList';
import { ProductGridSection } from '../../components/storefront/ProductGridSection';
import { AboutSection } from '../../components/storefront/AboutSection';
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
    <div className="w-full bg-black">
      <Hero />
      
      {/* Slider Animado de Vantagens */}
      <StoreAdvantages />
      
      <CategoryList />
      
      {/* Vitrines Dinâmicas (Grids) */}
      {grids.map(grid => (
        <ProductGridSection key={grid.id} grid={grid} />
      ))}
      
      {/* Seção Sobre Nós */}
      <AboutSection />
      
      {/* Produtos em Destaque */}
      <FeaturedProducts />
      
    </div>
  );
};

