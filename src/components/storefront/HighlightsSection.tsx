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
          let parsedConfig = {
            title: 'TEM OPÇÃO PRA TODO BOLSO',
            subtitle: 'Escolha quanto quer gastar e a gente mostra os melhores produtos naquela faixa.',
            tagText: '% COMPRE POR FAIXA DE PREÇO',
            cards: [] as { image: string, link: string }[]
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

  if (loading || !highlightData) {
    return null;
  }

  const { image, link, config } = highlightData;

  // Use cards from config, or fallback to the legacy single image if no cards exist
  let validCards = config.cards?.filter((c: any) => c.image) || [];
  if (validCards.length === 0 && image) {
    validCards = [{ image, link }];
  }

  if (validCards.length === 0) {
    return null; // Nada para exibir
  }

  // No longer need gridColsClass for flex layout

  return (
    <section className="w-full py-8 md:py-12 bg-[#06120d] relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Textos Acima do Banner */}
        <div className="max-w-4xl mb-8 md:mb-12">
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

        {/* Banners Flex Container */}
        <div className="flex flex-col md:flex-row flex-wrap gap-6 md:gap-8 justify-start items-start">
          {validCards.map((card: any, index: number) => {
            const content = (
              <div className="rounded-2xl overflow-hidden relative group w-full md:w-[240px] lg:w-[280px] xl:w-[320px] shrink-0 bg-slate-900 border border-white/10 hover:border-green-500/50 transition-colors duration-500 shadow-lg aspect-[2/1] md:aspect-square flex flex-col justify-end">
                <picture className="absolute inset-0 w-full h-full">
                  {card.mobileImage && (
                    <source media="(max-width: 767px)" srcSet={card.mobileImage} />
                  )}
                  <img 
                    src={card.image} 
                    alt={`${config.title} - Banner ${index + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </picture>
                
                {/* Gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                
                {/* Text Overlay */}
                <div className="relative z-10 p-5 md:p-6 flex flex-col items-start w-full">
                  {card.tag && (
                    <span className="bg-green-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider mb-2 shadow-sm">
                      {card.tag}
                    </span>
                  )}
                  {card.title && (
                    <h3 className="text-white text-base md:text-lg font-black uppercase leading-tight mb-1">
                      {card.title}
                    </h3>
                  )}
                  {card.highlight && (
                    <div className="text-green-500 text-2xl md:text-3xl font-black uppercase tracking-tight drop-shadow-md mb-2 md:mb-3">
                      {card.highlight}
                    </div>
                  )}
                  {card.buttonText && (
                    <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold text-[10px] md:text-xs uppercase px-3 py-1.5 md:px-4 md:py-2 rounded md:rounded-full hover:bg-white hover:text-black transition-all duration-300">
                      {card.buttonText} &rarr;
                    </div>
                  )}
                </div>
              </div>
            );

            if (card.link) {
              return (
                <Link key={index} to={card.link} className="block w-full md:w-auto">
                  {content}
                </Link>
              );
            }

            return (
              <div key={index} className="block w-full md:w-auto">
                {content}
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
};

