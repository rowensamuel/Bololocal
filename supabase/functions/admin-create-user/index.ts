/// <reference path="../deno.d.ts" />
// Supabase Edge Function: admin-create-user
// Allows verified ADMIN users to create real Supabase auth identities and linked profiles.
// Normal users are strictly rejected with 403 Forbidden.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Verify caller's identity via JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user: callerUser }, error: callerErr } = await adminClient.auth.getUser(jwt);

    if (callerErr || !callerUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify caller is an ADMIN in profiles
    const { data: callerProfile, error: callerProfErr } = await adminClient
      .from('profiles')
      .select('role')
      .eq('auth_user_id', callerUser.id)
      .maybeSingle();

    if (callerProfErr || !callerProfile || callerProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only administrators can create new users.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse user creation request
    const body = await req.json();
    const {
      username,
      email,
      password,
      full_name,
      role = 'user',
      native_language_id = 'hi',
      learning_language_id = 'mr',
      level = 'Beginner',
      daily_goal = 15,
      avatar_url,
    } = body;

    // Normal admin cannot create another admin unless superadmin rules apply, but step 6 says:
    // "Normal USER must not create ADMIN accounts. Assign role=user."
    const assignedRole = role === 'admin' ? 'admin' : 'user';

    if (!email || !password || !username) {
      return new Response(
        JSON.stringify({ error: 'Username, email, and password are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate username
    const { data: existingUser } = await adminClient
      .from('profiles')
      .select('id')
      .or(`username.ilike.${cleanUsername},email.ilike.${cleanEmail}`)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: `Username "${cleanUsername}" or email "${cleanEmail}" is already registered.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create real Supabase auth identity via Admin API
    const { data: createdAuth, error: createAuthErr } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        username: cleanUsername,
        full_name: full_name || cleanUsername,
        role: assignedRole,
      },
    });

    if (createAuthErr || !createdAuth.user) {
      return new Response(
        JSON.stringify({ error: createAuthErr?.message || 'Failed to create auth identity in Supabase.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newAuthUserId = createdAuth.user.id;

    // Insert linked profile row
    const { data: newProfile, error: profileInsertErr } = await adminClient
      .from('profiles')
      .upsert(
        {
          auth_user_id: newAuthUserId,
          username: cleanUsername,
          full_name: full_name || cleanUsername,
          email: cleanEmail,
          role: assignedRole,
          avatar_url:
            avatar_url ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          native_language_id,
          learning_language_id,
          level,
          daily_goal,
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'auth_user_id' }
      )
      .select('*')
      .single();

    if (profileInsertErr) {
      return new Response(
        JSON.stringify({ error: profileInsertErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, profile: newProfile }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Internal server error while creating user.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
