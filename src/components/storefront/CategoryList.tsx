import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight,
  Gamepad,
  Headset,
  Gamepad2,
  Joystick,
  Monitor,
  Computer,
  Smartphone,
  Mouse,
  Keyboard,
  Cpu
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  icon?: string | null;
  order_grid: number;
}

const CategoryImage = ({ src, alt, priority }: { src: string; alt: string; priority: boolean }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b241a] to-[#0a0d0a] animate-pulse z-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#33e36a]/20 border-t-[#33e36a]/80 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 group-hover/card:scale-110 ${loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}
      />
    </>
  );
};

let cachedCategories: Category[] | null = null;

export const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(cachedCategories || []);
  const [loading, setLoading] = useState(!cachedCategories);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cachedCategories) return;

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, image, icon, order_grid')
          .eq('is_active', true)
          .order('order_grid', { ascending: true });

        if (error) throw error;
        cachedCategories = data || [];
        setCategories(cachedCategories);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getCategoryIcon = (category: Category) => {
    const iconProps = { size: 32, strokeWidth: 1.5, className: "text-[#33e36a] group-hover/card:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(51,227,106,0.5)]" };
    
    // Se o ícone foi selecionado no admin, usa-o com prioridade
    if (category.icon) {
      switch (category.icon) {
        case 'Gamepad': return <Gamepad {...iconProps} />;
        case 'Gamepad2': return <Gamepad2 {...iconProps} />;
        case 'Headset': return <Headset {...iconProps} />;
        case 'Monitor': return <Monitor {...iconProps} />;
        case 'Computer': return <Computer {...iconProps} />;
        case 'Joystick': return <Joystick {...iconProps} />;
        case 'Smartphone': return <Smartphone {...iconProps} />;
        case 'Cpu': return <Cpu {...iconProps} />;
        case 'Mouse': return <Mouse {...iconProps} />;
        case 'Keyboard': return <Keyboard {...iconProps} />;
      }
    }

    // Fallback: se não tiver ícone salvo no banco, adivinha pelo slug
    const s = category.slug.toLowerCase();
    
    if (s.includes('console')) return <Gamepad {...iconProps} />;
    if (s.includes('gadget') || s.includes('audio') || s.includes('headset')) return <Headset {...iconProps} />;
    if (s.includes('eletronico') || s.includes('hardware') || s.includes('placa')) return <Monitor {...iconProps} />;
    if (s.includes('jogo') || s.includes('game')) return <Gamepad2 {...iconProps} />;
    if (s.includes('joystick') || s.includes('controle')) return <Joystick {...iconProps} />;
    if (s.includes('pc') || s.includes('computador') || s.includes('desktop')) return <Computer {...iconProps} />;
    if (s.includes('celular') || s.includes('smartphone')) return <Smartphone {...iconProps} />;
  
    return <ImageIcon {...iconProps} />;
  };

  if (loading) {
    return (
      <section className="w-full pt-8 pb-2 md:pb-4 px-4 md:px-8 bg-[#0a0d0a]">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-[#33e36a] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full pt-8 pb-8 px-4 md:px-8 bg-[#0a0d0a] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10 group">
        
        {/* Título com linhas decorativas */}
        <div className="mb-10 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center gap-4 w-full">
            <div className="h-[1px] w-12 md:w-32 bg-gradient-to-r from-transparent to-[#1b241a] md:to-[#33e36a]/30"></div>
            <h2 className="text-xl md:text-3xl font-heading font-bold text-[#eef4ea] uppercase tracking-tight text-center flex-shrink-0">
              Categorias em <span className="text-[#33e36a]">Destaque</span>
            </h2>
            <div className="h-[1px] w-12 md:w-32 bg-gradient-to-l from-transparent to-[#1b241a] md:to-[#33e36a]/30"></div>
          </div>
        </div>

        <div className="relative px-2 md:px-8">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 md:gap-6 pb-6 pt-2 snap-x hide-scrollbar scroll-smooth"
          >
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/categoria/${category.slug}`}
                className="flex-shrink-0 w-[140px] md:w-[170px] h-[240px] md:h-[280px] flex flex-col bg-gradient-to-b from-[#111612] to-[#0a0d0a] border border-[#1b241a] rounded-2xl overflow-hidden group/card hover:border-[#33e36a]/50 transition-all duration-300 snap-center hover:shadow-[0_0_20px_rgba(51,227,106,0.15)] relative"
              >
                {/* Glow de fundo no Hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#33e36a]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                
                {/* Imagem (Top) */}
                <div className="h-[150px] md:h-[190px] w-full relative z-10 overflow-hidden bg-[#111612]">
                  {category.image ? (
                    <CategoryImage src={category.image} alt={category.name} priority={index < 5} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#111612]">
                      <ImageIcon size={40} className="text-[#1b241a]" />
                    </div>
                  )}
                  {/* Gradiente para suavizar a transição inferior */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0d0a] to-transparent pointer-events-none"></div>
                </div>
                
                {/* Linha Divisória */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#1b241a] group-hover/card:via-[#33e36a]/30 to-transparent relative z-10 shrink-0"></div>
                
                {/* Ícone e Nome (Bottom) */}
                <div className="flex-1 flex flex-col items-center justify-center gap-2 relative z-10 shrink-0 px-2 pb-2">
                  <div className="flex flex-col items-center gap-1.5">
                    {getCategoryIcon(category)}
                    <div className="w-6 h-[2px] bg-[#33e36a]/30 group-hover/card:bg-[#33e36a] rounded-full transition-colors duration-300 mt-1"></div>
                  </div>
                  <h3 className="text-[10px] md:text-xs font-heading font-bold text-[#eef4ea] group-hover/card:text-white transition-colors duration-300 text-center uppercase tracking-[0.1em] line-clamp-1 w-full">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {/* Navegação do Slider */}
          <button 
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0a0d0a] border border-[#1b241a] hover:border-[#33e36a] hover:bg-[#111612] rounded-full items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20 shadow-[0_0_15px_rgba(0,0,0,0.5)] -ml-4"
          >
            <ChevronLeft size={24} className="text-[#eef4ea] hover:text-[#33e36a]" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0a0d0a] border border-[#1b241a] hover:border-[#33e36a] hover:bg-[#111612] rounded-full items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20 shadow-[0_0_15px_rgba(0,0,0,0.5)] -mr-4"
          >
            <ChevronRight size={24} className="text-[#eef4ea] hover:text-[#33e36a]" />
          </button>
        </div>
      </div>
    </section>
  );
};

