import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, CheckCircle2, ChevronDown, Clock, ShieldCheck, Truck, Package } from 'lucide-react';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        setLoading(true);
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

        if (data.category_id) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .limit(4);
            
          if (!relatedError && relatedData) {
            setRelatedProducts(relatedData);
          }
        }
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
      <div className="min-h-screen bg-[#0a0d0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#33e36a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0d0a] flex items-center justify-center text-[#eef4ea] font-heading font-bold text-xl">
        Produto não encontrado.
      </div>
    );
  }

  const hasDiscount = product.promotional_price !== null && product.promotional_price < product.price;
  const currentPrice = hasDiscount ? product.promotional_price! : product.price;
  
  // Simula o desconto no PIX de 5%
  const pixPrice = currentPrice * 0.95;
  const pixDiscount = currentPrice - pixPrice;

  const faqs = [
    { question: 'Compra Segura', answer: 'Sua compra é processada em ambiente 100% seguro com criptografia de ponta a ponta.' },
    { question: 'Como recebo meu jogo?', answer: 'Após a confirmação do pagamento, você receberá os dados de acesso e o tutorial diretamente no seu e-mail e WhatsApp cadastrados.' },
    { question: 'Prazos de Entrega?', answer: 'O envio é imediato e automático para compras no PIX ou Cartão de Crédito aprovadas.' },
    { question: 'É original e tem garantia?', answer: 'Sim! Garantia vitalícia contra quedas e suporte especializado disponível 24/7 para te ajudar com qualquer dúvida.' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d0a] text-[#eef4ea] pt-24 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Top Content: Grid de 2 colunas */}
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
          
          {/* Esquerda: Capa do Jogo */}
          <div className="w-full md:w-5/12 lg:w-4/12 flex-shrink-0 relative">
            <div className="absolute inset-0 bg-[#33e36a]/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative aspect-[3/4] bg-[#0f130e] rounded-3xl overflow-hidden border border-[#1b241a] shadow-[0_0_30px_rgba(51,227,106,0.1)]">
              {product.main_image ? (
                <img 
                  src={product.main_image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600 font-heading">
                  Capa do Jogo
                </div>
              )}
            </div>
          </div>

          {/* Direita: Informações de Compra */}
          <div className="w-full md:w-7/12 lg:w-8/12 flex flex-col justify-center">
            
            <div className="text-[#8b977f] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-[#33e36a]">CONSOLES</span>
              <span>•</span>
              <span>{product.categories?.name || 'Geral'}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-none mb-6 uppercase">
              {product.name}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="bg-[#33e36a] text-[#06250f] font-bold text-xs px-3 py-1.5 rounded uppercase shadow-sm">
                Envio Digital Imediato
              </span>
              <span className="border border-[#1b241a] bg-[#141A12] text-[#8b977f] font-bold text-xs px-3 py-1.5 rounded uppercase">
                Garantia Vitalícia
              </span>
            </div>

            {/* Caixa de Preço Escura */}
            <div className="bg-[#141A12] border border-[#1b241a] rounded-2xl p-6 lg:p-8 relative overflow-hidden mb-8 shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#33e36a]/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <p className="text-[#8b977f] text-sm font-semibold mb-2 uppercase tracking-wide">Adquira agora por apenas</p>
                
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-2xl font-bold text-[#363f31]">R$</span>
                  <span className="text-5xl md:text-6xl font-heading font-bold text-[#eef4ea] leading-none tracking-tighter">
                    {currentPrice.toFixed(2).replace('.', ',')}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-[#8b977f] line-through mb-1 ml-2 font-medium">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[#33e36a] font-bold text-sm mb-4">
                  <CheckCircle2 size={16} />
                  <span>Preço garantido! 5% de desconto à vista no PIX</span>
                </div>

                <div className="w-full h-px bg-[#1b241a] my-4" />

                <p className="text-xs text-[#8b977f] font-medium uppercase tracking-wide">
                  À vista no <strong className="text-[#33e36a]">PIX</strong> por <strong className="text-[#eef4ea]">R$ {pixPrice.toFixed(2).replace('.', ',')}</strong> — você economiza <strong className="text-[#33e36a]">R$ {pixDiscount.toFixed(2).replace('.', ',')}</strong>
                </p>
              </div>
            </div>

            {/* Bandeiras de Cartão */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 bg-[#141A12] border border-[#1b241a] rounded-xl py-3 px-4 shadow-lg">
              <span className="text-xs text-[#8b977f] font-semibold uppercase tracking-wider">Pagamento Seguro:</span>
              <div className="flex items-center gap-2">
                {/* Visa */}
                <svg viewBox="0 0 38 24" className="w-10 h-auto opacity-80 hover:opacity-100 transition-opacity cursor-pointer" fill="none">
                  <rect width="38" height="24" rx="4" fill="#1434CB"/>
                  <path d="M14.072 17.618l2.253-14.23h3.58l-2.253 14.23h-3.58zm17.91-14.004c-1.127-.428-2.67-.732-4.237-.732-3.834 0-6.536 2.046-6.554 4.975-.028 2.164 1.94 3.364 3.418 4.092 1.513.743 2.022 1.22 2.022 1.884-.02 1.018-1.224 1.488-2.35 1.488-1.572 0-2.418-.242-3.69-.812l-.526-.248-.5 3.123c.922.427 2.628.796 4.394.814 4.053 0 6.717-1.996 6.745-5.086.02-1.725-1.026-3.04-3.298-4.135-1.353-.715-2.183-1.192-2.183-1.916.02-.676.75-1.39 2.24-1.39 1.246-.02 2.146.262 2.85.57l.34.156.49-3.044zM10.87 3.614c-.694 0-1.29.5-1.517 1.157L5.8 17.618H2.15l-.234-1.096C1.458 14.364.5 11.233.02 9.775L2.9 3.614h3.69l1.96 9.873 2.827-9.873h3.5l-3.996 14.004H7.218z" fill="#fff"/>
                </svg>
                {/* Mastercard */}
                <svg viewBox="0 0 38 24" className="w-10 h-auto opacity-80 hover:opacity-100 transition-opacity cursor-pointer" fill="none">
                  <rect width="38" height="24" rx="4" fill="#202020"/>
                  <circle cx="15" cy="12" r="7" fill="#EB001B"/>
                  <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
                  <path d="M19 17.7a7 7 0 0 0 0-11.4 7 7 0 0 0 0 11.4z" fill="#FF5F00"/>
                </svg>
                {/* Amex */}
                <svg viewBox="0 0 38 24" className="w-10 h-auto opacity-80 hover:opacity-100 transition-opacity cursor-pointer" fill="none">
                  <rect width="38" height="24" rx="4" fill="#016FD0"/>
                  <text x="19" y="16" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">AMEX</text>
                </svg>
                {/* Pix */}
                <svg viewBox="0 0 38 24" className="w-10 h-auto opacity-80 hover:opacity-100 transition-opacity cursor-pointer" fill="none">
                  <rect width="38" height="24" rx="4" fill="#32BCAD"/>
                  <path d="M19 16.5l-4.5-4.5 4.5-4.5 4.5 4.5-4.5 4.5z" stroke="#fff" strokeWidth="2"/>
                  <circle cx="19" cy="12" r="1.5" fill="#fff"/>
                </svg>
              </div>
            </div>

            {/* Botão de Comprar Dinâmico ou Esgotado */}
            {product.stock <= 0 ? (
              <button 
                disabled 
                className="w-full bg-[#11160f] text-[#363f31] text-lg md:text-xl font-heading font-bold uppercase tracking-widest py-5 rounded-xl flex items-center justify-center gap-3 cursor-not-allowed border border-[#1b241a]"
              >
                <ShoppingCart size={24} />
                ESGOTADO
              </button>
            ) : (
              <button 
                onClick={async () => {
                try {
                  const btn = document.getElementById('buy-button');
                  if (btn) {
                    btn.innerHTML = '<div class="w-6 h-6 border-4 border-[#06250f] border-t-transparent rounded-full animate-spin"></div>';
                    btn.setAttribute('disabled', 'true');
                  }
                  
                  const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      productId: product.id,
                      productName: product.name,
                      productPrice: product.promotional_price || product.price,
                      productDescription: product.description
                    })
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.error || 'Erro desconhecido ao comunicar com a API');
                  }

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
              className="w-full bg-[#33e36a] hover:bg-[#11a544] disabled:opacity-50 disabled:cursor-not-allowed text-[#06250f] text-lg md:text-xl font-heading font-bold uppercase tracking-widest py-5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(51,227,106,0.2)] hover:shadow-[0_0_30px_rgba(51,227,106,0.4)] hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <ShoppingCart size={24} />
              Comprar Agora
            </button>
            )}

            {/* Selos de Confiança */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="flex flex-col items-center justify-center p-4 bg-[#141A12] border border-[#1b241a] rounded-xl gap-2 text-center transition-all duration-300 hover:border-[#33e36a]">
                <ShieldCheck className="text-[#33e36a]" size={28} />
                <span className="text-[10px] sm:text-xs font-bold text-[#8b977f] uppercase tracking-wide leading-tight">Compra<br/>Segura</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-[#141A12] border border-[#1b241a] rounded-xl gap-2 text-center transition-all duration-300 hover:border-[#33e36a]">
                <Truck className="text-[#33e36a]" size={28} />
                <span className="text-[10px] sm:text-xs font-bold text-[#8b977f] uppercase tracking-wide leading-tight">Envio<br/>Imediato</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-[#141A12] border border-[#1b241a] rounded-xl gap-2 text-center transition-all duration-300 hover:border-[#33e36a]">
                <Package className="text-[#33e36a]" size={28} />
                <span className="text-[10px] sm:text-xs font-bold text-[#8b977f] uppercase tracking-wide leading-tight">Produto<br/>Garantido</span>
              </div>
            </div>

          </div>
        </div>

        {/* Produtos Semelhantes */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-heading font-bold uppercase tracking-tight text-[#eef4ea]">
                Veja <span className="text-[#33e36a]">Também</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relProduct) => (
                <Link 
                  key={relProduct.id} 
                  to={`/produto/${relProduct.slug}`}
                  className="group bg-[#141A12] border border-[#1b241a] rounded-xl overflow-hidden hover:border-[#33e36a] transition-all duration-300 hover:-translate-y-1 flex flex-col shadow-md"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#0a0d0a] relative">
                    {relProduct.main_image ? (
                      <img 
                        src={relProduct.main_image} 
                        alt={relProduct.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600 font-heading">
                        Capa do Jogo
                      </div>
                    )}
                    {relProduct.promotional_price && relProduct.promotional_price < relProduct.price && (
                      <div className="absolute top-2 right-2 bg-[#33e36a] text-[#06250f] text-[10px] font-bold uppercase px-2 py-1 rounded shadow-md">
                        Promo
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-grow justify-between">
                    <h3 className="text-[#eef4ea] font-heading font-bold text-sm mb-2 line-clamp-2 group-hover:text-[#33e36a] transition-colors">
                      {relProduct.name}
                    </h3>
                    <div>
                      {relProduct.promotional_price && relProduct.promotional_price < relProduct.price ? (
                        <div className="flex flex-col">
                          <span className="text-[#8b977f] text-[10px] line-through">
                            R$ {relProduct.price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-[#33e36a] font-heading font-bold text-lg">
                            R$ {relProduct.promotional_price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#33e36a] font-heading font-bold text-lg">
                          R$ {relProduct.price.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Dúvidas Frequentes (Accordion) */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold uppercase tracking-tight text-[#eef4ea]">
              Dúvidas <span className="text-[#33e36a]">Frequentes</span>
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-[#141A12] border border-[#1b241a] rounded-xl overflow-hidden transition-all duration-300"
              >
                <button 
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-[#1b241a] transition-colors"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <span className="font-heading font-bold text-[#eef4ea] text-sm md:text-base uppercase tracking-wide">{faq.question}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-[#33e36a] transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-5 pt-0 text-[#8b977f] text-sm leading-relaxed">
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
