import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PaymentCard {
  id: string;
  cardHolder: string;
  cardNumber: string; // Formatted or masked
  last4: string;
  expiry: string; // MM/YY
  cvv?: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'discover';
  isDefault: boolean;
  nickname?: string;
  billingAddress?: string;
}

interface PaymentState {
  cards: PaymentCard[];
  addCard: (card: Omit<PaymentCard, 'id' | 'last4'>) => PaymentCard;
  updateCard: (id: string, updates: Partial<Omit<PaymentCard, 'id'>>) => void;
  deleteCard: (id: string) => void;
  setDefaultCard: (id: string) => void;
  getCardById: (id: string) => PaymentCard | undefined;
}

export function detectCardBrand(number: string): 'visa' | 'mastercard' | 'amex' | 'discover' {
  const clean = number.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'visa';
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'mastercard';
  if (/^3[47]/.test(clean)) return 'amex';
  if (/^6/.test(clean)) return 'discover';
  return 'visa';
}

export function formatCardNumber(number: string): string {
  const clean = number.replace(/\D/g, '').slice(0, 16);
  const parts = clean.match(/.{1,4}/g);
  return parts ? parts.join(' ') : clean;
}

export function maskCardNumber(number: string): string {
  const clean = number.replace(/\D/g, '');
  if (clean.length < 4) return '•••• •••• •••• 4242';
  const last4 = clean.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

const defaultDemoCards: PaymentCard[] = [
  {
    id: 'card-default-1',
    cardHolder: 'Alex Johnson',
    cardNumber: '•••• •••• •••• 4242',
    last4: '4242',
    expiry: '08/28',
    brand: 'visa',
    isDefault: true,
    nickname: 'Primary Everyday Card',
    billingAddress: '742 Evergreen Terrace, Portland, OR 97201',
  },
  {
    id: 'card-default-2',
    cardHolder: 'Alex Johnson',
    cardNumber: '•••• •••• •••• 8899',
    last4: '8899',
    expiry: '11/29',
    brand: 'mastercard',
    isDefault: false,
    nickname: 'Artisan Business Card',
    billingAddress: '742 Evergreen Terrace, Portland, OR 97201',
  },
];

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      cards: defaultDemoCards,

      addCard: (cardData) => {
        const cleanNumber = cardData.cardNumber.replace(/\D/g, '');
        const last4 = cleanNumber.length >= 4 ? cleanNumber.slice(-4) : '4242';
        const brand = cardData.brand || detectCardBrand(cardData.cardNumber);
        const newId = `card-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

        const newCard: PaymentCard = {
          id: newId,
          cardHolder: cardData.cardHolder.trim() || 'Cardholder',
          cardNumber: maskCardNumber(cardData.cardNumber),
          last4: last4,
          expiry: cardData.expiry.trim() || '12/28',
          brand: brand,
          isDefault: Boolean(cardData.isDefault || get().cards.length === 0),
          nickname: cardData.nickname?.trim() || `${brand.toUpperCase()} ending in ${last4}`,
          billingAddress: cardData.billingAddress?.trim() || '',
        };

        set((state) => {
          let updated = state.cards;
          if (newCard.isDefault) {
            updated = updated.map((c) => ({ ...c, isDefault: false }));
          }
          return { cards: [newCard, ...updated] };
        });

        return newCard;
      },

      updateCard: (id, updates) => {
        set((state) => {
          let updatedCards = state.cards.map((card) => {
            if (card.id !== id) return card;

            let last4 = card.last4;
            let maskedNumber = card.cardNumber;
            let brand = card.brand;

            if (updates.cardNumber) {
              const cleanNumber = updates.cardNumber.replace(/\D/g, '');
              last4 = cleanNumber.length >= 4 ? cleanNumber.slice(-4) : last4;
              maskedNumber = maskCardNumber(updates.cardNumber);
              brand = detectCardBrand(updates.cardNumber);
            }

            return {
              ...card,
              ...updates,
              last4,
              cardNumber: maskedNumber,
              brand,
            };
          });

          if (updates.isDefault) {
            updatedCards = updatedCards.map((c) => ({
              ...c,
              isDefault: c.id === id,
            }));
          }

          return { cards: updatedCards };
        });
      },

      deleteCard: (id) => {
        set((state) => {
          const remaining = state.cards.filter((c) => c.id !== id);
          // If deleted card was default, set the first remaining as default
          if (remaining.length > 0 && !remaining.some((c) => c.isDefault)) {
            remaining[0].isDefault = true;
          }
          return { cards: remaining };
        });
      },

      setDefaultCard: (id) => {
        set((state) => ({
          cards: state.cards.map((c) => ({
            ...c,
            isDefault: c.id === id,
          })),
        }));
      },

      getCardById: (id) => {
        return get().cards.find((c) => c.id === id);
      },
    }),
    {
      name: 'mainstays-payment-cards',
    }
  )
);
