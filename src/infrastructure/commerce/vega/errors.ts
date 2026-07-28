export class VegaCommunicationError extends Error {
  constructor(message: string, public readonly statusCode?: number, public readonly details?: any) {
    super(message);
    this.name = 'VegaCommunicationError';
  }
}

export class VegaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VegaValidationError';
  }
}
