import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Truck, RefreshCw, ShieldCheck } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'frete' | 'garantia'>('geral');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = {
    geral: [
      { question: 'Como faço para acompanhar meu pedido?', answer: 'Você receberá o código de rastreio por e-mail assim que o pedido for despachado. Também é possível acompanhar o status na seção "Meus Pedidos" se você criou uma conta.' },
      { question: 'Quais as formas de pagamento aceitas?', answer: 'Aceitamos PIX (com aprovação imediata) e Cartões de Crédito (Visa, Mastercard, Elo, Amex) em até 12x.' },
      { question: 'É seguro comprar na loja?', answer: 'Sim, nosso site possui certificado SSL e todos os pagamentos são processados em ambiente seguro criptografado de ponta a ponta.' }
    ],
    frete: [
      { question: 'Qual o prazo de entrega?', answer: 'O prazo varia de acordo com o seu CEP e a modalidade de frete escolhida. Normalmente despachamos em até 24h úteis após a confirmação do pagamento.' },
      { question: 'Vocês entregam em todo o Brasil?', answer: 'Sim, realizamos entregas em todo o território nacional através dos Correios e transportadoras parceiras.' },
      { question: 'Como funciona o Frete Grátis?', answer: 'Oferecemos frete grátis para regiões selecionadas em compras acima de um valor determinado (consulte o banner na página inicial ou o carrinho).' }
    ],
    garantia: [
      { question: 'Qual a garantia dos produtos?', answer: 'Todos os produtos possuem garantia mínima de 90 dias contra defeitos de fabricação. Alguns itens possuem garantia estendida de 6 a 12 meses.' },
      { question: 'Como aciono a garantia?', answer: 'Basta entrar em contato pelo nosso formulário ou WhatsApp informando o número do pedido e um breve relato do defeito para iniciarmos o atendimento.' },
      { question: 'Posso devolver o produto se não gostar?', answer: 'Sim, de acordo com o Código de Defesa do Consumidor, você tem até 7 dias corridos após o recebimento para solicitar a devolução por arrependimento.' }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0a0d0a] pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-heading font-black text-white text-center mb-4 uppercase tracking-tight">Perguntas <span className="text-[#33e36a]">Frequentes</span></h1>
        <p className="text-neutral-400 text-center mb-12">Tire suas dúvidas sobre pedidos, entregas e garantias.</p>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <button onClick={() => {setActiveTab('geral'); setActiveFaq(null);}} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${activeTab === 'geral' ? 'bg-[#33e36a] text-black shadow-[0_0_15px_rgba(51,227,106,0.2)]' : 'bg-[#141A12] text-white border border-[#1b241a] hover:border-[#33e36a]'}`}>
            <HelpCircle size={18} /> Geral
          </button>
          <button onClick={() => {setActiveTab('frete'); setActiveFaq(null);}} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${activeTab === 'frete' ? 'bg-[#33e36a] text-black shadow-[0_0_15px_rgba(51,227,106,0.2)]' : 'bg-[#141A12] text-white border border-[#1b241a] hover:border-[#33e36a]'}`}>
            <Truck size={18} /> Frete
          </button>
          <button onClick={() => {setActiveTab('garantia'); setActiveFaq(null);}} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${activeTab === 'garantia' ? 'bg-[#33e36a] text-black shadow-[0_0_15px_rgba(51,227,106,0.2)]' : 'bg-[#141A12] text-white border border-[#1b241a] hover:border-[#33e36a]'}`}>
            <ShieldCheck size={18} /> Garantia
          </button>
        </div>

        {/* Lista de FAQs */}
        <div className="space-y-4">
          {faqs[activeTab].map((faq, index) => (
            <div key={index} className="bg-[#141A12] border border-[#1b241a] rounded-xl overflow-hidden transition-all duration-300">
              <button 
                className="w-full p-5 flex items-center justify-between text-left hover:bg-[#1b241a] transition-colors"
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              >
                <span className="font-heading font-bold text-white text-base uppercase tracking-wide pr-4">{faq.question}</span>
                <ChevronDown size={20} className={`text-[#33e36a] flex-shrink-0 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 pt-0 text-neutral-400 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
