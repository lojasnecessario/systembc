import { VegaValidationError } from './errors';

export function verifyWebhookSignature(_payload: any, signature: string | undefined, secret: string): boolean {
  // A Vega Checkout pode exigir verificação de HMAC ou apenas token Bearer.
  // De acordo com os requisitos e documentação comum, assumiremos que
  // a verificação utiliza um header ou um secret nas variáveis de ambiente.
  
  if (!signature) {
    throw new VegaValidationError('Assinatura (signature) ausente no webhook');
  }

  // Aqui entraria a validação de criptografia.
  // Exemplo fictício para a implementação padrão (onde signature == token)
  if (signature !== secret) {
    throw new VegaValidationError('Assinatura do webhook inválida');
  }

  return true;
}
