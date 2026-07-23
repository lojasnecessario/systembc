import React from 'react';

export const BrandSlider: React.FC = () => {
  const brands = [
    { name: 'PlayStation', src: '/playstationlogo.png', scale: 'scale-[1.9]' },
    { name: 'Xbox', src: '/xboxlogo.png', scale: 'scale-[1.7]' },
    { name: 'Nintendo', src: '/nintendologo.png', scale: 'scale-[1.9]' }
  ];

  // Duplicando a lista de marcas para fazer o efeito de slide infinito (Marquee)
  // Duplicamos várias vezes para garantir que preencha telas muito largas
  const sliderItems = [...brands, ...brands, ...brands, ...brands, ...brands, ...brands];

  return (
    <div className="w-full bg-transparent py-4 md:py-6 relative overflow-hidden group">
      {/* Container do Marquee com animação contínua */}
      <div className="flex w-[200%] md:w-[150%] lg:w-[100%] animate-marquee items-center gap-20 md:gap-32 lg:gap-40">
        {sliderItems.map((brand, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 flex items-center justify-center cursor-pointer px-4"
          >
            <div className="transition-transform duration-300 hover:scale-110">
              <img 
                src={brand.src} 
                alt={brand.name} 
                className={`h-14 md:h-16 lg:h-24 w-auto object-contain ${brand.scale}`} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
