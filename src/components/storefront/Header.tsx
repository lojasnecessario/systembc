import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, Search, X, LogIn, Crown } from 'lucide-react';

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
    <header 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b ${
        isScrolled 
          ? 'bg-[#0f0f0f] border-white/10 py-3' 
          : 'bg-[#141414] border-transparent py-4'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group relative z-50 mr-8">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.5)] group-hover:scale-105 transition-transform duration-300">
            <span className="text-black font-black text-xl md:text-2xl leading-none">B</span>
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter text-white group-hover:text-green-400 transition-colors uppercase">
            Black Core
          </span>
        </Link>

        {/* Desktop Navigation & Actions */}
        <div className="hidden lg:flex items-center justify-end flex-1 gap-6">
          
          {/* Barra de Busca (Estilo reference) */}
          <div className="flex-1 max-w-lg relative mr-4">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-neutral-500" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar jogo na Black Core..."
              className="w-full bg-[#1e1e1e] border border-white/5 text-white text-sm rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-green-500/50 transition-colors placeholder:text-neutral-500"
            />
          </div>

          <Link to="/" className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-wider text-xs px-5 py-3 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)]">
            <Crown size={16} />
            Seja VIP
          </Link>

          <Link to="/admin/login" className="flex items-center gap-2 bg-transparent border border-white/10 hover:border-white/30 text-white font-semibold text-sm px-5 py-3 rounded-full transition-colors">
            <LogIn size={16} className="text-green-500" />
            Login / Criar
          </Link>

          <button className="flex items-center gap-2 bg-transparent border border-white/10 hover:border-white/30 text-white font-semibold text-sm px-5 py-3 rounded-full transition-colors relative group">
            <ShoppingCart size={18} />
            Carrinho
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-4 z-50 lg:hidden">
          <button className="text-neutral-300 hover:text-green-400 p-2">
            <Search size={22} />
          </button>
          <button className="text-neutral-300 hover:text-green-400 p-2 relative">
            <ShoppingCart size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
          </button>
          
          <button 
            className="text-neutral-300 hover:text-white p-2 ml-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-[#111111] z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black uppercase text-white hover:text-green-400 tracking-tighter">Início</Link>
        <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black uppercase text-white hover:text-green-400 tracking-tighter">Login / Criar</Link>
        <a href="#categorias" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black uppercase text-white hover:text-green-400 tracking-tighter">Categorias</a>
        <a href="#produtos" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black uppercase text-white hover:text-green-400 tracking-tighter">Produtos</a>
      </div>
    </header>
  );
};
