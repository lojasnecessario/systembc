import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, CheckCircle2, ChevronDown, ShieldCheck, Truck, Package, Star, StarHalf, User, CreditCard } from 'lucide-react';
import { ProductCard } from '../../components/storefront/ProductCard';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Avaliações
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    if (product?.main_image && !selectedImage) {
      setSelectedImage(product.main_image);
    }
  }, [product]);

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

        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', data.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
          
        if (reviewsData) {
          setReviews(reviewsData);
        }

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
  
  // Simula o desconto no PIX de 5%
  const pixPrice = currentPrice * 0.95;
  const pixDiscount = currentPrice - pixPrice;

  const faqs = [
    { question: 'Compra Segura', answer: 'Sua compra é processada em ambiente 100% seguro com criptografia de ponta a ponta.' },
    { question: 'Como recebo meu jogo?', answer: 'Após a confirmação do pagamento, você receberá os dados de acesso e o tutorial diretamente no seu e-mail e WhatsApp cadastrados.' },
    { question: 'Prazos de Entrega?', answer: 'O envio é imediato e automático para compras no PIX ou Cartão de Crédito aprovadas.' },
    { question: 'É original e tem garantia?', answer: 'Sim! Garantia vitalícia contra quedas e suporte especializado disponível 24/7 para te ajudar com qualquer dúvida.' },
  ];

  // Avaliação helpers
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length 
    : 0;

  const renderStars = (rating: number, size = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={size} className="fill-[#33e36a] text-[#33e36a]" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" size={size} className="fill-[#33e36a] text-[#33e36a]" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={size} className="text-neutral-600" />);
    }
    return stars;
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.rating) {
      setReviewMessage('Por favor, preencha o nome e a nota.');
      return;
    }
    try {
      setIsSubmittingReview(true);
      const { error } = await supabase.from('product_reviews').insert([{
        product_id: product.id,
        reviewer_name: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        is_approved: false // Por padrão, vai para aprovação do admin
      }]);
      if (error) throw error;
      setReviewMessage('Avaliação enviada com sucesso! Ela aparecerá após ser aprovada.');
      setReviewForm({ name: '', rating: 5, comment: '' });
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      setReviewMessage('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d0a] text-[#eef4ea] pt-24 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Top Content: Grid de 2 colunas */}
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
          
          {/* Esquerda: Capa do Jogo e Galeria */}
          <div className="w-full md:w-5/12 lg:w-4/12 flex-shrink-0 flex flex-col gap-4 max-w-sm mx-auto md:max-w-none">
            <div className="relative w-full aspect-square bg-white rounded-3xl overflow-hidden border border-[#1b241a] shadow-[0_0_30px_rgba(51,227,106,0.1)] group">
              <div className="absolute inset-0 bg-[#33e36a]/10 blur-[100px] rounded-full pointer-events-none" />
              {selectedImage || product.main_image ? (
                <img 
                  src={selectedImage || product.main_image} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 relative z-10"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600 font-heading relative z-10">
                  Capa do Jogo
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
                    className={`flex-shrink-0 relative w-16 h-20 md:w-20 md:h-28 rounded-xl overflow-hidden border-2 transition-all duration-300 bg-white ${
                      (selectedImage || product.main_image) === img 
                        ? 'border-[#33e36a] shadow-[0_0_15px_rgba(51,227,106,0.3)] opacity-100 scale-105' 
                        : 'border-[#1b241a] opacity-60 hover:opacity-100 hover:border-[#33e36a]/50'
                    }`}
                  >
                    <img src={img} alt={`Galeria ${idx + 1}`} className="w-full h-full object-contain p-1" />
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
                  Envio Digital Imediato
                </span>
                <span className="border border-neutral-300 bg-neutral-100 text-black font-bold text-xs px-3 py-1.5 rounded uppercase">
                  Garantia Vitalícia
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

                  <div className="flex items-center gap-2 text-green-700 font-bold text-sm mb-2">
                    <CheckCircle2 size={16} />
                    <span>Preço garantido! 5% de desconto à vista no PIX</span>
                  </div>

                  <div className="w-full h-px bg-neutral-200 my-3" />

                  <p className="text-xs text-black font-medium uppercase tracking-wide">
                    À vista no <strong className="text-green-700">PIX</strong> por <strong>R$ {pixPrice.toFixed(2).replace('.', ',')}</strong> — você economiza <strong className="text-green-700">R$ {pixDiscount.toFixed(2).replace('.', ',')}</strong>
                  </p>
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
                    <path d="M14.072 17.618l2.253-14.23h3.58l-2.253 14.23h-3.58zm17.91-14.004c-1.127-.428-2.67-.732-4.237-.732-3.834 0-6.536 2.046-6.554 4.975-.028 2.164 1.94 3.364 3.418 4.092 1.513.743 2.022 1.22 2.022 1.884-.02 1.018-1.224 1.488-2.35 1.488-1.572 0-2.418-.242-3.69-.812l-.526-.248-.5 3.123c.922.427 2.628.796 4.394.814 4.053 0 6.717-1.996 6.745-5.086.02-1.725-1.026-3.04-3.298-4.135-1.353-.715-2.183-1.192-2.183-1.916.02-.676.75-1.39 2.24-1.39 1.246-.02 2.146.262 2.85.57l.34.156.49-3.044zM10.87 3.614c-.694 0-1.29.5-1.517 1.157L5.8 17.618H2.15l-.234-1.096C1.458 14.364.5 11.233.02 9.775L2.9 3.614h3.69l1.96 9.873 2.827-9.873h3.5l-3.996 14.004H7.218z" fill="#fff"/>
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
                    <path d="M19 16.5l-4.5-4.5 4.5-4.5 4.5 4.5-4.5 4.5z" stroke="#fff" strokeWidth="2"/>
                    <circle cx="19" cy="12" r="1.5" fill="#fff"/>
                  </svg>
                </div>
              </div>

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
                  onClick={async () => {
                  try {
                    const btn = document.getElementById('buy-button');
                    if (btn) {
                      btn.innerHTML = '<div class="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>';
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
                  <span className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-wide leading-tight">Envio<br/>Imediato</span>
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
                    className="p-5 pt-0 text-[#8b977f] text-sm md:text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <div className="p-5 pt-0 text-[#8b977f] text-sm md:text-base leading-relaxed">
                    Nenhuma descrição disponível para este produto.
                  </div>
                )}
              </div>
            </div>

            {/* SEÇÃO DE AVALIAÇÕES */}
            <div className="mt-8 bg-[#0f130e] border border-[#1b241a] rounded-3xl overflow-hidden shadow-lg">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="text-[#33e36a]" size={28} />
                  <h2 className="text-2xl font-heading font-bold text-[#eef4ea] uppercase">Avaliações de Clientes</h2>
                </div>

                {/* Resumo */}
                <div className="flex items-center gap-4 mb-8 p-4 bg-[#141A12] rounded-xl border border-[#1b241a]">
                  <div className="text-4xl font-heading font-bold text-[#eef4ea]">
                    {averageRating.toFixed(1).replace('.', ',')}
                  </div>
                  <div>
                    <div className="flex gap-1 mb-1">
                      {renderStars(averageRating, 18)}
                    </div>
                    <div className="text-[#8b977f] text-sm">
                      Baseado em {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
                    </div>
                  </div>
                </div>

                {/* Lista de Avaliações */}
                <div className="space-y-4 mb-8">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="p-4 bg-[#141A12] border border-[#1b241a] rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#1b241a] flex items-center justify-center text-[#33e36a]">
                              <User size={16} />
                            </div>
                            <div>
                              <div className="text-[#eef4ea] font-medium text-sm">{review.reviewer_name}</div>
                              <div className="text-[#8b977f] text-xs">Comprador Verificado</div>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {renderStars(review.rating, 14)}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-[#8b977f] text-sm mt-3 leading-relaxed">
                            "{review.comment}"
                          </p>
                        )}
                        {review.image_url && (
                          <div className="mt-3">
                            <img 
                              src={review.image_url} 
                              alt={`Foto da avaliação de ${review.reviewer_name}`}
                              className="w-24 h-24 object-cover rounded-lg border border-[#1b241a] shadow-sm hover:scale-150 origin-bottom-left md:origin-center transition-transform duration-300 z-10 relative cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#8b977f]">
                      <Star size={32} className="mx-auto mb-3 opacity-20" />
                      <p>Seja o primeiro a avaliar este produto!</p>
                    </div>
                  )}
                </div>

                {/* Formulário */}
                <div className="pt-6 border-t border-[#1b241a]">
                  <h3 className="text-xl font-heading font-bold text-[#eef4ea] mb-4">Deixe sua Avaliação</h3>
                  
                  {reviewMessage && (
                    <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                      reviewMessage.includes('sucesso') 
                        ? 'bg-[#33e36a]/10 text-[#33e36a] border border-[#33e36a]/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {reviewMessage}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#8b977f] text-sm mb-1">Seu Nome</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.name}
                          onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          className="w-full bg-[#141A12] border border-[#1b241a] rounded-xl px-4 py-3 text-[#eef4ea] focus:outline-none focus:border-[#33e36a] transition-colors"
                          placeholder="Como quer ser chamado?"
                        />
                      </div>
                      <div>
                        <label className="block text-[#8b977f] text-sm mb-1">Nota (0 a 5)</label>
                        <select
                          required
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                          className="w-full bg-[#141A12] border border-[#1b241a] rounded-xl px-4 py-3 text-[#eef4ea] focus:outline-none focus:border-[#33e36a] transition-colors appearance-none"
                        >
                          <option value="5">5 Estrelas - Excelente</option>
                          <option value="4">4 Estrelas - Muito Bom</option>
                          <option value="3">3 Estrelas - Bom</option>
                          <option value="2">2 Estrelas - Regular</option>
                          <option value="1">1 Estrela - Ruim</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[#8b977f] text-sm mb-1">Comentário (opcional)</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full bg-[#141A12] border border-[#1b241a] rounded-xl px-4 py-3 text-[#eef4ea] focus:outline-none focus:border-[#33e36a] transition-colors resize-none"
                        rows={3}
                        placeholder="O que você achou do jogo?"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full bg-neutral-800 hover:bg-[#33e36a] text-[#eef4ea] hover:text-[#06250f] disabled:opacity-50 font-bold uppercase tracking-wide py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmittingReview ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Star size={18} />
                          Enviar Avaliação
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

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
