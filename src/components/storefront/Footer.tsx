import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black pt-20 pb-10 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-xl leading-none">B</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Black Core
              </span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed">
              O núcleo da tecnologia. Especialistas em consoles, hardware e periféricos premium. 
              Elevando o nível do seu setup.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Navegação</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Início</Link></li>
              <li><a href="#categorias" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Categorias</a></li>
              <li><a href="#produtos" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Produtos</a></li>
              <li><Link to="/depoimentos" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Avaliações</Link></li>
              <li><a href="#sobre" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Sobre Nós</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Suporte e Políticas</h4>
            <ul className="space-y-4">
              <li><Link to="/legal/politica-de-troca-e-devolucao" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Trocas e Devoluções</Link></li>
              <li><Link to="/legal/politica-de-reembolso" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Política de Reembolso</Link></li>
              <li><a href="#faq" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">FAQ / Frete</a></li>
              <li><a href="#contato" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Redes Sociais</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:bg-green-500/10 hover:text-green-500 transition-all text-xs font-bold">
                IG
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:bg-green-500/10 hover:text-green-500 transition-all text-xs font-bold">
                TW
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:bg-green-500/10 hover:text-green-500 transition-all text-xs font-bold">
                FB
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-xs">
            &copy; {new Date().getFullYear()} Black Core. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
            <Link to="/legal/termos-de-uso" className="text-neutral-500 hover:text-white text-xs transition-colors">Termos de Serviço</Link>
            <Link to="/legal/politica-de-privacidade" className="text-neutral-500 hover:text-white text-xs transition-colors">Política de Privacidade</Link>
            <Link to="/legal/politica-de-cookies" className="text-neutral-500 hover:text-white text-xs transition-colors">Política de Cookies</Link>
            <Link to="/legal/aviso-de-seguranca" className="text-neutral-500 hover:text-white text-xs transition-colors">Aviso de Segurança</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
