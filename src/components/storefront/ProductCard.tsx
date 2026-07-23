import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Star, StarHalf, Truck, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    main_image: string | null;
    price: number;
    promotional_price: number | null;
    is_new?: boolean;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const hasDiscount = product.promotional_price !== null && product.promotional_price < product.price;
  const currentPrice = hasDiscount ? product.promotional_price! : product.price;
  
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - currentPrice) / product.price) * 100)
    : 0;
    
  const pixPrice = currentPrice * 0.97; // 3% off no pix como na referência

  const [ratingData, setRatingData] = useState<{ average: number, count: number } | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const { data } = await supabase
          .from('product_reviews')
          .select('rating')
          .eq('product_id', product.id)
          .eq('is_approved', true);

        if (data && data.length > 0) {
          const sum = data.reduce((acc, curr) => acc + Number(curr.rating), 0);
          const avg = sum / data.length;
          setRatingData({ average: avg, count: data.length });
        }
      } catch (err) {
        console.error('Erro ao buscar avaliação', err);
      }
    };
    fetchRating();
  }, [product.id]);

  // Função para renderizar as estrelas (0 a 5)
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={12} className="fill-[#33e36a] text-[#33e36a]" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" size={12} className="fill-[#33e36a] text-[#33e36a]" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={12} className="text-neutral-600" />);
    }

    return stars;
  };

  return (
    <div className="group flex flex-col bg-[#141A12] rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 relative border border-[#1b241a] md:border-transparent md:border-b md:border-[#1b241a] md:hover:border-[#33e36a] shadow-md md:shadow-none h-full">
      
      {/* Imagem */}
      <Link to={`/produto/${product.slug}`} className="relative block w-full aspect-[4/5] md:aspect-square bg-[#0a0d0a] overflow-hidden flex-shrink-0">
        
        {/* Imagem Principal */}
        {product.main_image ? (
          <img 
            src={product.main_image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600 font-heading">
            Capa
          </div>
        )}
      </Link>

      {/* Detalhes (Mobile: Right side, Desktop: Bottom side) */}
      <div className="flex flex-col flex-1 p-2.5 md:p-3 bg-[#141A12]">
        
        {/* Título */}
        <Link to={`/produto/${product.slug}`} className="block">
          <h3 className="text-[#eae8e8] font-sans font-bold text-[13px] md:text-base leading-snug line-clamp-2 md:line-clamp-3 group-hover:text-[#33e36a] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Neon Tags */}
        <div className="flex items-center gap-1 mb-1 flex-wrap mt-1">
          <div 
            className="flex items-center gap-1 px-1.5 py-0.5 rounded md:rounded-full border border-[#33e36a] text-[#33e36a] bg-[#33e36a]/10" 
            style={{ boxShadow: '0 0 8px rgba(51, 227, 106, 0.5), inset 0 0 4px rgba(51, 227, 106, 0.3)' }}
          >
            <Truck size={10} className="drop-shadow-[0_0_3px_rgba(51,227,106,0.8)]" />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ textShadow: '0 0 4px rgba(51, 227, 106, 0.8)' }}>
              Frete Grátis
            </span>
          </div>
          <div 
            className="flex items-center gap-1 px-1.5 py-0.5 rounded md:rounded-full border border-[#33e36a] text-[#33e36a] bg-[#33e36a]/10" 
            style={{ boxShadow: '0 0 8px rgba(51, 227, 106, 0.5), inset 0 0 4px rgba(51, 227, 106, 0.3)' }}
          >
            <Package size={10} className="drop-shadow-[0_0_3px_rgba(51,227,106,0.8)]" />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ textShadow: '0 0 4px rgba(51, 227, 106, 0.8)' }}>
              Pronta Entrega
            </span>
          </div>
        </div>
        
        {/* Avaliação */}
        {ratingData && (
          <div className="mb-1.5 flex items-center gap-1.5">
            <div className="flex">
              {renderStars(ratingData.average)}
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">
              {ratingData.average.toFixed(1).replace('.', ',')} ({ratingData.count})
            </span>
          </div>
        )}
        
        {/* Preços */}
        <div className="flex flex-col mt-1 flex-1">
          {hasDiscount ? (
            <div className="flex flex-col mb-1 md:mb-2">
              <span className="text-[#6b7563] text-[11px] line-through font-medium">
                R${product.price.toFixed(2).replace('.', ',')}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-sans font-black text-[#eae8e8]">
                  R${currentPrice.toFixed(2).replace('.', ',')}
                </span>
                <span className="bg-[#0f6834] text-[#33e36a] md:bg-[#33e36a] md:text-[#06250f] text-[10px] font-bold px-1.5 py-0.5 rounded md:rounded-full uppercase tracking-tight">
                  {discountPercent}% OFF
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col mb-1 md:mb-2">
              <span className="text-xl md:text-2xl font-sans font-black text-[#eae8e8]">
                R${currentPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}
          
          <span className="text-[#8b977f] text-[10px] md:text-xs">
            Parcele em até 12x
          </span>
          <span className="text-[#8b977f] text-[10px] md:text-xs mb-1.5">
            R${pixPrice.toFixed(2).replace('.', ',')} no Pix (3% off)
          </span>

          {/* Botão Comprar */}
          <Link 
            to={`/produto/${product.slug}`}
            className="flex w-full bg-[#33e36a] hover:bg-[#11a544] text-[#06250f] text-xs md:text-sm font-bold uppercase py-1.5 md:py-2 rounded-lg md:rounded-full transition-colors items-center justify-center gap-2 mt-auto"
          >
            <Lock size={14} />
            Comprar
          </Link>
        </div>
      </div>
    </div>
  );
};
