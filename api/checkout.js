import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Produto não informado' });
    }

    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error('Supabase keys missing in environment variables');
      return res.status(500).json({ error: 'Configuração de banco de dados ausente.' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const { data: product, error: dbError } = await supabase
      .from('products')
      .select('name, price, promotional_price, description')
      .eq('id', productId)
      .single();

    if (dbError || !product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const currentPrice = product.promotional_price !== null && product.promotional_price < product.price 
      ? product.promotional_price 
      : product.price;

    const amountInCents = Math.round(Number(currentPrice) * 100);

    const VEGA_API_URL = 'https://checkout.seudominioaprovado.com/api/checkout';
    const VEGA_API_KEY = process.env.VEGA_API_KEY;

    if (!VEGA_API_KEY) {
      console.error('VEGA_API_KEY is not set');
      return res.status(500).json({ error: 'Configuração da API ausente.' });
    }

    const payload = {
      products: [
        {
          code: productId,
          title: product.name,
          amount: amountInCents,
          quantity: 1,
          description: product.description || product.name
        }
      ],
      payment: {
        method: "credit_card",
        payment_value: amountInCents,
        currency: "BRL"
      }
    };

    console.log("Chamando Vega API:", VEGA_API_URL);
    
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
      return res.status(response.status).json({ 
        error: `Erro ao comunicar com Vega Checkout: ${response.statusText}`, 
        details: responseData 
      });
    }

    const checkoutUrl = responseData?.checkout_url || responseData?.url || responseData?.payment_url;

    if (!checkoutUrl) {
      console.error("URL não encontrada na resposta. Retorno completo:", responseData);
      return res.status(500).json({ error: "A API do Vega não retornou a URL de checkout na resposta." });
    }

    return res.status(200).json({ checkout_url: checkoutUrl });

  } catch (error) {
    console.error("Erro na Vercel Function api/checkout:", error);
    return res.status(500).json({ error: error.message });
  }
}
