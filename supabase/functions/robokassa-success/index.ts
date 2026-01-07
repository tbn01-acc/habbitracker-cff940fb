import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const invId = url.searchParams.get('InvId') || '';
  
  // Redirect to success page
  const redirectUrl = `${Deno.env.get('SITE_URL') || 'https://top-focus.ru'}/upgrade?success=true&invoice=${invId}`;
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': redirectUrl,
    },
  });
});
