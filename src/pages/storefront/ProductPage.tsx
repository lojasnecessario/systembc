import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, CheckCircle2, ChevronDown, Clock } from 'lucide-react';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (name)
          `)
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Produto não encontrado.
      </div>
    );
  }

  const hasDiscount = product.promotional_price !== null && product.promotional_price < product.price;
  const currentPrice = hasDiscount ? product.promotional_price! : product.price;
  
  // Simula o desconto no PIX de 5% (comum nesse tipo de loja)
  const pixPrice = currentPrice * 0.95;
  const pixDiscount = currentPrice - pixPrice;

  const faqs = [
    { question: 'Compra Segura', answer: 'Sua compra é processada em ambiente 100% seguro com criptografia de ponta a ponta.' },
    { question: 'Como recebo meu jogo?', answer: 'Após a confirmação do pagamento, você receberá os dados de acesso e o tutorial diretamente no seu e-mail e WhatsApp cadastrados.' },
    { question: 'Prazos de Entrega?', answer: 'O envio é imediato e automático para compras no PIX ou Cartão de Crédito aprovadas.' },
    { question: 'É original e tem garantia?', answer: 'Sim! Garantia vitalícia contra quedas e suporte especializado disponível 24/7 para te ajudar com qualquer dúvida.' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Top Content: Grid de 2 colunas */}
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
          
          {/* Esquerda: Capa do Jogo */}
          <div className="w-full md:w-5/12 lg:w-4/12 flex-shrink-0 relative">
            <div className="absolute inset-0 bg-green-500/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative aspect-[3/4] bg-[#111] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
              {product.main_image ? (
                <img 
                  src={product.main_image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600">
                  Capa do Jogo
                </div>
              )}
            </div>
          </div>

          {/* Direita: Informações de Compra */}
          <div className="w-full md:w-7/12 lg:w-8/12 flex flex-col justify-center">
            
            <div className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-white">CONSOLES</span>
              <span>•</span>
              <span>{product.categories?.name || 'Geral'}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-6">
              {product.name}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="bg-[#eab308] text-black font-extrabold text-xs px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)] uppercase">
                Jogo em Mídia Digital
              </span>
              <span className="border border-white/20 text-neutral-300 font-bold text-xs px-3 py-1.5 rounded-full uppercase">
                Leve 2 jogos e ganhe 10% OFF
              </span>
            </div>

            {/* Caixa de Preço Escura */}
            <div className="bg-[#111111] border border-white/5 rounded-[24px] p-6 lg:p-8 relative overflow-hidden mb-8 shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <p className="text-neutral-400 text-sm font-semibold mb-2">Adquira agora por apenas</p>
                
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-2xl font-bold text-neutral-500">R$</span>
                  <span className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter">
                    {currentPrice.toFixed(2).replace('.', ',')}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-neutral-500 line-through mb-1 ml-2 font-medium">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-4">
                  <CheckCircle2 size={16} />
                  <span>Preço garantido! 5% de desconto à vista no PIX</span>
                </div>

                <div className="w-full h-px bg-white/10 my-4" />

                <p className="text-xs text-neutral-400 font-medium">
                  À vista no <strong className="text-green-500">PIX</strong> por <strong className="text-white">R$ {pixPrice.toFixed(2).replace('.', ',')}</strong> — você economiza <strong className="text-green-500">R$ {pixDiscount.toFixed(2).replace('.', ',')}</strong>
                </p>
              </div>
            </div>

            {/* Cronômetro Fake (Vibe de urgência) */}
            <div className="bg-[#1a1a1a] border border-red-500/20 rounded-[20px] p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                <Clock size={16} />
                <span className="uppercase tracking-widest">Jogue mais e pague menos</span>
              </div>
              
              <div className="flex items-center gap-2">
                {['01', '10', '02', '46'].map((num, i, arr) => (
                  <React.Fragment key={i}>
                    <div className="bg-black border border-white/10 rounded-lg w-12 h-14 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-xl font-black text-white">{num}</span>
                      <span className="text-[8px] font-bold text-neutral-500 uppercase">{['DIAS', 'HRS', 'MIN', 'SEG'][i]}</span>
                    </div>
                    {i < arr.length - 1 && <span className="text-red-500 font-black animate-pulse">:</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Botão de Comprar Dinâmico ou Esgotado */}
            {product.stock <= 0 ? (
              <button 
                disabled 
                className="w-full bg-neutral-800 text-neutral-500 text-lg md:text-xl font-black uppercase tracking-widest py-5 rounded-[20px] flex items-center justify-center gap-3 cursor-not-allowed"
              >
                <ShoppingCart size={24} />
                ESGOTADO
              </button>
            ) : (
              <button 
                onClick={async () => {
                try {
                  // O loading vai ser adicionado no estado acima. Como não criei o useState para isso ainda, vamos adaptar:
                  const btn = document.getElementById('buy-button');
                  if (btn) {
                    btn.innerHTML = '<div class="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>';
                    btn.setAttribute('disabled', 'true');
                  }
                  
                  // Se já houver um checkout_url salvo manualmente pelo admin, usa ele direto
                  if (product.checkout_url) {
                    window.location.href = product.checkout_url;
                    return;
                  }

                  const { data, error } = await supabase.functions.invoke('vega-checkout', {
                    body: { productId: product.id }
                  });

                  if (error) throw error;
                  if (data?.checkout_url) {
                    window.location.href = data.checkout_url;
                  } else {
                    alert('Erro ao gerar link de pagamento. Tente novamente mais tarde.');
                  }
                } catch (err) {
                  console.error('Erro no checkout:', err);
                  alert('Erro ao se comunicar com o sistema de pagamento.');
                } finally {
                  const btn = document.getElementById('buy-button');
                  if (btn) {
                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg> Comprar Agora';
                    btn.removeAttribute('disabled');
                  }
                }
              }}
              id="buy-button"
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black text-lg md:text-xl font-black uppercase tracking-widest py-5 rounded-[20px] transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <ShoppingCart size={24} />
              Comprar Agora
            </button>
            )}

          </div>
        </div>

        {/* Dúvidas Frequentes (Accordion) */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black uppercase tracking-[0.3em] text-white">
              Dúvidas Frequentes
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button 
                  className="w-full p-5 md:p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <span className="font-bold text-white text-base md:text-lg">{faq.question}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-green-500 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-5 md:p-6 pt-0 text-neutral-400 text-sm md:text-base leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
