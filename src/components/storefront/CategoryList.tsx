import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Image as ImageIcon } from 'lucide-react';

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

  if (loading) {
    return (
      <section className="w-full py-16 px-4 md:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null; // Não exibe a seção se não houver categorias ativas
  }

  return (
    <section className="w-full py-20 px-4 md:px-8 bg-black relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-14 flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Explore por <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Categoria</span></h2>
          <p className="text-neutral-400 text-lg max-w-2xl">Encontre exatamente o que você procura para elevar seu setup com nossos departamentos especializados.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categoria/${category.slug}`}
              className="group relative flex flex-col items-center justify-center rounded-3xl bg-neutral-900/40 backdrop-blur-md border border-white/5 p-8 transition-all duration-500 hover:-translate-y-2 hover:bg-neutral-800/60 hover:shadow-[0_0_40px_-10px_rgba(34,197,94,0.15)] hover:border-green-500/20 overflow-hidden"
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative w-28 h-28 mb-6 rounded-2xl overflow-hidden bg-black/50 flex items-center justify-center shadow-inner group-hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-shadow duration-500">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <ImageIcon size={36} className="text-neutral-500 group-hover:text-green-400 transition-colors duration-500" />
                )}
              </div>
              
              <h3 className="text-lg md:text-xl font-bold text-neutral-200 group-hover:text-white transition-colors duration-500 text-center">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
