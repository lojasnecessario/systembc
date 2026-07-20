import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/storefront/Header';
import { Footer } from '../components/storefront/Footer';

export const StoreLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-green-500/30 selection:text-green-400 flex flex-col relative overflow-x-hidden">
      <Header />
      
      <main className="flex-1 w-full relative z-0">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
