import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/storefront/Header';
import { Footer } from '../components/storefront/Footer';
import { MobileBottomNav } from '../components/storefront/MobileBottomNav';

export const StoreLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0d0a] text-[#eef4ea] font-sans selection:bg-[#33e36a]/30 selection:text-[#33e36a] flex flex-col relative overflow-x-hidden pb-16 lg:pb-0">
      <Header />
      
      <main className="flex-1 w-full relative z-0">
        <Outlet />
      </main>

      <Footer />
      
      {/* Menu Fixo na Base (Apenas Mobile) */}
      <MobileBottomNav />
    </div>
  );
};
