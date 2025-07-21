// Premium Payment Types
export interface PremiumPurchaseRequest {
  userId: string;
  amount: number;
  bankCode?: string;
  locale?: string;
}

export interface PremiumPurchaseResponse {
  success: boolean;
  message?: string;
  paymentUrl?: string;
  orderId?: string;
  amount?: number;
  transactionId?: string;
  error?: string;
}

export interface PremiumStatus {
  isPremium: boolean;
  premiumExpiry: string | null;
  premiumPurchaseDate: string | null;
}

export class PremiumPaymentError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "PremiumPaymentError";
  }
}
