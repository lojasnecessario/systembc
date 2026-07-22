import React from 'react';

export const BrandSlider: React.FC = () => {
  const brands = [
    { name: 'PlayStation', src: '/playstationlogo.png', scale: 'scale-[1.5]' },
    { name: 'Xbox', src: '/xboxlogo.png', scale: 'scale-[1.2]' },
    { name: 'Nintendo', src: '/nintendologo.png', scale: 'scale-[1.5]' }
  ];

  // Duplicando a lista de marcas para fazer o efeito de slide infinito (Marquee)
  // Duplicamos várias vezes para garantir que preencha telas muito largas
  const sliderItems = [...brands, ...brands, ...brands, ...brands, ...brands, ...brands];

  return (
    <div className="w-full bg-transparent py-3 md:py-5 relative overflow-hidden group">
      {/* Container do Marquee com animação contínua */}
      <div className="flex w-[200%] md:w-[150%] lg:w-[100%] animate-marquee items-center gap-16 md:gap-24 lg:gap-32">
        {sliderItems.map((brand, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 flex items-center justify-center transition-transform duration-300 cursor-pointer px-4"
          >
            <img 
              src={brand.src} 
              alt={brand.name} 
              className={`h-8 md:h-10 lg:h-14 w-auto object-contain transition-transform duration-300 hover:scale-[1.2] ${brand.scale}`} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};
