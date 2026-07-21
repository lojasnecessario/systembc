import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        // Buscar categoria
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id, name')
          .eq('slug', slug)
          .single();

        if (categoryError) throw categoryError;
        setCategoryName(categoryData?.name || null);

        // Buscar produtos desta categoria
        if (categoryData?.id) {
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('id, name, slug, main_image, price, promotional_price, is_new')
            .eq('category_id', categoryData.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (productsError) throw productsError;
          setProducts(productsData || []);
        }
      } catch (error) {
        console.error('Erro ao buscar dados da categoria:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug]);

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
        ) : categoryName ? (
          <div>
            <div className="mb-10 border-b border-[#1b241a] pb-6">
              <h1 className="text-3xl md:text-5xl font-heading font-bold mb-3 uppercase tracking-tight">
                {categoryName}
              </h1>
              <p className="text-[#8b977f] text-sm md:text-base">
                Explorando todos os jogos disponíveis na categoria {categoryName}.
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
                <h3 className="text-xl font-heading font-bold text-[#eef4ea] mb-2">Nenhum jogo encontrado</h3>
                <p className="text-[#8b977f] text-center max-w-md">
                  Ainda não temos jogos cadastrados nesta categoria. Fique de olho, novidades chegam sempre!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#141A12] rounded-xl border border-[#1b241a]">
            <h1 className="text-3xl font-heading font-bold text-[#eef4ea] mb-4 uppercase">Categoria não encontrada</h1>
            <p className="text-[#8b977f]">A categoria que você está procurando não existe ou foi removida do sistema.</p>
          </div>
        )}
      </div>
    </div>
  );
};
