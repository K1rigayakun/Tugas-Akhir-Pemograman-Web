/**
 * Type declarations for midtrans-client
 */
declare module 'midtrans-client' {
  export class Snap {
    constructor(config: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    createTransaction(params: any): Promise<any>;
  }

  export class CoreApi {
    constructor(config: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    charge(params: any): Promise<any>;
    capture(params: any): Promise<any>;
    cardRegister(params: any): Promise<any>;
    cardToken(params: any): Promise<any>;
    cardPointInquiry(tokenId: string): Promise<any>;
  }
}
