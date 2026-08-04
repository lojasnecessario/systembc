import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export const Header: React.FC = React.memo(() => {
  const { settings } = useSettingsStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produtos?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

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
            {settings?.logo ? (
              <img src={settings.logo} alt={settings?.name || "Logo"} className="h-8 md:h-10 object-contain" />
            ) : (
              <div className="flex items-center">
                <span className="text-xl md:text-2xl font-heading font-black tracking-tighter text-[#33e36a] italic uppercase">
                  BLACK<span className="text-[#eef4ea]">CORE</span>
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="flex w-full relative group">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Qual produto você busca"
                className="w-full bg-[#141A12] border border-[#1b241a] border-r-0 text-[#eef4ea] text-sm rounded-l-md py-3 pl-4 pr-4 focus:outline-none focus:border-[#33e36a] transition-colors placeholder:text-[#6b7563]"
              />
              <button type="submit" className="bg-[#33e36a] hover:bg-[#11a544] text-[#06250f] px-6 font-bold flex items-center gap-2 rounded-r-md transition-colors whitespace-nowrap">
                <Search size={18} />
                Buscar
              </button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-6">
            {/* Mobile Search Icon */}
            <button 
              className="lg:hidden text-[#8b977f] hover:text-[#eef4ea] p-2"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              {isMobileSearchOpen ? <X size={22} /> : <Search size={22} />}
            </button>


          </div>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {isMobileSearchOpen && (
        <div className="lg:hidden bg-[#0a0d0a] border-b border-[#1b241a] p-4 absolute w-full top-full left-0 z-40">
          <form onSubmit={handleSearch} className="flex w-full relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qual produto você busca"
              className="w-full bg-[#141A12] border border-[#1b241a] border-r-0 text-[#eef4ea] text-sm rounded-l-md py-3 pl-4 pr-4 focus:outline-none focus:border-[#33e36a] transition-colors placeholder:text-[#6b7563]"
              autoFocus
            />
            <button type="submit" className="bg-[#33e36a] hover:bg-[#11a544] text-[#06250f] px-4 font-bold flex items-center justify-center rounded-r-md transition-colors">
              <Search size={18} />
            </button>
          </form>
        </div>
      )}

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
});
