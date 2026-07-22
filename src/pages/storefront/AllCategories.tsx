import React from 'react';
import { CategoryList } from '../../components/storefront/CategoryList';

export const AllCategories: React.FC = () => {
  return (
    <div className="w-full bg-[#0a0d0a] min-h-screen pt-24 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-8">
        <h1 className="text-3xl md:text-5xl font-heading font-black text-[#eef4ea] uppercase tracking-tighter mb-4">
          Nossas Categorias
        </h1>
        <p className="text-[#8b977f] text-sm md:text-base max-w-2xl">
          Encontre os melhores jogos por categoria. Navegue pelas opções abaixo e descubra grandes títulos com descontos imbatíveis.
        </p>
      </div>
      
      {/* A CategoryList já busca as categorias e as exibe. Como a página pede blocos que redirecionam,
          o CategoryList já faz isso. Para ficar melhor numa página dedicada, seria ideal usar grid. 
          Porém, para garantir funcionalidade rápida e o mesmo estilo, renderizamos o componente. */}
      <div className="mt-8">
        <CategoryList />
      </div>
    </div>
  );
};
