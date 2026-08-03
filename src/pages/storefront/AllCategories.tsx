import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Image as ImageIcon, 
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

export const AllCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, image, icon, order_grid')
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

  const getCategoryIcon = (category: Category) => {
    const iconProps = { size: 40, strokeWidth: 1.5, className: "text-[#33e36a] group-hover/card:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(51,227,106,0.5)]" };
    
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

  return (
    <div className="w-full bg-[#0a0d0a] min-h-screen pt-28 md:pt-40 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-8">
        <h1 className="text-3xl md:text-5xl font-heading font-black text-[#eef4ea] uppercase tracking-tighter mb-4">
          Nossas Categorias
        </h1>
        <p className="text-[#8b977f] text-sm md:text-base max-w-2xl">
          Encontre os melhores produtos por categoria. Navegue pelas opções abaixo e descubra grandes opções com descontos imbatíveis.
        </p>
      </div>
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-12">
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 border-4 border-[#33e36a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categoria/${category.slug}`}
                className="flex flex-col bg-gradient-to-b from-[#111612] to-[#0a0d0a] border border-[#1b241a] rounded-2xl overflow-hidden group/card hover:border-[#33e36a]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(51,227,106,0.15)] relative h-[240px] md:h-[280px]"
              >
                {/* Glow de fundo no Hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#33e36a]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                
                {/* Imagem (Top) */}
                <div className="h-[140px] md:h-[160px] w-full relative z-10 overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                    />
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
                <div className="flex-1 flex flex-col items-center justify-center gap-2 md:gap-3 relative z-10 shrink-0 px-2 md:px-4 pb-3 md:pb-4 mt-1 md:mt-2">
                  <div className="flex flex-col items-center gap-1.5 md:gap-2">
                    {getCategoryIcon(category)}
                    <div className="w-6 md:w-8 h-[2px] bg-[#33e36a]/30 group-hover/card:bg-[#33e36a] rounded-full transition-colors duration-300 mt-1"></div>
                  </div>
                  <h3 className="text-[11px] md:text-sm font-heading font-bold text-[#eef4ea] group-hover/card:text-white transition-colors duration-300 text-center uppercase tracking-[0.1em] line-clamp-2 w-full">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
