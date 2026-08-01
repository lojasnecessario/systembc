import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { CreditCard, CheckCircle, Copy, QrCode, AlertCircle, Lock, ShieldCheck, Home as HomeIcon, Barcode, Star, BadgeCheck } from 'lucide-react';

const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome completo é obrigatório'),
  email: z.string().email('E-mail inválido'),
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cep: z.string().min(8, 'CEP inválido'),
  street: z.string().min(3, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  district: z.string().min(2, 'Bairro é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado inválido (UF)'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const Checkout: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('pix');
  
  // Custom checkout features
  const [checkoutSettings, setCheckoutSettings] = useState<any>(null);
  const [checkoutReviews, setCheckoutReviews] = useState<any[]>([]);
  const [salesNotification, setSalesNotification] = useState<{text: string, time: string} | null>(null);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  
  // Polling state
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema)
  });

  const cep = watch('cep');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) throw new Error('Produto não encontrado');
        if (!data.is_active || data.stock <= 0) throw new Error('Produto indisponível');
        
        setProduct(data);

        // Fetch custom checkout settings and reviews
        try {
          const { data: settingsData } = await supabase.from('checkout_settings').select('*').limit(1).single();
          if (settingsData) setCheckoutSettings(settingsData);

          const { data: reviewsData } = await supabase.from('checkout_reviews').select('*').eq('is_active', true).order('created_at', { ascending: false });
          if (reviewsData) setCheckoutReviews(reviewsData);

          const { data: allProducts } = await supabase.from('products').select('name').eq('is_active', true);
          if (allProducts) setStoreProducts(allProducts);
        } catch (err) {
          console.error('Erro ao carregar configurações adicionais:', err);
        }
      } catch (err: any) {
        alert(err.message || 'Erro ao carregar produto');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug, navigate]);

  useEffect(() => {
    const fetchCep = async () => {
      const cleanCep = cep?.replace(/\D/g, '');
      if (cleanCep?.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          const data = await res.json();
          if (!data.erro) {
            setValue('street', data.logradouro);
            setValue('district', data.bairro);
            setValue('city', data.localidade);
            setValue('state', data.uf);
          }
        } catch (e) {
          console.error('Erro ao buscar CEP', e);
        }
      }
    };
    fetchCep();
  }, [cep, setValue]);

  // Polling for status update
  useEffect(() => {
    if (checkoutResult?.external_code && paymentStatus === 'pending') {
      pollingInterval.current = setInterval(async () => {
        try {
          const { data } = await supabase
            .from('orders')
            .select('status')
            .eq('external_code', checkoutResult.external_code)
            .single();
            
          if (data && data.status === 'approved') {
            setPaymentStatus('approved');
            if (pollingInterval.current) clearInterval(pollingInterval.current);
          }
        } catch (err) {
          console.error('Erro ao checar status:', err);
        }
      }, 5000);
    }

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [checkoutResult, paymentStatus]);

  // Sales Notification Pop-up Logic
  useEffect(() => {
    if (!checkoutSettings?.sales_notification_active) return;
    const names = ['Victor', 'João', 'Maria', 'Lucas', 'Ana', 'Pedro', 'Julia', 'Carlos', 'Mariana', 'Felipe', 'Eduardo', 'Camila'];
    
    // Configura o timer inicial para mostrar logo
    const timeout = setTimeout(() => {
      const showNotification = () => {
        const randomName = names[Math.floor(Math.random() * names.length)];
        const timeStrings = ['Há 1 minuto', 'Há 2 minutos', 'Há 3 minutos'];
        const randomTime = timeStrings[Math.floor(Math.random() * timeStrings.length)];
        
        const randomProduct = storeProducts.length > 0 
          ? storeProducts[Math.floor(Math.random() * storeProducts.length)].name 
          : (product?.name || 'este produto');

        setSalesNotification({
          text: `${randomName} comprou ${randomProduct}`,
          time: randomTime
        });
        
        setTimeout(() => {
          setSalesNotification(null);
        }, 5000); // 5 seconds visible
      };

      showNotification();
      
      const intervalId = setInterval(showNotification, 45000); // Repeat every 45 seconds
      pollingInterval.current = intervalId; // Reuse ref for cleanup if needed, but better to use returned cleanup
    }, 8000); // Initial delay 8s

    return () => {
      clearTimeout(timeout);
    };
  }, [checkoutSettings, product, storeProducts]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!product) return;
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      
      const payload = {
        productId: product.id,
        customer: data,
        paymentMethod: selectedPayment
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }

      setCheckoutResult(result);

    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro ao gerar o pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Código copiado!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#3483fa] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hasDiscount = product?.promotional_price !== null && product?.promotional_price < product?.price;
  const currentPrice = hasDiscount ? product.promotional_price! : product?.price;

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#333333] pb-20 font-sans relative overflow-hidden">
      
      {/* Letreiro (Marquee) */}
      {checkoutSettings?.marquee_active && (
        <div 
          className="w-full text-sm md:text-base font-bold py-2.5 overflow-hidden whitespace-nowrap shadow-sm mb-0"
          style={{ 
            backgroundColor: checkoutSettings.marquee_bg_color || '#dc2626', 
            color: checkoutSettings.marquee_text_color || '#ffffff' 
          }}
        >
          <div className="inline-block" style={{ animation: 'marquee 15s linear infinite' }}>
            {checkoutSettings.marquee_text} &nbsp;&nbsp; &bull; &nbsp;&nbsp; {checkoutSettings.marquee_text} &nbsp;&nbsp; &bull; &nbsp;&nbsp; {checkoutSettings.marquee_text} &nbsp;&nbsp; &bull; &nbsp;&nbsp; {checkoutSettings.marquee_text}
          </div>
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      )}

      {/* Header do Checkout */}
      <header className="w-full py-4 mb-2">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex justify-center md:justify-start">
          <img 
            src="/logomp1.png" 
            alt="Mercado Pago" 
            className="h-12 md:h-14 object-contain" 
          />
        </div>
      </header>

      {/* Pop-up de Vendas */}
      {salesNotification && (
        <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 bg-white border border-gray-200 rounded-lg p-4 shadow-2xl z-50 flex items-center gap-4 animate-[slideUp_0.5s_ease-out] max-w-[300px]">
          <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 shrink-0">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">{salesNotification.text}</p>
            <p className="text-xs text-gray-500 mt-0.5">{salesNotification.time}</p>
          </div>
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-4">
        
        {paymentStatus === 'approved' ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 md:p-12 text-center flex flex-col items-center shadow-sm max-w-2xl mx-auto">
            <CheckCircle className="text-[#00a650] w-24 h-24 mb-6" />
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">Pagamento Aprovado!</h2>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              Seu pedido foi confirmado e já está sendo processado. Você receberá as atualizações por e-mail.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="mt-8 bg-[#3483fa] hover:bg-[#2968c8] text-white font-medium px-8 py-4 rounded-md transition-colors"
            >
              Voltar para a Loja
            </button>
          </div>
        ) : checkoutResult ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-10 text-center flex flex-col items-center max-w-2xl mx-auto shadow-sm">
            <div className="bg-[#3483fa]/10 text-[#3483fa] p-4 rounded-full mb-6">
              <div className="w-8 h-8 border-4 border-[#3483fa] border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aguardando Pagamento</h2>
            <p className="text-gray-600 mb-8">Efetue o pagamento para concluir seu pedido.</p>
            
            {checkoutResult.qr_code_url && (
              <div className="bg-white p-4 rounded-xl mb-6 shadow-sm border border-gray-100 inline-block">
                <img src={checkoutResult.qr_code_url} alt="QR Code PIX" className="w-48 h-48 md:w-64 md:h-64 object-contain" />
              </div>
            )}
            
            {checkoutResult.pix_copy_paste && (
              <div className="w-full max-w-md">
                <p className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wider text-left">PIX Copia e Cola:</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={checkoutResult.pix_copy_paste} 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none"
                  />
                  <button 
                    onClick={() => copyToClipboard(checkoutResult.pix_copy_paste)}
                    className="bg-[#3483fa] hover:bg-[#2968c8] text-white px-4 rounded-md transition-colors flex items-center justify-center"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md w-full max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total a Pagar</span>
                <span className="text-gray-900 font-semibold text-xl">R$ {currentPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Pedido</span>
                <span className="text-gray-900 font-mono">{checkoutResult.external_code}</span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8">
            
            {/* Coluna Esquerda */}
            <div className="w-full lg:w-[65%] space-y-8">
              
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex gap-3 items-start">
                  <AlertCircle className="shrink-0 mt-0.5" size={20} />
                  <p>{errorMsg}</p>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Preencha seus dados</h2>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <input {...register('name')} placeholder="Nome Completo" className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300 focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa]'} rounded-md px-4 py-3 text-gray-800 outline-none`} />
                        {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
                      </div>
                      <div>
                        <input {...register('cpf')} placeholder="CPF" className={`w-full border ${errors.cpf ? 'border-red-500' : 'border-gray-300 focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa]'} rounded-md px-4 py-3 text-gray-800 outline-none`} />
                        {errors.cpf && <span className="text-red-500 text-xs mt-1 block">{errors.cpf.message}</span>}
                      </div>
                      <div>
                        <input {...register('phone')} placeholder="Telefone / WhatsApp" className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa]'} rounded-md px-4 py-3 text-gray-800 outline-none`} />
                        {errors.phone && <span className="text-red-500 text-xs mt-1 block">{errors.phone.message}</span>}
                      </div>
                      <div className="md:col-span-2">
                        <input type="email" {...register('email')} placeholder="E-mail" className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa]'} rounded-md px-4 py-3 text-gray-800 outline-none`} />
                        {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço de Entrega</h3>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <input {...register('cep')} placeholder="CEP" className={`w-full border ${errors.cep ? 'border-red-500' : 'border-gray-300 focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa]'} rounded-md px-4 py-3 text-gray-800 outline-none`} />
                        {errors.cep && <span className="text-red-500 text-xs mt-1 block">{errors.cep.message}</span>}
                      </div>
                      <div className="md:col-span-4">
                        <input {...register('street')} placeholder="Rua / Logradouro" className={`w-full border ${errors.street ? 'border-red-500' : 'border-gray-300 focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa]'} rounded-md px-4 py-3 text-gray-800 outline-none`} />
                        {errors.street && <span className="text-red-500 text-xs mt-1 block">{errors.street.message}</span>}
                      </div>
                      <div className="md:col-span-2">
                        <input {...register('number')} placeholder="Número" className={`w-full border ${errors.number ? 'border-red-500' : 'border-gray-300 focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa]'} rounded-md px-4 py-3 text-gray-800 outline-none`} />
                        {errors.number && <span className="text-red-500 text-xs mt-1 block">{errors.number.message}</span>}
                      </div>
                      <div className="md:col-span-4">
                        <input {...register('complement')} placeholder="Complemento (Opcional)" className="w-full border border-gray-300 focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] rounded-md px-4 py-3 text-gray-800 outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <input {...register('district')} placeholder="Bairro" className={`w-full border ${errors.district ? 'border-red-500' : 'border-gray-300 focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa]'} rounded-md px-4 py-3 text-gray-800 outline-none`} />
                        {errors.district && <span className="text-red-500 text-xs mt-1 block">{errors.district.message}</span>}
                      </div>
                      <div className="md:col-span-3">
                        <input {...register('city')} placeholder="Cidade" className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-300 focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa]'} rounded-md px-4 py-3 text-gray-800 outline-none`} />
                        {errors.city && <span className="text-red-500 text-xs mt-1 block">{errors.city.message}</span>}
                      </div>
                      <div className="md:col-span-1">
                        <input {...register('state')} placeholder="UF" maxLength={2} className={`w-full border ${errors.state ? 'border-red-500' : 'border-gray-300 focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa]'} rounded-md px-4 py-3 text-gray-800 outline-none uppercase`} />
                        {errors.state && <span className="text-red-500 text-xs mt-1 block">{errors.state.message}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Como você prefere pagar?</h2>
                <div className="space-y-4">
                  
                  {/* PIX */}
                  <div className={`bg-white border ${selectedPayment === 'pix' ? 'border-[#3483fa] ring-1 ring-[#3483fa]' : 'border-gray-200'} rounded-lg shadow-sm transition-all overflow-hidden`}>
                    <div 
                      className="flex justify-between items-center p-5 cursor-pointer"
                      onClick={() => setSelectedPayment('pix')}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-[#00b1ea]">
                          <QrCode size={24} />
                        </div>
                        <div>
                          <span className="text-gray-900 font-medium block">PIX</span>
                          <span className="text-gray-500 text-sm">Aprovação imediata</span>
                        </div>
                      </div>
                      <div className="text-sm text-[#3483fa] font-medium hidden sm:block">
                        {selectedPayment === 'pix' ? 'Desmarcar ⌃' : 'Selecionar 〉'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Coluna Direita - Resumo do Pedido */}
            <div className="w-full lg:w-[35%]">
              <div className="sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Detalhe da sua compra</h2>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                    <span className="text-gray-600 line-clamp-2 pr-4">{product.name}</span>
                    <span className="text-gray-900 font-medium whitespace-nowrap">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                  </div>


                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                    {hasDiscount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Desconto</span>
                        <span className="text-[#00a650]">- R$ {(product.price - currentPrice).toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valor do frete</span>
                      <span className="text-[#00a650]">Grátis</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Impostos (estimativa)</span>
                      <span className="text-gray-900">R$ 0,00</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-8">
                    <span className="text-gray-900 font-semibold text-lg">A pagar</span>
                    <span className="text-2xl font-semibold text-gray-900">R$ {currentPrice.toFixed(2).replace('.', ',')}</span>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-[#3483fa] hover:bg-[#2968c8] disabled:opacity-50 text-white font-medium py-4 rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Lock size={16} />
                        Confirmar compra
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <ShieldCheck size={16} className="text-[#3483fa]" />
                    <span>Pagamento protegido por Mercado Pago.</span>
                  </div>
                </div>

                {/* Checkout Reviews */}
                {checkoutReviews && checkoutReviews.length > 0 && (
                  <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">O que dizem os clientes</h3>
                    <div className="space-y-4">
                      {checkoutReviews.map((review) => (
                        <div key={review.id} className="pt-2">
                          <div className="flex items-center gap-1 text-orange-400 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? 'text-orange-400' : 'text-gray-300'} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-700 italic">"{review.description}"</p>
                          {review.image_url && (
                            <img src={review.image_url} alt="Review" className="mt-3 w-24 h-24 object-cover rounded-md border border-gray-200 shadow-sm" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mercado Livre Credibility Badge (Recreated in Code - Scaled Down) */}
                <div className="mt-6 bg-white border border-[#3483fa] rounded-xl p-2.5 shadow-sm flex items-center gap-3 relative overflow-hidden mx-auto max-w-[320px]">
                  
                  {/* Left Side: Seal Graphic */}
                  <div className="w-[60px] shrink-0 flex flex-col items-center justify-center relative z-10">
                    <div className="absolute -top-1 -left-1 z-20 bg-[#3483fa] rounded-full p-0.5 border-2 border-white shadow-sm">
                      <CheckCircle size={12} className="text-white" strokeWidth={3} />
                    </div>
                    {/* Wavy/Ribbon Badge Base */}
                    <div className="relative flex flex-col items-center justify-center">
                      <div className="w-[56px] h-[56px] bg-[#3483fa] rounded-full flex items-center justify-center relative z-10 shadow-sm">
                        {/* Inner White Circle */}
                        <div className="w-[46px] h-[46px] bg-white rounded-full flex flex-col items-center justify-center p-1.5 z-20 shadow-inner">
                          <img 
                            src="/logomp2.png" 
                            alt="MP Logo" 
                            className="w-full object-contain" 
                          />
                        </div>
                      </div>
                      {/* Ribbons */}
                      <div className="absolute -bottom-2 left-1 w-4 h-5 bg-[#1f5ab3] rounded-b text-transparent -rotate-12 z-0 skew-x-12"></div>
                      <div className="absolute -bottom-2 right-1 w-4 h-5 bg-[#1f5ab3] rounded-b text-transparent rotate-12 z-0 -skew-x-12"></div>
                    </div>
                  </div>

                  {/* Right Side: Text & Rating */}
                  <div className="flex flex-col flex-1 pl-1 border-l border-gray-100">
                    <h4 className="text-[#001b5e] font-black text-[11px] leading-tight tracking-tight mb-1">
                      Selo Mercado Pago<br/>de Qualidade
                    </h4>
                    
                    <div className="w-full h-[1px] bg-gray-100 mb-1.5"></div>
                    
                    <div className="flex items-center gap-1 mb-1">
                      <ShieldCheck size={12} fill="#3483fa" className="text-white shrink-0" />
                      <span className="text-[8px] font-bold text-gray-700 uppercase tracking-wider">Esta loja é avaliada</span>
                    </div>

                    <div className="flex items-center gap-0.5 text-[#ffb000] mb-1">
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <div className="relative">
                        <Star size={12} fill="#e5e7eb" className="text-transparent" />
                        <div className="absolute inset-0 overflow-hidden w-[90%] text-[#ffb000]">
                          <Star size={12} fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[#001b5e] text-xl font-black leading-none mb-0.5">4,9/5</span>
                      <span className="text-[8px] font-bold text-[#001b5e] uppercase tracking-wide">No Mercado Pago</span>
                    </div>
                  </div>
                </div>

                {/* Verified Text Bottom */}
                <div className="mt-12 mb-2 flex items-center justify-center gap-1.5 text-gray-400">
                  <BadgeCheck size={16} className="text-green-500" />
                  <span className="text-[11px] uppercase tracking-wide font-medium">Verificação SSL aprovada - Site verificado pelo Google</span>
                </div>

              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};

