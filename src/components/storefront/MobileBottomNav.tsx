import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Search, Tag, User, MessageCircle } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { icon: <LayoutGrid size={22} />, label: 'Categorias', path: '/#categorias', isHash: true },
    { icon: <Search size={22} />, label: 'Buscar', path: '/#buscar', isHash: true },
    { icon: <Tag size={22} />, label: 'Promoções', path: '/#promocoes', isHash: true },
    { icon: <User size={22} />, label: 'Conta', path: '/admin/login', isHash: false },
    { icon: <MessageCircle size={22} />, label: 'WhatsApp', path: 'https://wa.me/5516991484745', isExternal: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0d0a] border-t border-[#1b241a] z-50 lg:hidden px-2 pb-safe">
      <div className="flex items-center justify-between h-16">
        {navItems.map((item, index) => {
          const isActive = !item.isExternal && !item.isHash && location.pathname === item.path;
          
          const content = (
            <div className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-[#33e36a]' : 'text-[#8b977f] hover:text-[#eef4ea]'}`}>
              {item.icon}
              <span className="text-[10px] font-semibold">{item.label}</span>
            </div>
          );

          if (item.isExternal) {
            return (
              <a key={index} href={item.path} target="_blank" rel="noopener noreferrer" className="flex-1 h-full">
                {content}
              </a>
            );
          }
          
          if (item.isHash) {
            return (
              <a key={index} href={item.path} className="flex-1 h-full">
                {content}
              </a>
            );
          }

          return (
            <Link key={index} to={item.path} className="flex-1 h-full">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
