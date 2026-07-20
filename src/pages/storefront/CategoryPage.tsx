import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setCategoryName(data?.name || null);
      } catch (error) {
        console.error('Erro ao buscar categoria:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={20} />
          <span>Voltar para a Home</span>
        </Link>
        
        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-12 bg-slate-800 rounded w-1/3"></div>
            <div className="h-64 bg-slate-800 rounded w-full mt-8"></div>
          </div>
        ) : categoryName ? (
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{categoryName}</h1>
            <p className="text-slate-400 text-lg mb-12">Explorando produtos da categoria {categoryName}.</p>
            
            <div className="flex items-center justify-center h-64 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
              <p className="text-slate-500">A listagem de produtos virá aqui nas próximas fases...</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-slate-300 mb-4">Categoria não encontrada</h1>
            <p className="text-slate-500">A categoria que você está procurando não existe ou foi removida.</p>
          </div>
        )}
      </div>
    </div>
  );
};
