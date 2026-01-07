import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, amount, description, email } = await req.json();

    const merchantLogin = Deno.env.get('ROBOKASSA_MERCHANT_LOGIN');
    const password1 = Deno.env.get('ROBOKASSA_PASSWORD1');
    const isTest = Deno.env.get('ROBOKASSA_TEST_MODE') === 'true';

    if (!merchantLogin || !password1) {
      throw new Error('Robokassa credentials not configured');
    }

    // Generate signature: MerchantLogin:OutSum:InvId:Password#1
    const signatureString = `${merchantLogin}:${amount}:${invoiceId}:${password1}`;
    const signature = await md5(signatureString);

    // Build payment URL
    const baseUrl = isTest 
      ? 'https://auth.robokassa.ru/Merchant/Index.aspx'
      : 'https://auth.robokassa.ru/Merchant/Index.aspx';

    const params = new URLSearchParams({
      MerchantLogin: merchantLogin,
      OutSum: amount.toString(),
      InvId: invoiceId,
      Description: description,
      SignatureValue: signature,
      IsTest: isTest ? '1' : '0',
      Culture: 'ru',
    });

    if (email) {
      params.append('Email', email);
    }

    const paymentUrl = `${baseUrl}?${params.toString()}`;

    return new Response(
      JSON.stringify({ paymentUrl, invoiceId }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
