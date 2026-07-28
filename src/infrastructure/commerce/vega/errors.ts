export class VegaCommunicationError extends Error {
  public readonly statusCode?: number;
  public readonly details?: any;

  constructor(message: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'VegaCommunicationError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class VegaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VegaValidationError';
  }
}
