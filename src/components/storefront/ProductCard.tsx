import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Flame } from 'lucide-react';

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

  return (
    <div className="group flex flex-col bg-[#111111] rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-2 relative h-full border-b-[5px] border-green-500 shadow-lg hover:shadow-[0_15px_30px_-5px_rgba(34,197,94,0.15)]">
      
      {/* Container de Imagem (Formato Vertical Pôster) */}
      <Link to={`/produto/${product.slug}`} className="relative block aspect-[3/4] bg-black overflow-hidden">
        
        {/* Ícone de Plataforma no canto superior esquerdo */}
        <div className="absolute top-3 left-3 z-10 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
          <Gamepad2 size={16} className="text-white" />
        </div>

        {/* Tag de Desconto Flutuante no canto inferior direito */}
        {hasDiscount && (
          <div className="absolute bottom-3 right-3 z-10 flex flex-col items-center gap-1">
            <span className="bg-green-500 text-black text-[11px] font-extrabold px-2 py-1 rounded-full uppercase tracking-tighter shadow-md">
              -{discountPercent}%
            </span>
            <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center backdrop-blur-md">
              <Flame size={12} className="text-orange-500" />
            </div>
          </div>
        )}

        {/* Overlay Escuro no Hover (Simulando o efeito da referência) */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 z-0" />

        {/* Imagem Principal */}
        {product.main_image ? (
          <img 
            src={product.main_image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600">
            Capa do Jogo
          </div>
        )}
      </Link>

      {/* Conteúdo / Textos */}
      <div className="p-4 flex flex-col flex-1 bg-[#161616]">
        {/* Badge Envio Digital */}
        <div className="mb-2 text-center">
          <span className="inline-block bg-white/5 border border-white/10 text-neutral-400 text-[9px] font-bold px-4 py-1 rounded-full uppercase tracking-[0.15em]">
            Envio Digital
          </span>
        </div>

        <Link to={`/produto/${product.slug}`} className="block flex-1 text-center">
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-green-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto flex flex-col items-center justify-center pt-2">
          {hasDiscount ? (
            <>
              <span className="text-neutral-500 text-[10px] line-through mb-0.5">
                R$ {product.price.toFixed(2)}
              </span>
              <span className="text-xl font-black text-white">
                R$ {currentPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-xl font-black text-white">
              R$ {currentPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
