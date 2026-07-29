import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { CreditCard, CheckCircle, Copy, QrCode, AlertCircle, ShoppingBag } from 'lucide-react';

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

  const onSubmit = async (data: CheckoutFormData) => {
    if (!product) return;
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      
      const payload = {
        productId: product.id,
        customer: data
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
      <div className="min-h-screen bg-[#0a0d0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#33e36a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hasDiscount = product?.promotional_price !== null && product?.promotional_price < product?.price;
  const currentPrice = hasDiscount ? product.promotional_price! : product?.price;

  return (
    <div className="min-h-screen bg-[#0a0d0a] text-[#eef4ea] pt-24 pb-20">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        
        <h1 className="text-3xl font-heading font-bold uppercase tracking-tight mb-8">Finalizar Compra</h1>

        {paymentStatus === 'approved' ? (
          <div className="bg-[#141A12] border border-[#33e36a] rounded-2xl p-8 md:p-12 text-center flex flex-col items-center shadow-[0_0_30px_rgba(51,227,106,0.15)]">
            <CheckCircle className="text-[#33e36a] w-24 h-24 mb-6" />
            <h2 className="text-3xl font-heading font-bold text-[#eef4ea] uppercase mb-4">Pagamento Aprovado!</h2>
            <p className="text-[#8b977f] text-lg max-w-md mx-auto">
              Seu pedido foi confirmado e já está sendo processado. Você receberá as atualizações por e-mail.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="mt-8 bg-[#33e36a] text-black font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-[#11a544] transition-colors"
            >
              Voltar para a Loja
            </button>
          </div>
        ) : checkoutResult ? (
          <div className="bg-[#141A12] border border-[#1b241a] rounded-2xl p-6 md:p-10 text-center flex flex-col items-center">
            <div className="bg-[#33e36a]/10 text-[#33e36a] p-4 rounded-full mb-6">
              <div className="w-8 h-8 border-4 border-[#33e36a] border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <h2 className="text-2xl font-heading font-bold text-[#eef4ea] uppercase mb-2">Aguardando Pagamento</h2>
            <p className="text-[#8b977f] mb-8">Efetue o pagamento via PIX para concluir seu pedido.</p>
            
            {checkoutResult.qr_code_url && (
              <div className="bg-white p-4 rounded-xl mb-6 shadow-lg inline-block">
                <img src={checkoutResult.qr_code_url} alt="QR Code PIX" className="w-48 h-48 md:w-64 md:h-64 object-contain" />
              </div>
            )}
            
            <div className="w-full max-w-md">
              <p className="text-sm text-[#8b977f] mb-2 font-medium uppercase tracking-wider text-left">PIX Copia e Cola:</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={checkoutResult.pix_copy_paste} 
                  className="flex-1 bg-[#0a0d0a] border border-[#1b241a] rounded-xl px-4 py-3 text-sm text-[#8b977f] focus:outline-none"
                />
                <button 
                  onClick={() => copyToClipboard(checkoutResult.pix_copy_paste)}
                  className="bg-[#1b241a] hover:bg-[#2a3528] text-[#eef4ea] px-4 rounded-xl transition-colors flex items-center justify-center border border-[#1b241a]"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-[#0a0d0a] border border-[#1b241a] rounded-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#8b977f]">Total a Pagar</span>
                <span className="text-[#33e36a] font-bold text-xl">R$ {currentPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#8b977f]">Pedido</span>
                <span className="text-[#eef4ea] font-mono">{checkoutResult.external_code}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Formulário */}
            <div className="w-full lg:w-2/3">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex gap-3 items-start">
                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                    <p>{errorMsg}</p>
                  </div>
                )}

                <div className="bg-[#141A12] border border-[#1b241a] rounded-2xl p-6 md:p-8">
                  <h2 className="text-xl font-heading font-bold uppercase mb-6 border-b border-[#1b241a] pb-4">Dados Pessoais</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm text-[#8b977f] mb-1">Nome Completo</label>
                      <input {...register('name')} className={`w-full bg-[#0a0d0a] border ${errors.name ? 'border-red-500' : 'border-[#1b241a] focus:border-[#33e36a]'} rounded-xl px-4 py-3 text-[#eef4ea] outline-none`} />
                      {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
                    </div>
                    <div>
                      <label className="block text-sm text-[#8b977f] mb-1">CPF</label>
                      <input {...register('cpf')} className={`w-full bg-[#0a0d0a] border ${errors.cpf ? 'border-red-500' : 'border-[#1b241a] focus:border-[#33e36a]'} rounded-xl px-4 py-3 text-[#eef4ea] outline-none`} />
                      {errors.cpf && <span className="text-red-500 text-xs mt-1 block">{errors.cpf.message}</span>}
                    </div>
                    <div>
                      <label className="block text-sm text-[#8b977f] mb-1">Telefone / WhatsApp</label>
                      <input {...register('phone')} className={`w-full bg-[#0a0d0a] border ${errors.phone ? 'border-red-500' : 'border-[#1b241a] focus:border-[#33e36a]'} rounded-xl px-4 py-3 text-[#eef4ea] outline-none`} />
                      {errors.phone && <span className="text-red-500 text-xs mt-1 block">{errors.phone.message}</span>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-[#8b977f] mb-1">E-mail</label>
                      <input type="email" {...register('email')} className={`w-full bg-[#0a0d0a] border ${errors.email ? 'border-red-500' : 'border-[#1b241a] focus:border-[#33e36a]'} rounded-xl px-4 py-3 text-[#eef4ea] outline-none`} />
                      {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
                    </div>
                  </div>
                </div>

                <div className="bg-[#141A12] border border-[#1b241a] rounded-2xl p-6 md:p-8">
                  <h2 className="text-xl font-heading font-bold uppercase mb-6 border-b border-[#1b241a] pb-4">Endereço de Entrega</h2>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm text-[#8b977f] mb-1">CEP</label>
                      <input {...register('cep')} className={`w-full bg-[#0a0d0a] border ${errors.cep ? 'border-red-500' : 'border-[#1b241a] focus:border-[#33e36a]'} rounded-xl px-4 py-3 text-[#eef4ea] outline-none`} />
                      {errors.cep && <span className="text-red-500 text-xs mt-1 block">{errors.cep.message}</span>}
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-sm text-[#8b977f] mb-1">Rua / Logradouro</label>
                      <input {...register('street')} className={`w-full bg-[#0a0d0a] border ${errors.street ? 'border-red-500' : 'border-[#1b241a] focus:border-[#33e36a]'} rounded-xl px-4 py-3 text-[#eef4ea] outline-none`} />
                      {errors.street && <span className="text-red-500 text-xs mt-1 block">{errors.street.message}</span>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-[#8b977f] mb-1">Número</label>
                      <input {...register('number')} className={`w-full bg-[#0a0d0a] border ${errors.number ? 'border-red-500' : 'border-[#1b241a] focus:border-[#33e36a]'} rounded-xl px-4 py-3 text-[#eef4ea] outline-none`} />
                      {errors.number && <span className="text-red-500 text-xs mt-1 block">{errors.number.message}</span>}
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-sm text-[#8b977f] mb-1">Complemento</label>
                      <input {...register('complement')} className="w-full bg-[#0a0d0a] border border-[#1b241a] focus:border-[#33e36a] rounded-xl px-4 py-3 text-[#eef4ea] outline-none" placeholder="Opcional" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-[#8b977f] mb-1">Bairro</label>
                      <input {...register('district')} className={`w-full bg-[#0a0d0a] border ${errors.district ? 'border-red-500' : 'border-[#1b241a] focus:border-[#33e36a]'} rounded-xl px-4 py-3 text-[#eef4ea] outline-none`} />
                      {errors.district && <span className="text-red-500 text-xs mt-1 block">{errors.district.message}</span>}
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm text-[#8b977f] mb-1">Cidade</label>
                      <input {...register('city')} className={`w-full bg-[#0a0d0a] border ${errors.city ? 'border-red-500' : 'border-[#1b241a] focus:border-[#33e36a]'} rounded-xl px-4 py-3 text-[#eef4ea] outline-none`} />
                      {errors.city && <span className="text-red-500 text-xs mt-1 block">{errors.city.message}</span>}
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm text-[#8b977f] mb-1">UF</label>
                      <input {...register('state')} className={`w-full bg-[#0a0d0a] border ${errors.state ? 'border-red-500' : 'border-[#1b241a] focus:border-[#33e36a]'} rounded-xl px-4 py-3 text-[#eef4ea] outline-none uppercase`} maxLength={2} />
                      {errors.state && <span className="text-red-500 text-xs mt-1 block">{errors.state.message}</span>}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#33e36a] hover:bg-[#11a544] disabled:opacity-50 text-black text-xl font-heading font-bold uppercase tracking-widest py-5 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(51,227,106,0.2)] hover:shadow-[0_0_30px_rgba(51,227,106,0.4)] flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <QrCode size={24} />
                      Gerar PIX
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Resumo do Pedido */}
            <div className="w-full lg:w-1/3">
              <div className="bg-[#141A12] border border-[#1b241a] rounded-2xl p-6 sticky top-24">
                <h2 className="text-xl font-heading font-bold uppercase mb-6 flex items-center gap-2">
                  <ShoppingBag className="text-[#33e36a]" /> Resumo
                </h2>
                
                <div className="flex gap-4 mb-6 pb-6 border-b border-[#1b241a]">
                  <div className="w-20 h-20 bg-[#0a0d0a] rounded-xl border border-[#1b241a] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {product.main_image ? (
                      <img src={product.main_image} alt={product.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <ShoppingBag size={24} className="text-[#8b977f]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#eef4ea] line-clamp-2 leading-tight">{product.name}</h3>
                    <div className="text-sm text-[#8b977f] mt-1">Qtd: 1</div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#8b977f]">
                    <span>Subtotal</span>
                    <span>R$ {product.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {hasDiscount && (
                    <div className="flex justify-between text-[#33e36a]">
                      <span>Desconto</span>
                      <span>- R$ {(product.price - currentPrice).toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#8b977f]">
                    <span>Frete</span>
                    <span className="text-[#33e36a]">Grátis</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-[#1b241a]">
                  <span className="text-[#eef4ea] font-bold">Total</span>
                  <div className="text-right">
                    <div className="text-sm text-[#8b977f] mb-1">no PIX</div>
                    <span className="text-3xl font-heading font-bold text-[#33e36a] leading-none">
                      R$ {currentPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#8b977f]">
                  <CreditCard size={14} />
                  Ambiente Seguro Vega Checkout
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
