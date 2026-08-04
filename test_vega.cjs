const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = env.match(/VEGA_API_KEY=([^\n\r]+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].replace(/['"]/g, '') : null;

const payload = {
  customer: {
    name: 'Roberto Carlos',
    email: 'roberto@email.com',
    document: '12345678909',
    phone: '+5511999999999',
    address: { street: 'Rua Exemplo', number: '123', complement: '', district: 'Centro', city: 'São Paulo', state: 'SP', zipcode: '01001000' }
  },
  payment: {
    method: 'pix',
    payment_value: 1000,
    freight_value: 0,
    discount_value: 0,
    external_code: 'TESTE_ERR_' + Date.now(),
    currency: 'BRL'
  },
  products: [{ code: '123', name: 'Playstation 3 Super Slim', price: 1000, is_digital: false, quantity: 1 }],
  notification_url: 'https://systembc-slpc.vercel.app/api/webhooks/vega',
  src: 'systembc'
};

fetch('https://checkout.black-core.site/api/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'api-key': apiKey,
    'x-domain': 'black-core.site'
  },
  body: JSON.stringify(payload)
})
.then(r => r.json().then(data => ({ status: r.status, data })))
.then(res => console.log('VEGA RESPONSE:', JSON.stringify(res, null, 2)))
.catch(e => console.log('ERROR', e));
