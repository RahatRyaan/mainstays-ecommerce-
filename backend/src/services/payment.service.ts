import { randomBytes } from 'crypto';

export class PaymentService {
  /**
   * Mock Stripe create payment intent
   */
  static async createPaymentIntent(amount: number, metadata: Record<string, any>) {
    // Return a mocked client secret and payment intent ID
    const intentId = 'pi_' + randomBytes(16).toString('hex');
    return {
      clientSecret: intentId + '_secret_' + randomBytes(16).toString('hex'),
      paymentIntentId: intentId,
      amount,
      metadata,
    };
  }

  /**
   * Mock Stripe verify webhook signature.
   * In a real environment, you'd use stripe.webhooks.constructEvent
   */
  static verifyWebhookSignature(payload: string | object, signature: string, secret: string) {
    if (!signature) {
      throw new Error('No signature provided');
    }
    
    if (typeof payload === 'object') {
      return payload;
    }
    
    try {
      return JSON.parse(payload);
    } catch (err) {
      throw new Error('Webhook error: Invalid JSON payload');
    }
  }
}
