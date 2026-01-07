import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/LanguageContext';

export interface PaymentPlan {
  id: string;
  name: string;
  period: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  description: string;
}

export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'monthly',
    name: 'Месяц',
    period: 'monthly',
    price: 299,
    description: '1 месяц PRO подписки',
  },
  {
    id: 'quarterly',
    name: '3 месяца',
    period: 'quarterly',
    price: 799,
    originalPrice: 897,
    discount: 11,
    description: '3 месяца PRO подписки',
  },
  {
    id: 'semiannual',
    name: '6 месяцев',
    period: 'semiannual',
    price: 1499,
    originalPrice: 1794,
    discount: 16,
    description: '6 месяцев PRO подписки',
  },
  {
    id: 'annual',
    name: '1 год',
    period: 'annual',
    price: 2699,
    originalPrice: 3588,
    discount: 25,
    description: '12 месяцев PRO подписки',
  },
  {
    id: 'biennial',
    name: '2 года',
    period: 'biennial',
    price: 4999,
    originalPrice: 7176,
    discount: 30,
    description: '24 месяца PRO подписки',
  },
  {
    id: 'lifetime',
    name: 'Навсегда',
    period: 'lifetime',
    price: 9999,
    description: 'Пожизненный PRO доступ',
  },
];

export function useRobokassa() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const createPayment = useCallback(async (plan: PaymentPlan) => {
    if (!user) {
      toast.error(language === 'ru' ? 'Необходимо войти в аккаунт' : 'Please sign in');
      return null;
    }

    setIsLoading(true);
    try {
      // Generate unique invoice ID
      const invoiceId = `${user.id.substring(0, 8)}-${Date.now()}`;

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: plan.price,
          invoice_id: invoiceId,
          subscription_period: plan.period,
          metadata: { plan_id: plan.id, plan_name: plan.name }
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Call edge function to get Robokassa URL
      const { data, error } = await supabase.functions.invoke('robokassa-create-payment', {
        body: {
          invoiceId,
          amount: plan.price,
          description: `TOP Focus PRO - ${plan.name}`,
          email: user.email,
        }
      });

      if (error) throw error;

      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      }

      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(language === 'ru' ? 'Ошибка создания платежа' : 'Payment creation error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, language]);

  const getPaymentHistory = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }, [user]);

  return {
    plans: PAYMENT_PLANS,
    isLoading,
    createPayment,
    getPaymentHistory,
  };
}
