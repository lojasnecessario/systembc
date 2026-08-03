import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, ChevronDown, ShieldCheck, Truck, Package, Star, StarHalf, User, CreditCard } from 'lucide-react';
import { ProductCard } from '../../components/storefront/ProductCard';
import { ProductReviews } from '../../components/storefront/ProductReviews';
import { uploadImage } from '../../utils/upload';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariables, setSelectedVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product?.main_image) {
      setSelectedImage(product.main_image);
    }
  }, [product]);

  useEffect(() => {
    setSelectedImage(null);
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

        let relatedDataArr: any[] = [];

        if (data.category_id) {
          const { data: catData, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .eq('is_active', true)
            .limit(4);
            
          if (!relatedError && catData) {
            relatedDataArr = catData;
          }
        }

        if (relatedDataArr.length === 0) {
          // Fallback para produtos aleatórios/recentes
          const { data: fallbackData } = await supabase
            .from('products')
            .select('*')
            .neq('id', data.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(4);
            
          if (fallbackData) {
            relatedDataArr = fallbackData;
          }
        }
        
        setRelatedProducts(relatedDataArr);

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

  const faqs = [
    { question: 'Compra Segura', answer: 'Sua compra é processada em ambiente 100% seguro com criptografia de ponta a ponta.' },
    { question: 'Como recebo meu produto?', answer: 'Após a confirmação do pagamento, seu pedido será processado e enviado. Você receberá o código de rastreio e todas as atualizações no seu e-mail e WhatsApp.' },
    { question: 'Prazos de Entrega?', answer: 'Despachamos o seu pedido rapidamente após a aprovação do pagamento via PIX ou Cartão de Crédito.' },
    { question: 'É original e tem garantia?', answer: 'Sim! Garantia de 6 meses contra quedas e suporte especializado disponível 24/7 para te ajudar com qualquer dúvida.' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d0a] text-[#eef4ea] pt-24 lg:pt-36 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Top Content: Grid de 2 colunas */}
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
          
          {/* Esquerda: Capa do Jogo e Galeria */}
          <div className="w-full md:w-5/12 lg:w-4/12 flex-shrink-0 flex flex-col gap-4 max-w-sm mx-auto md:max-w-none">
            <div className="relative w-full bg-transparent rounded-3xl overflow-hidden border border-[#1b241a] shadow-[0_0_30px_rgba(51,227,106,0.1)] group">
              <div className="absolute inset-0 bg-[#33e36a]/10 blur-[100px] rounded-full pointer-events-none" />
              {selectedImage || product.main_image ? (
                <img 
                  src={selectedImage || product.main_image} 
                  alt={product.name} 
                  className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105 relative z-10"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600 font-heading relative z-10">
                  Imagem do Produto
                </div>
              )}
            </div>

            {/* Seletor de fotos (Galeria Slim e Soft) */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 relative w-16 h-20 md:w-20 md:h-28 rounded-xl overflow-hidden border-2 transition-all duration-300 bg-transparent ${
                      (selectedImage || product.main_image) === img 
                        ? 'border-[#33e36a] shadow-[0_0_15px_rgba(51,227,106,0.3)] opacity-100 scale-105' 
                        : 'border-[#1b241a] opacity-60 hover:opacity-100 hover:border-[#33e36a]/50'
                    }`}
                  >
                    <img src={img} alt={`Galeria ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direita: Informações de Compra */}
          <div className="w-full md:w-7/12 lg:w-8/12 flex flex-col justify-center">
            
            {/* Bloco Branco Centralizado */}
            <div className="bg-white rounded-3xl p-4 lg:p-6 shadow-2xl relative overflow-hidden flex flex-col text-black">
              
              <div className="text-black text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="text-green-600">CONSOLES</span>
                <span>•</span>
                <span>{product.categories?.name || 'Geral'}</span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold tracking-tight text-black leading-none mb-4 uppercase">
                {product.name}
              </h1>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-[#33e36a] text-black font-bold text-xs px-3 py-1.5 rounded uppercase shadow-sm">
                  Envio Rápido
                </span>
                <span className="border border-neutral-300 bg-neutral-100 text-black font-bold text-xs px-3 py-1.5 rounded uppercase">
                  Garantia de 6 meses
                </span>
              </div>

              {/* Caixa de Preço Clara */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 lg:p-5 relative overflow-hidden mb-4 shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#33e36a]/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                  <p className="text-black text-sm font-semibold mb-1 uppercase tracking-wide">Adquira agora por apenas</p>
                  
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-black">R$</span>
                    <span className="text-4xl md:text-5xl font-heading font-bold text-black leading-none tracking-tighter">
                      {currentPrice.toFixed(2).replace('.', ',')}
                    </span>
                    {hasDiscount && (
                      <span className="text-base text-neutral-600 line-through mb-1 ml-2 font-medium">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Vantagens Neon */}
              <div className="flex items-center gap-2 mb-4 flex-wrap justify-center sm:justify-start">
                <div 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#33e36a] text-[#33e36a] bg-[#33e36a]/10" 
                  style={{ boxShadow: '0 0 10px rgba(51, 227, 106, 0.4), inset 0 0 5px rgba(51, 227, 106, 0.2)' }}
                >
                  <Truck size={12} className="drop-shadow-[0_0_4px_rgba(51,227,106,0.8)]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ textShadow: '0 0 5px rgba(51, 227, 106, 0.8)' }}>
                    Frete Grátis
                  </span>
                </div>
                
                <div 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#33e36a] text-[#33e36a] bg-[#33e36a]/10" 
                  style={{ boxShadow: '0 0 10px rgba(51, 227, 106, 0.4), inset 0 0 5px rgba(51, 227, 106, 0.2)' }}
                >
                  <ShieldCheck size={12} className="drop-shadow-[0_0_4px_rgba(51,227,106,0.8)]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ textShadow: '0 0 5px rgba(51, 227, 106, 0.8)' }}>
                    Garantia Estendida
                  </span>
                </div>
                
                <div 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#33e36a] text-[#33e36a] bg-[#33e36a]/10" 
                  style={{ boxShadow: '0 0 10px rgba(51, 227, 106, 0.4), inset 0 0 5px rgba(51, 227, 106, 0.2)' }}
                >
                  <CreditCard size={12} className="drop-shadow-[0_0_4px_rgba(51,227,106,0.8)]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ textShadow: '0 0 5px rgba(51, 227, 106, 0.8)' }}>
                    Parcela em 12x
                  </span>
                </div>
              </div>

              {/* Bandeiras de Cartão */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-4 shadow-sm">
                <span className="text-xs text-black font-semibold uppercase tracking-wider">Pagamento Seguro:</span>
                <div className="flex items-center gap-2">
                  {/* Visa */}
                  <svg viewBox="0 0 38 24" className="w-10 h-auto opacity-90 hover:opacity-100 transition-opacity cursor-pointer" fill="none">
                    <rect width="38" height="24" rx="4" fill="#1434CB"/>
                    <text x="19" y="16" fill="#fff" fontSize="10" fontStyle="italic" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">VISA</text>
                  </svg>
                  {/* Mastercard */}
                  <svg viewBox="0 0 38 24" className="w-10 h-auto opacity-90 hover:opacity-100 transition-opacity cursor-pointer" fill="none">
                    <rect width="38" height="24" rx="4" fill="#202020"/>
                    <circle cx="15" cy="12" r="7" fill="#EB001B"/>
                    <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
                    <path d="M19 17.7a7 7 0 0 0 0-11.4 7 7 0 0 0 0 11.4z" fill="#FF5F00"/>
                  </svg>
                  {/* Amex */}
                  <svg viewBox="0 0 38 24" className="w-10 h-auto opacity-90 hover:opacity-100 transition-opacity cursor-pointer" fill="none">
                    <rect width="38" height="24" rx="4" fill="#016FD0"/>
                    <text x="19" y="16" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">AMEX</text>
                  </svg>
                  {/* Pix */}
                  <svg viewBox="0 0 38 24" className="w-10 h-auto opacity-90 hover:opacity-100 transition-opacity cursor-pointer" fill="none">
                    <rect width="38" height="24" rx="4" fill="#32BCAD"/>
                    <text x="19" y="16" fill="#fff" fontSize="10" fontStyle="italic" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">PIX</text>
                  </svg>
                </div>
              </div>

              {/* Variações de Produto */}
              {product.variables && product.variables.length > 0 && (
                <div className="mb-6 space-y-4">
                  {product.variables.map((v: any, vIdx: number) => (
                    <div key={vIdx}>
                      <h4 className="text-sm font-bold text-black mb-2 uppercase">{v.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {v.options.map((opt: string, optIdx: number) => (
                          <button
                            key={optIdx}
                            onClick={() => {
                              setSelectedVariables({ ...selectedVariables, [v.name]: opt });
                              if (v.option_images && v.option_images[opt]) {
                                setSelectedImage(v.option_images[opt]);
                              }
                            }}
                            className={`px-4 py-2 border text-sm font-bold rounded-lg transition-all ${
                              selectedVariables[v.name] === opt
                                ? 'bg-black text-[#33e36a] border-black'
                                : 'bg-white text-black border-neutral-300 hover:border-black'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botão de Comprar Dinâmico ou Esgotado */}
              {product.stock <= 0 ? (
                <button 
                  disabled 
                  className="w-full bg-neutral-100 text-black text-lg md:text-xl font-heading font-bold uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 cursor-not-allowed border border-neutral-300"
                >
                  <ShoppingCart size={24} />
                  ESGOTADO
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (product.variables && product.variables.length > 0) {
                      const missingVars = product.variables.filter((v: any) => !selectedVariables[v.name]);
                      if (missingVars.length > 0) {
                        alert(`Por favor, selecione: ${missingVars.map((v: any) => v.name).join(', ')}`);
                        return;
                      }
                    }
                    const query = new URLSearchParams(selectedVariables).toString();
                    navigate(`/checkout/${slug}${query ? `?${query}` : ''}`);
                  }}
                  id="buy-button"
                  className="w-full bg-[#33e36a] hover:bg-[#11a544] disabled:opacity-50 disabled:cursor-not-allowed text-black text-lg md:text-xl font-heading font-bold uppercase tracking-widest py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(51,227,106,0.2)] hover:shadow-[0_0_30px_rgba(51,227,106,0.4)] hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <ShoppingCart size={24} />
                  Comprar Agora
                </button>
              )}

              {/* Selos de Confiança */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="flex flex-col items-center justify-center p-3 bg-neutral-50 border border-neutral-200 rounded-xl gap-1 text-center transition-all duration-300 hover:border-green-400">
                  <ShieldCheck className="text-green-600" size={24} />
                  <span className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-wide leading-tight">Compra<br/>Segura</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-neutral-50 border border-neutral-200 rounded-xl gap-1 text-center transition-all duration-300 hover:border-green-400">
                  <Truck className="text-green-600" size={24} />
                  <span className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-wide leading-tight">Envio<br/>Rápido</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-neutral-50 border border-neutral-200 rounded-xl gap-1 text-center transition-all duration-300 hover:border-green-400">
                  <Package className="text-green-600" size={24} />
                  <span className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-wide leading-tight">Produto<br/>Garantido</span>
                </div>
              </div>

            </div>

            {/* Neon Button Google Reviews */}
            <Link 
              to="/google"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-[#06250f] text-[#33e36a] text-lg font-heading font-bold uppercase tracking-widest py-4 rounded-xl border border-[#33e36a] transition-all duration-300 shadow-[0_0_15px_rgba(51,227,106,0.3)] hover:shadow-[0_0_25px_rgba(51,227,106,0.6)] hover:-translate-y-1"
            >
              Avaliações Google
            </Link>

            {/* Descrição Expansível */}
            <div className="mt-6 bg-[#141A12] border border-[#1b241a] rounded-xl overflow-hidden shadow-lg">
              <button 
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-[#1b241a] transition-colors"
              >
                <span className="font-heading font-bold text-[#eef4ea] text-lg uppercase tracking-wide">Descrição do Produto</span>
                <ChevronDown 
                  size={24} 
                  className={`text-[#33e36a] transition-transform duration-300 ${isDescriptionOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <div 
                className={`transition-all duration-500 ease-in-out ${
                  isDescriptionOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {product.description ? (
                  <div 
                    className="p-5 pt-0 text-white text-sm md:text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <div className="p-5 pt-0 text-white text-sm md:text-base leading-relaxed">
                    Nenhuma descrição disponível para este produto.
                  </div>
                )}
              </div>
            </div>

            {/* SEÇÃO DE AVALIAÇÕES */}
            <ProductReviews productId={product.id} productHandle={product.slug} />

          </div>
        </div>

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
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
