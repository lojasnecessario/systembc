import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { ProductCard } from '../../components/storefront/ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  main_image: string | null;
  price: number;
  promotional_price: number | null;
  is_new: boolean;
}

export const AllProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, main_image, price, promotional_price, is_new')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Erro ao buscar todos os produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0d0a] text-[#eef4ea] pt-24 px-4 md:px-8 pb-20">
      <div className="max-w-[1400px] mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#8b977f] hover:text-[#33e36a] transition-colors mb-8 font-bold uppercase text-sm tracking-widest">
          <ArrowLeft size={16} />
          <span>Voltar para a Home</span>
        </Link>
        
        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-10 bg-[#141A12] rounded w-1/3"></div>
            <div className="h-4 bg-[#141A12] rounded w-1/4 mt-2"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-[#141A12] rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-10 border-b border-[#1b241a] pb-6">
              <h1 className="text-3xl md:text-5xl font-heading font-bold mb-3 uppercase tracking-tight">
                TODOS OS PRODUTOS
              </h1>
              <p className="text-[#8b977f] text-sm md:text-base">
                Explore todo o nosso catálogo de games, eletrônicos e acessórios.
              </p>
            </div>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-[#141A12] rounded-xl border border-[#1b241a] border-dashed">
                <Gamepad2 size={48} className="text-[#363f31] mb-4" />
                <h3 className="text-xl font-heading font-bold text-[#eef4ea] mb-2">Nenhum produto encontrado</h3>
                <p className="text-[#8b977f] text-center max-w-md">
                  Ainda não temos produtos cadastrados. Fique de olho, novidades chegam sempre!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
