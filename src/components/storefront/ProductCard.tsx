import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

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

  return (
    <div className="group flex flex-col bg-[#141A12] rounded-xl md:rounded-none overflow-hidden transition-all duration-300 relative border border-[#1b241a] md:border-transparent md:border-b md:border-[#1b241a] md:hover:border-[#33e36a] shadow-md md:shadow-none h-full">
      
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
      <div className="flex flex-col flex-1 p-3 md:p-4 bg-[#141A12]">
        
        {/* Título */}
        <Link to={`/produto/${product.slug}`} className="block flex-1 mb-2">
          <h3 className="text-[#eae8e8] font-sans font-bold text-[13px] md:text-base leading-snug line-clamp-2 md:line-clamp-3 group-hover:text-[#33e36a] transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Preços */}
        <div className="flex flex-col mt-auto">
          {hasDiscount ? (
            <div className="flex flex-col mb-1 md:mb-2">
              <span className="text-[#6b7563] text-[11px] line-through font-medium">
                R${product.price.toFixed(2).replace('.', ',')}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-sans font-black text-[#eae8e8]">
                  R${currentPrice.toFixed(2).replace('.', ',')}
                </span>
                <span className="bg-[#0f6834] text-[#33e36a] md:bg-[#33e36a] md:text-[#06250f] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight">
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
          <span className="text-[#8b977f] text-[10px] md:text-xs mb-3">
            R${pixPrice.toFixed(2).replace('.', ',')} no Pix (3% off)
          </span>

          {/* Botão Comprar */}
          <Link 
            to={`/produto/${product.slug}`}
            className="flex w-full bg-[#33e36a] hover:bg-[#11a544] text-[#06250f] text-xs md:text-sm font-bold uppercase py-1.5 md:py-2 rounded-lg transition-colors items-center justify-center gap-2 mt-2"
          >
            <Lock size={14} />
            Comprar
          </Link>
        </div>
      </div>
    </div>
  );
};
