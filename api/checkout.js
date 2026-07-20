export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { productId, productPrice, productName, productDescription } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Produto não informado' });
    }

    // A URL que o usuário informou
    const VEGA_API_URL = 'https://checkout.seudominioaprovado.com/api/checkout';
    // Pega a chave da API do Vercel Environment Variables
    const VEGA_API_KEY = process.env.VEGA_API_KEY;

    if (!VEGA_API_KEY) {
      console.error('VEGA_API_KEY is not set');
      return res.status(500).json({ error: 'Configuração da API ausente.' });
    }

    const amountInCents = Math.round(Number(productPrice) * 100);

    const payload = {
      products: [
        {
          code: productId,
          title: productName,
          amount: amountInCents,
          quantity: 1,
          description: productDescription || productName
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
