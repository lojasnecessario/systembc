import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

const HIGHLIGHT_BANNER_TITLE = '__DESTAQUE_PRINCIPAL__';

export const HighlightsSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [highlightData, setHighlightData] = useState<any>(null);

  useEffect(() => {
    const fetchHighlight = async () => {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('title', HIGHLIGHT_BANNER_TITLE)
          .eq('is_active', true)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          // Parse as configurações extras que salvamos no subtitle
          let parsedConfig = {
            title: 'TEM JOGO PRA TODO BOLSO',
            subtitle: 'Escolha quanto quer gastar e a gente mostra os melhores títulos naquela faixa.',
            tagText: '% COMPRE POR FAIXA DE PREÇO'
          };
          
          try {
            if (data.subtitle) {
              const parsed = JSON.parse(data.subtitle);
              parsedConfig = { ...parsedConfig, ...parsed };
            }
          } catch (e) {
            // Se falhar o parse, usa os defaults
          }

          setHighlightData({
            ...data,
            config: parsedConfig
          });
        }
      } catch (error) {
        console.error('Erro ao buscar destaques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlight();
  }, []);

  if (loading || !highlightData || !highlightData.image) {
    return null;
  }

  const { image, link, config } = highlightData;

  const content = (
    <div className="rounded-2xl overflow-hidden relative group w-full bg-slate-900 border border-white/10 hover:border-green-500/50 transition-colors duration-500 shadow-lg" style={{ aspectRatio: '2/1' }}>
      <img 
        src={image} 
        alt={config.title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      />
    </div>
  );

  return (
    <section className="py-16 md:py-24 bg-[#050505] relative border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Textos Acima do Banner */}
        <div className="max-w-4xl mb-8">
          {config.tagText && (
            <div className="text-green-500 font-bold tracking-wider text-xs md:text-sm uppercase mb-3 inline-flex items-center gap-2">
              <span className="w-8 h-[2px] bg-green-500 rounded-full"></span>
              {config.tagText}
            </div>
          )}
          
          {config.title && (
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight uppercase">
              {config.title}
            </h2>
          )}
          
          {config.subtitle && (
            <p className="text-neutral-400 mt-4 text-sm md:text-base max-w-2xl font-medium">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* Banner com Link */}
        {link ? (
          <Link to={link} className="block mt-10">
            {content}
          </Link>
        ) : (
          <div className="block mt-10">
            {content}
          </div>
        )}
        
      </div>
    </section>
  );
};
