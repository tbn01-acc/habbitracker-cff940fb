import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// MD5 hash function
async function md5(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('MD5', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Calculate subscription expiry based on period
function calculateExpiryDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'quarterly':
      return new Date(now.setMonth(now.getMonth() + 3));
    case 'semiannual':
      return new Date(now.setMonth(now.getMonth() + 6));
    case 'annual':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    case 'biennial':
      return new Date(now.setFullYear(now.getFullYear() + 2));
    case 'lifetime':
      return new Date(now.setFullYear(now.getFullYear() + 100));
    default:
      return new Date(now.setMonth(now.getMonth() + 1));
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse form data or URL params
    const url = new URL(req.url);
    let outSum: string, invId: string, signatureValue: string;

    if (req.method === 'POST') {
      const formData = await req.formData();
      outSum = formData.get('OutSum') as string;
      invId = formData.get('InvId') as string;
      signatureValue = formData.get('SignatureValue') as string;
    } else {
      outSum = url.searchParams.get('OutSum') || '';
      invId = url.searchParams.get('InvId') || '';
      signatureValue = url.searchParams.get('SignatureValue') || '';
    }

    const password2 = Deno.env.get('ROBOKASSA_PASSWORD2');

    if (!password2) {
      throw new Error('Robokassa credentials not configured');
    }

    // Verify signature: OutSum:InvId:Password#2
    const expectedSignature = await md5(`${outSum}:${invId}:${password2}`);

    if (signatureValue.toLowerCase() !== expectedSignature.toLowerCase()) {
      console.error('Invalid signature');
      return new Response('bad sign', { status: 400 });
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find payment by invoice ID
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invId)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', invId);
      return new Response('bad inv_id', { status: 400 });
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'success',
        paid_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
    }

    // Update user subscription
    const expiryDate = calculateExpiryDate(payment.subscription_period || 'monthly');
    
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: payment.user_id,
        plan: 'pro',
        period: payment.subscription_period,
        is_trial: false,
        expires_at: expiryDate.toISOString(),
        started_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (subError) {
      console.error('Error updating subscription:', subError);
    }

    // Check if user was referred and update referrer bonus
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', payment.user_id)
      .single();

    if (referral && !referral.referred_has_paid) {
      await supabase
        .from('referrals')
        .update({ referred_has_paid: true })
        .eq('id', referral.id);
    }

    // Return OK response for Robokassa
    return new Response(`OK${invId}`, { 
      headers: { 'Content-Type': 'text/plain' },
      status: 200 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('error', { status: 500 });
  }
});
