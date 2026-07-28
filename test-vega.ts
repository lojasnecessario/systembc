import { createCheckoutRequest } from './src/infrastructure/commerce/vega/createCheckout';

async function runTest() {
  console.log('Iniciando teste de integração com a Vega Checkout...');
  
  const token = process.env.VEGA_API_KEY;
  if (!token) {
    console.error('VEGA_API_KEY não encontrada no .env');
    return;
  }
  
  console.log(`Usando token: ${token.substring(0, 10)}...`);

  const mockPayload = {
    products: [
      {
        code: "teste-123",
        title: "Produto de Homologação (Ignorar)",
        amount: 100, // R$ 1,00
        quantity: 1,
        description: "Teste E2E via Script"
      }
    ],
    payment: {
      method: "credit_card",
      payment_value: 100,
      currency: "BRL"
    },
    external_code: "TEST-E2E-001"
  };

  try {
    console.log('Enviando requisição de checkout para a Vega...');
    const response = await createCheckoutRequest(mockPayload, token);
    
    console.log('\n✅ SUCESSO! A Vega respondeu positivamente:');
    console.log(JSON.stringify(response, null, 2));
    
    if (response.checkout_url || response.payment_url || response.url) {
      console.log('\n🔗 URL de Checkout Gerada:', response.checkout_url || response.payment_url || response.url);
    }
    
    if (response.transaction_token) {
      console.log('🔑 Transaction Token:', response.transaction_token);
    }
    
    console.log('\nPróximo passo: O cliente pagaria nesta URL e o webhook seria disparado para a nossa API.');
    
  } catch (error: any) {
    console.error('\n❌ ERRO na requisição:');
    if (error.details) {
      console.error(JSON.stringify(error.details, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

runTest();
