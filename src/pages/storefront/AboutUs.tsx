import React, { useEffect, useState } from 'react';
import { Shield, Award, Users, MapPin, Zap, CheckCircle2, Gamepad2, Laptop, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../../store/settingsStore';

export const AboutUs: React.FC = () => {
  const { settings } = useSettingsStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { label: 'Clientes Satisfeitos', value: '+15.000', icon: <Users className="w-6 h-6 text-[#33e36a]" /> },
    { label: 'Produtos Originais', value: '100%', icon: <Shield className="w-6 h-6 text-[#33e36a]" /> },
    { label: 'Anos no Mercado', value: '5+', icon: <Award className="w-6 h-6 text-[#33e36a]" /> },
    { label: 'Entregas Rápidas', value: '24h', icon: <Zap className="w-6 h-6 text-[#33e36a]" /> },
  ];

  const values = [
    {
      title: 'Qualidade Garantida',
      description: 'Trabalhamos apenas com produtos originais e com garantia oficial de fábrica.',
      icon: <CheckCircle2 className="w-8 h-8 text-[#33e36a]" />,
    },
    {
      title: 'Foco no Gamer',
      description: 'Entendemos o que você precisa porque também somos apaixonados por games e tecnologia.',
      icon: <Gamepad2 className="w-8 h-8 text-[#33e36a]" />,
    },
    {
      title: 'Atendimento Especializado',
      description: 'Nossa equipe técnica está sempre pronta para ajudar você a montar o setup dos sonhos.',
      icon: <Laptop className="w-8 h-8 text-[#33e36a]" />,
    },
    {
      title: 'Suporte Ágil',
      description: 'Respeitamos o seu tempo com um atendimento rápido e humanizado em todas as etapas.',
      icon: <Clock className="w-8 h-8 text-[#33e36a]" />,
    }
  ];

  return (
    <div className="w-full bg-[#0a0d0a] min-h-screen pt-24 md:pt-32 pb-16 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative px-4 md:px-8 py-16 md:py-24">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#33e36a]/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="max-w-[1200px] mx-auto text-center">
          <div 
            className={`transition-all duration-1000 ease-out transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#1b241a] border border-[#2c3b2a] mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#33e36a] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#33e36a]"></span>
              </span>
              <span className="text-[#8b977f] text-sm font-medium tracking-wide uppercase">São Paulo, SP</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white mb-6 uppercase tracking-tighter leading-[1.1]">
              A Sua Nova Referência em <br className="hidden md:block"/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33e36a] to-[#20a346]">
                Games e Tecnologia
              </span>
            </h1>
            
            <p className="text-[#8b977f] text-base md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
              Nascida no coração de São Paulo, a Blackcore não é apenas uma loja. Somos um hub de tecnologia e alta performance dedicado a entregar a melhor experiência para gamers e entusiastas do hardware.
            </p>
          </div>

          {/* Stats Grid */}
          <div 
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-[1000px] mx-auto transition-all duration-1000 delay-300 ease-out transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {stats.map((stat, index) => (
              <div key={index} className="bg-[#111711] border border-[#1b241a] rounded-2xl p-6 flex flex-col items-center justify-center hover:border-[#33e36a]/30 transition-colors group">
                <div className="bg-[#1b241a] p-3 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-black text-white mb-1">{stat.value}</h3>
                <p className="text-[#8b977f] text-sm font-medium text-center">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-4 md:px-8 py-16 md:py-24 relative">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            
            {/* Image Side */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#33e36a]/20 to-transparent rounded-3xl blur-2xl group-hover:opacity-100 opacity-50 transition-opacity duration-500" />
              <div className="relative rounded-3xl overflow-hidden border border-[#2c3b2a] aspect-square md:aspect-[4/5]">
                {/* Fallback pattern if image is missing */}
                <div className="absolute inset-0 bg-[#111711] bg-[radial-gradient(#2c3b2a_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                <img 
                  src="/sobrenos.avif" 
                  alt="Nossa Loja" 
                  className="absolute inset-0 w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d0a] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-[#33e36a]" />
                    <span className="text-white font-bold tracking-wide">Baseados em São Paulo</span>
                  </div>
                  <p className="text-[#8b977f] text-sm">Enviamos para todo o Brasil com segurança e agilidade máxima.</p>
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div>
              <h2 className="text-3xl md:text-5xl font-heading font-black text-white uppercase tracking-tighter mb-8">
                Nossa <span className="text-[#33e36a]">História</span>
              </h2>
              
              <div className="space-y-6 text-[#8b977f] text-lg leading-relaxed">
                <p>
                  A Blackcore nasceu da frustração com o mercado tradicional. Sentíamos a falta de uma loja que entendesse verdadeiramente as necessidades dos gamers, que oferecesse preços justos e um suporte que não te deixasse na mão.
                </p>
                <p>
                  Hoje, somos referência no mercado de tecnologia em São Paulo, construindo uma comunidade forte de entusiastas que confiam em nosso trabalho.
                </p>
                <p>
                  Nossa missão é democratizar o acesso ao hardware de alta performance, garantindo que cada cliente tenha a melhor experiência possível, desde o momento da compra até a primeira partida no seu novo setup.
                </p>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/categorias"
                  className="inline-flex justify-center items-center px-8 py-4 bg-[#33e36a] text-[#0a0d0a] font-bold uppercase tracking-wide rounded-xl hover:bg-[#20a346] hover:scale-105 transition-all duration-300"
                >
                  Explorar Produtos
                </Link>
                {settings?.whatsapp && (
                  <a 
                    href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex justify-center items-center px-8 py-4 bg-transparent border-2 border-[#2c3b2a] text-white font-bold uppercase tracking-wide rounded-xl hover:border-[#33e36a] hover:text-[#33e36a] transition-colors"
                  >
                    Fale com a Equipe
                  </a>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Values/Advantages Grid */}
      <section className="px-4 md:px-8 py-16 md:py-24 bg-[#0d120d] border-y border-[#1b241a]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-black text-white uppercase tracking-tighter mb-4">
              Por que escolher a <span className="text-[#33e36a]">Blackcore?</span>
            </h2>
            <p className="text-[#8b977f] max-w-2xl mx-auto text-lg">
              Nosso compromisso é com a sua satisfação. Não vendemos apenas produtos, entregamos a base para suas próximas vitórias.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-[#0a0d0a] border border-[#1b241a] p-8 rounded-2xl hover:border-[#33e36a]/50 hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="bg-[#111711] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#33e36a]/10 transition-colors">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-[#8b977f] leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
