import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { productId } = await req.json()

    if (!productId) {
      throw new Error('Produto não informado')
    }

    // Inicializa Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Busca o produto no banco de dados para evitar fraude de preço no frontend
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      throw new Error('Produto não encontrado')
    }

    // Configura a URL da API do Vega
    // O usuário forneceu: https://checkout.seudominioaprovado.com/api/checkout
    // Usaremos uma variável de ambiente, ou um valor padrão caso não exista
    const VEGA_API_URL = Deno.env.get('VEGA_CHECKOUT_API_URL') || 'https://checkout.seudominioaprovado.com/api/checkout'
    const VEGA_API_KEY = Deno.env.get('VEGA_API_KEY')

    if (!VEGA_API_KEY) {
      throw new Error('Chave da API do Vega não configurada.')
    }

    // Determina o preço (com ou sem desconto)
    const hasDiscount = product.promotional_price !== null && product.promotional_price < product.price;
    const finalPrice = hasDiscount ? product.promotional_price : product.price;
    
    // Converte para centavos (ex: 236.00 -> 23600)
    const amountInCents = Math.round(finalPrice * 100);

    // Monta o payload conforme documentação / padrão de mercado
    // Como a transação cria o produto automaticamente, enviamos os dados do produto
    const payload = {
      products: [
        {
          code: product.id,
          title: product.name,
          amount: amountInCents,
          quantity: 1,
          description: product.description || product.name,
          // Outros campos opcionais: image_url, etc.
        }
      ],
      // Se a API exigir os dados de pagamento mínimos para iniciar a sessão
      payment: {
        method: "credit_card", // Padrão inicial (pode ser alterado na tela de checkout)
        payment_value: amountInCents,
        currency: "BRL"
      }
    };

    console.log("Chamando Vega API:", VEGA_API_URL);
    console.log("Payload:", JSON.stringify(payload));

    const response = await fetch(VEGA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VEGA_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Erro da API Vega:", responseData);
      throw new Error(`Erro ao comunicar com Vega Checkout: ${response.statusText}`);
    }

    console.log("Resposta do Vega:", responseData);

    // A resposta deve conter o link do checkout gerado
    // Se a API retornar no formato { checkout_url: "..." } ou { url: "..." }
    const checkoutUrl = responseData?.checkout_url || responseData?.url || responseData?.payment_url;

    if (!checkoutUrl) {
      console.warn("A API respondeu com sucesso, mas não encontrou 'checkout_url' no retorno. Retorno completo:", responseData);
      // Fallback: se a API for apenas um redirect base, vamos retornar a própria URL da API se for o caso
      throw new Error("A API do Vega não retornou a URL de checkout na resposta.");
    }

    return new Response(
      JSON.stringify({ checkout_url: checkoutUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error("Erro na Edge Function vega-checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
