import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, Search, X, User, MessageCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 bg-[#0a0d0a]`}>
      {/* Top Header Row */}
      <div className={`border-b border-[#1b241a] transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3'}`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Mobile: Hamburger */}
          <div className="lg:hidden flex items-center">
            <button 
              className="text-[#8b977f] hover:text-[#eef4ea] p-2 -ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo (Centered on mobile, Left on desktop) */}
          <Link to="/" className="flex items-center lg:mr-8 group relative z-50">
            {/* Logo placeholder imitating xgamestore logo */}
            <div className="flex items-center">
              <span className="text-xl md:text-2xl font-heading font-black tracking-tighter text-[#33e36a] italic">
                BLACK<span className="text-[#eef4ea]">CORE</span>
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="flex w-full relative group">
              <input 
                type="text" 
                placeholder="Qual produto você busca"
                className="w-full bg-[#141A12] border border-[#1b241a] border-r-0 text-[#eef4ea] text-sm rounded-l-md py-3 pl-4 pr-4 focus:outline-none focus:border-[#33e36a] transition-colors placeholder:text-[#6b7563]"
              />
              <button className="bg-[#33e36a] hover:bg-[#11a544] text-[#06250f] px-6 font-bold flex items-center gap-2 rounded-r-md transition-colors whitespace-nowrap">
                <Search size={18} />
                Buscar
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-6">
            {/* Mobile Search Icon */}
            <button className="lg:hidden text-[#8b977f] hover:text-[#eef4ea] p-2">
              <Search size={22} />
            </button>

            {/* Desktop Account */}
            <Link to="/admin/login" className="hidden lg:flex items-center gap-3 text-[#8b977f] hover:text-[#eef4ea] transition-colors">
              <User size={24} />
              <div className="flex flex-col">
                <span className="text-[10px] leading-tight">Entrar</span>
                <span className="text-sm font-bold leading-tight text-[#eef4ea]">Minha conta</span>
              </div>
            </Link>

            {/* Desktop & Mobile Cart */}
            <button className="flex items-center gap-3 text-[#8b977f] hover:text-[#eef4ea] transition-colors group relative p-2 lg:p-0">
              <ShoppingCart size={24} />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[10px] leading-tight">Carrinho</span>
                <span className="text-sm font-bold leading-tight text-[#eef4ea]">R$0,00</span>
              </div>
              {/* Notifier dot for mobile/desktop */}
              <span className="absolute top-1 lg:-top-1 right-1 lg:-right-1 w-2.5 h-2.5 bg-[#33e36a] rounded-full border-2 border-[#0a0d0a]"></span>
            </button>

            {/* Desktop WhatsApp Button */}
            <a href="https://wa.me/5516991484745" target="_blank" rel="noopener noreferrer" className="hidden lg:flex items-center gap-2 bg-[#0f130e] border border-[#1b241a] hover:border-[#33e36a] text-[#8b977f] hover:text-[#33e36a] px-4 py-2 rounded-md transition-colors">
              <MessageCircle size={20} className="text-[#33e36a]" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] leading-tight">Fale conosco</span>
                <span className="text-sm font-bold leading-tight text-[#eef4ea]">WhatsApp</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Desktop Sub Navigation Row */}
      <div className="hidden lg:block border-b border-[#1b241a] bg-[#0a0d0a]">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center h-12">
          <nav className="flex items-center gap-8 h-full">
            <div className="flex items-center gap-2 h-full text-[#8b977f] border-b-2 border-transparent hover:border-[#33e36a] hover:text-[#eef4ea] cursor-pointer transition-colors">
              <Menu size={18} />
            </div>
            <Link to="/categorias" className="h-full flex items-center text-xs font-bold text-[#eef4ea] uppercase border-b-2 border-transparent hover:border-[#33e36a] hover:text-[#33e36a] transition-colors whitespace-nowrap">
              CATEGORIAS
            </Link>
            <Link to="/sobre-nos" className="h-full flex items-center text-xs font-bold text-[#eef4ea] uppercase border-b-2 border-transparent hover:border-[#33e36a] hover:text-[#33e36a] transition-colors whitespace-nowrap">
              SOBRE NÓS
            </Link>
            <Link to="/depoimentos" className="h-full flex items-center text-xs font-bold text-[#eef4ea] uppercase border-b-2 border-transparent hover:border-[#33e36a] hover:text-[#33e36a] transition-colors whitespace-nowrap">
              <span className="text-yellow-400 mr-1">☆</span> DEPOIMENTOS
            </Link>
            <Link to="/google" className="h-full flex items-center text-xs font-bold text-[#eef4ea] uppercase border-b-2 border-transparent hover:border-[#33e36a] hover:text-[#33e36a] transition-colors whitespace-nowrap">
              <span className="text-blue-400 font-extrabold mr-1">G</span> CONFIRA NO GOOGLE
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-[#0a0d0a] z-40 flex flex-col pt-24 px-6 transition-all duration-300 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-6">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold uppercase text-[#eef4ea] hover:text-[#33e36a] border-b border-[#1b241a] pb-4">Início</Link>
          <Link to="/categorias" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold uppercase text-[#eef4ea] hover:text-[#33e36a] border-b border-[#1b241a] pb-4">Categorias</Link>
          <Link to="/sobre-nos" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold uppercase text-[#eef4ea] hover:text-[#33e36a] border-b border-[#1b241a] pb-4">Sobre Nós</Link>
          <Link to="/depoimentos" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold uppercase text-[#eef4ea] hover:text-[#33e36a] border-b border-[#1b241a] pb-4">Depoimentos</Link>
          <Link to="/google" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold uppercase text-[#eef4ea] hover:text-[#33e36a] border-b border-[#1b241a] pb-4">Confira no Google</Link>
          <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold uppercase text-[#eef4ea] hover:text-[#33e36a] border-b border-[#1b241a] pb-4">Minha Conta</Link>
        </div>
      </div>
    </header>
  );
};
