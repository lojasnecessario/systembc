import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Pegar a Chave da API do Vega (configure no painel do Supabase)
    const vegaApiKey = Deno.env.get('VEGA_API_KEY')
    if (!vegaApiKey) {
      throw new Error('VEGA_API_KEY não configurada nas variáveis de ambiente')
    }

    // Receber os dados do formulário do Painel Admin
    const productData = await req.json()
    const { id, name, description, price, ...otherData } = productData

    // -------------------------------------------------------------
    // INTEGRAÇÃO COM VEGA CHECKOUT (Ajuste a URL e Payload conforme necessário)
    // -------------------------------------------------------------
    // Substitua a URL abaixo pela URL correta da API de Criação de Produto do Vega Checkout
    const VEGA_API_URL = 'https://api.vegacheckout.com.br/v1/products' 
    
    console.log('Enviando para o Vega Checkout...', name)
    const vegaResponse = await fetch(VEGA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${vegaApiKey}` // Ou 'Api-Token', verifique a doc
      },
      body: JSON.stringify({
        // Substitua os campos abaixo conforme a estrutura exigida pelo Vega
        name: name,
        price: Math.round(price * 100), // Vega geralmente usa centavos
        description: description || ''
      })
    })

    if (!vegaResponse.ok) {
      const errorText = await vegaResponse.text()
      console.error('Erro no Vega:', errorText)
      // Se não quiser travar a criação no banco local quando o Vega falhar, você pode apenas logar
      // throw new Error(`Falha ao criar no Vega Checkout: ${errorText}`)
    }

    // Tentar ler a resposta do Vega para pegar o checkout_url gerado
    let checkoutUrl = productData.checkout_url || ''
    try {
      const vegaResult = await vegaResponse.json()
      // Ajuste 'checkout_url' para o campo correto retornado pela API do Vega
      if (vegaResult && vegaResult.checkout_url) {
        checkoutUrl = vegaResult.checkout_url
      } else if (vegaResult && vegaResult.url) {
        checkoutUrl = vegaResult.url
      }
    } catch (e) {
      console.log('Não foi possível parsear a resposta do Vega')
    }

    // -------------------------------------------------------------
    // SALVAR NO BANCO DE DADOS (SUPABASE)
    // -------------------------------------------------------------
    
    // Se não tiver ID, é inserção. Se tiver, é atualização.
    let dbResponse;
    const dataToSave = {
      ...productData,
      checkout_url: checkoutUrl, // Salvar a URL gerada pelo Vega
    }

    if (!id) {
      // Remover ID null para o banco gerar automaticamente
      delete dataToSave.id
      dbResponse = await supabaseClient
        .from('products')
        .insert([dataToSave])
        .select()
        .single()
    } else {
      dbResponse = await supabaseClient
        .from('products')
        .update(dataToSave)
        .eq('id', id)
        .select()
        .single()
    }

    if (dbResponse.error) {
      throw dbResponse.error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        product: dbResponse.data 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error(error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
