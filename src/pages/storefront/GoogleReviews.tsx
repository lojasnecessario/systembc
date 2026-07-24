import React, { useState } from 'react';
import { 
  Star, MapPin, Phone, Clock, Globe, Bookmark, 
  Search, Smartphone, Share2, ChevronRight, Check, ThumbsUp, Loader2
} from 'lucide-react';

export function GoogleReviews() {
  const [activeTab, setActiveTab] = useState('VISÃO GERAL');
  const [isLoading, setIsLoading] = useState(false);

  const reviewsList = [
    { id: 1, author: 'João Silva', date: 'há 2 dias', text: 'Excelente loja! O atendimento foi impecável e encontrei tudo o que precisava para o meu setup. O console veio em perfeito estado.', rating: 5 },
    { id: 2, author: 'Maria Souza', date: 'há 1 semana', text: 'Preços muito bons e entrega super rápida. A Blackcore sempre supera as expectativas, sou cliente fiel agora!', rating: 5 },
    { id: 3, author: 'Carlos Andrade', date: 'há 3 semanas', text: 'Ótima variedade de produtos e gadgets. Só acho que o estacionamento poderia ser um pouco maior, mas de resto tudo perfeito.', rating: 4 },
    { id: 4, author: 'Ana Paula', date: 'há 1 mês', text: 'A melhor loja de games da região! Ambiente super agradável, dá vontade de ficar horas testando os lançamentos.', rating: 5 },
    { id: 5, author: 'Roberto Gomes', date: 'há 2 meses', text: 'Comprei meu PS5 aqui e o vendedor foi super atencioso, explicou tudo direitinho e ainda ganhei um brinde. Recomendo demais!', rating: 5 },
    { id: 6, author: 'Lucas Martins', date: 'há 2 meses', text: 'Sempre encontro os últimos lançamentos aqui. A equipe é muito prestativa e entende do assunto.', rating: 5 },
    { id: 7, author: 'Fernanda Lima', date: 'há 3 meses', text: 'Comprei um headset novo e o preço estava melhor que na internet. Vale a pena visitar!', rating: 4 },
    { id: 8, author: 'Rafael Costa', date: 'há 4 meses', text: 'A loja é incrível, super organizada e com uma iluminação muito legal. Dá gosto de comprar lá.', rating: 5 },
    { id: 9, author: 'Juliana Alves', date: 'há 5 meses', text: 'Gostei muito, mas aos finais de semana fica um pouco cheio.', rating: 4 },
    { id: 10, author: 'Pedro Santos', date: 'há 6 meses', text: 'Melhor lugar para comprar novos equipamentos e setups. O atendimento deles é muito justo.', rating: 5 },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-100 text-neutral-900 font-sans">
      
      {/* ==================================================== */}
      {/* DESKTOP LAYOUT (Sidebar + Map) */}
      {/* ==================================================== */}
      <div className="hidden lg:flex w-[400px] flex-col bg-white border-r border-neutral-200 overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-10">
        
        {/* Cover Image */}
        <div className="relative h-64 shrink-0 bg-neutral-200">
          <img 
            src="/googlepage.jpeg" 
            className="w-full h-full object-cover" 
            alt="Blackcore Video Games" 
          />
        </div>
        
        {/* Header Info */}
        <div className="p-5 pb-4 border-b border-neutral-100">
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Blackcore Video Games</h1>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-neutral-700">4.9</span>
            <div className="flex text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
            </div>
            <span className="text-sm text-blue-600 hover:underline cursor-pointer">
              1.284 avaliações
            </span>
          </div>
          <p className="text-sm text-neutral-600 mb-3">Loja de Videogames e Acessórios</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between px-6 py-4 border-b border-neutral-100">
          <DesktopActionButton icon={<MapPin className="w-5 h-5" />} label="Rotas" active />
          <DesktopActionButton icon={<Bookmark className="w-5 h-5" />} label="Salvar" />
          <DesktopActionButton icon={<Search className="w-5 h-5" />} label="Próximo" />
          <DesktopActionButton icon={<Smartphone className="w-5 h-5" />} label="Enviar" />
          <DesktopActionButton icon={<Share2 className="w-5 h-5" />} label="Compartilhar" />
        </div>

        {/* Features List */}
        <div className="p-4 border-b border-neutral-100 flex flex-wrap gap-4 text-sm text-neutral-700">
            <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-600" /> Compras na loja</div>
            <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-600" /> Retirada na porta</div>
            <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-600" /> Entrega</div>
        </div>

        {/* Info List */}
        <div className="flex flex-col py-2">
          <InfoItem icon={<MapPin />} text="São Paulo, SP - Brasil" />
          <InfoItem icon={<Clock />} text={<><span className="text-green-600 font-medium">Aberto agora</span> ⋅ Fecha às 22:00</>} />
          <InfoItem icon={<Globe />} text="blackcoregames.com.br" />
          <InfoItem icon={<Phone />} text="(11) 99999-9999" />
        </div>

        {/* Reviews Section */}
        <div className="flex flex-col p-4 bg-neutral-50 pb-8 border-t border-neutral-200">
          <h2 className="font-bold text-lg mb-4">Avaliações</h2>
          <div className="space-y-4">
            {reviewsList.map(review => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
          
          <button 
            className="mt-6 w-full py-3 rounded-full border border-neutral-300 text-blue-600 font-medium hover:bg-neutral-100 flex items-center justify-center transition-colors"
            onClick={() => setIsLoading(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              "Ver todas as avaliações"
            )}
          </button>
        </div>

      </div>

      {/* Desktop Map Area */}
      <div className="hidden lg:block flex-1 relative bg-[#e5e3df]">
        <iframe 
          title="Mapa Interativo Blackcore"
          className="w-full h-full border-0 grayscale-[20%] contrast-125" 
          loading="lazy" 
          allowFullScreen 
          referrerPolicy="no-referrer-when-downgrade" 
          src="https://maps.google.com/maps?q=S%C3%A3o+Paulo,+Brasil&t=&z=11&ie=UTF8&iwloc=&output=embed"
        ></iframe>
      </div>


      {/* ==================================================== */}
      {/* MOBILE LAYOUT */}
      {/* ==================================================== */}
      <div className="block lg:hidden w-full h-full overflow-y-auto bg-neutral-100">
        
        {/* Fake Search Bar Header */}
        <div className="bg-white px-4 py-3 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center bg-neutral-100 rounded-full px-4 py-2 border border-neutral-200">
            <Search className="w-5 h-5 text-neutral-500 mr-2" />
            <input 
              type="text" 
              value="Blackcore Video Games" 
              readOnly
              className="bg-transparent border-none outline-none w-full text-neutral-800" 
            />
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white mt-2 rounded-t-3xl shadow-sm border border-neutral-200/60 overflow-hidden min-h-screen">
          
          {/* Mobile Header Info */}
          <div className="p-5 flex gap-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-neutral-900 mb-1 leading-tight">Blackcore Video Games</h1>
              <div className="flex items-center gap-1.5 mb-1.5 text-sm">
                <span className="font-medium text-neutral-700">4.9</span>
                <div className="flex text-yellow-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
              <p className="text-sm text-neutral-600 leading-snug">
                Loja de Videogames • <span className="text-green-600 font-medium">Aberto</span>
              </p>
            </div>
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm border border-neutral-100">
              <img 
                src="/googlepage.jpeg" 
                className="w-full h-full object-cover" 
                alt="Store" 
              />
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="flex overflow-x-auto border-b border-neutral-200 px-2 scrollbar-hide">
            {['VISÃO GERAL', 'INFORMAÇÕES', 'AVALIAÇÕES', 'FOTOS'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex justify-around p-5 border-b border-neutral-100">
            <MobileActionButton icon={<Phone />} label="LIGAR" active />
            <MobileActionButton icon={<MapPin />} label="ROTAS" active />
            <MobileActionButton icon={<Bookmark />} label="SALVAR" />
            <MobileActionButton icon={<Globe />} label="SITE" active />
          </div>

          {/* Description Snippet */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors">
            <span className="text-neutral-700 text-sm">Descrição da empresa</span>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </div>

          {/* Mobile Info List */}
          <div className="flex flex-col pb-4">
            <InfoItem icon={<MapPin />} text="São Paulo, SP - Brasil" />
            <InfoItem icon={<Clock />} text="Horário comercial" />
            <InfoItem icon={<Globe />} text="Website comercial" />
          </div>

          {/* Reviews Section Mobile */}
          <div className="flex flex-col p-4 bg-neutral-50 pb-8 border-t border-neutral-200">
            <h2 className="font-bold text-lg mb-4">Avaliações</h2>
            <div className="space-y-4">
              {reviewsList.map(review => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
            
            <button 
              className="mt-6 w-full py-3 rounded-full border border-neutral-300 text-blue-600 font-medium hover:bg-neutral-100 flex items-center justify-center transition-colors"
              onClick={() => setIsLoading(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              ) : (
                "Ver todas as avaliações"
              )}
            </button>
          </div>
          
        </div>
      </div>

    </div>
  );
}

// ----------------------------------------------------
// Helper Components
// ----------------------------------------------------

function ReviewItem({ review }: { review: any }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-neutral-200/60 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <img 
          src={`https://ui-avatars.com/api/?name=${review.author.replace(' ', '+')}&background=random`}
          alt={review.author} 
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="font-bold text-sm text-neutral-900">{review.author}</div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
            <div className="flex text-yellow-400">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <span>•</span>
            <span>{review.date}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-neutral-700 leading-relaxed mb-3">
        {review.text}
      </p>
      <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
        <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Útil</span>
        </button>
      </div>
    </div>
  );
}

function DesktopActionButton({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className="flex flex-col items-center gap-1.5 group">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
        active 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-transparent text-blue-600 border border-neutral-200 hover:bg-blue-50'
      }`}>
        {icon}
      </div>
      <span className={`text-[11px] font-medium ${active ? 'text-blue-700' : 'text-neutral-600'}`}>
        {label}
      </span>
    </button>
  );
}

function MobileActionButton({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className="flex flex-col items-center gap-2 group">
      <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${
        active 
          ? 'border-blue-600 text-blue-600 hover:bg-blue-50' 
          : 'border-neutral-300 text-neutral-500 hover:bg-neutral-50'
      }`}>
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
      </div>
      <span className={`text-[11px] font-bold tracking-wide ${active ? 'text-blue-600' : 'text-neutral-500'}`}>
        {label}
      </span>
    </button>
  );
}

function InfoItem({ icon, text }: { icon: React.ReactNode, text: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer">
      <div className="text-blue-600 shrink-0 mt-0.5">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
      </div>
      <div className="text-sm text-neutral-700 leading-snug">
        {text}
      </div>
    </div>
  );
}
