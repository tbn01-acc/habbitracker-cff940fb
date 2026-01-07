import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const invId = url.searchParams.get('InvId') || '';
  
  // Redirect to fail page
  const redirectUrl = `${Deno.env.get('SITE_URL') || 'https://top-focus.ru'}/upgrade?fail=true&invoice=${invId}`;
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': redirectUrl,
    },
  });
});
