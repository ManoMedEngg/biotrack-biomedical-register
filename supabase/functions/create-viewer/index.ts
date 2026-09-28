import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async request => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = request.headers.get('Authorization');
  if (!url || !anonKey || !serviceKey || !authorization) {
    return Response.json({ error: 'Server authentication is not configured.' }, { status: 500, headers: corsHeaders });
  }

  try {
    const callerClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } }
    });
    const { data: { user }, error: authError } = await callerClient.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Sign in as the Boss to create accounts.' }, { status: 401, headers: corsHeaders });
    }

    const adminClient = createClient(url, serviceKey);
    const { data: profile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'boss') {
      return Response.json({ error: 'Only the Boss can create accounts.' }, { status: 403, headers: corsHeaders });
    }

    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const fullName = String(body.fullName || '').trim();
    const password = String(body.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !fullName || fullName.length > 120 || password.length < 12) {
      return Response.json({ error: 'Provide a valid email, name, and password of at least 12 characters.' }, { status: 400, headers: corsHeaders });
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });
    if (error) {
      return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
    }

    const { error: profileError } = await adminClient.from('profiles')
      .update({ full_name: fullName, role: 'viewer' }).eq('id', data.user.id);
    if (profileError) {
      await adminClient.auth.admin.deleteUser(data.user.id);
      return Response.json({ error: 'Could not activate the view-only profile.' }, { status: 500, headers: corsHeaders });
    }

    return Response.json({ id: data.user.id, email: data.user.email, role: 'viewer' }, {
      status: 201,
      headers: corsHeaders
    });
  } catch {
    return Response.json({ error: 'Account creation failed.' }, { status: 500, headers: corsHeaders });
  }
});