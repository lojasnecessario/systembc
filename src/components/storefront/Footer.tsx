import React from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../../store/settingsStore';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useSettingsStore();

  return (
    <footer className="bg-black pt-20 pb-10 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              {settings?.logo ? (
                <img src={settings.logo} alt={settings?.name || "Logo"} loading="lazy" decoding="async" className="h-10 object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-black font-black text-xl leading-none">
                      {settings?.name ? settings.name.charAt(0).toUpperCase() : 'B'}
                    </span>
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white">
                    {settings?.name || 'Black Core'}
                  </span>
                </>
              )}
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-line">
              {settings?.footer_text || 'O núcleo da tecnologia. Especialistas em consoles, hardware e periféricos premium. Elevando o nível do seu setup.'}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Navegação</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Início</Link></li>
              <li><Link to="/categorias" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Categorias</Link></li>
              <li><Link to="/produtos" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Produtos</Link></li>
              <li><Link to="/depoimentos" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Avaliações</Link></li>
              <li><Link to="/sobre-nos" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Sobre Nós</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Suporte e Políticas</h4>
            <ul className="space-y-4">
              <li><Link to="/legal/politica-de-troca-e-devolucao" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Trocas e Devoluções</Link></li>
              <li><Link to="/legal/politica-de-reembolso" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Política de Reembolso</Link></li>
              <li><Link to="/faq" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">FAQ / Frete</Link></li>
              <li><Link to="/contato" className="text-neutral-400 hover:text-green-400 text-sm transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Contato e Redes Sociais</h4>
            <div className="space-y-4 mb-6">
              {settings?.email && (
                <div className="flex items-center gap-3 text-neutral-400 text-sm">
                  <Mail size={16} className="text-green-500" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">{settings.email}</a>
                </div>
              )}
              {settings?.whatsapp && (
                <div className="flex items-center gap-3 text-neutral-400 text-sm">
                  <Phone size={16} className="text-green-500" />
                  <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{settings.whatsapp}</a>
                </div>
              )}
              {settings?.address && (
                <div className="flex items-center gap-3 text-neutral-400 text-sm">
                  <MapPin size={16} className="text-green-500 flex-shrink-0" />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings?.business_hours && (
                <div className="flex items-center gap-3 text-neutral-400 text-sm">
                  <Clock size={16} className="text-green-500 flex-shrink-0" />
                  <span>{settings.business_hours}</span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {settings?.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:bg-green-500/10 hover:text-green-500 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              )}
              {settings?.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:bg-green-500/10 hover:text-green-500 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
              )}
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-xs">
            &copy; {new Date().getFullYear()} {settings?.name || 'Black Core'}. Todos os direitos reservados. 
            {settings?.cnpj && <span className="ml-2 block md:inline mt-1 md:mt-0">CNPJ: {settings.cnpj}</span>}
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
