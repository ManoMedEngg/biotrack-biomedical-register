/* =========================================================
   BioTrack authentication (Supabase) + theme control
   Dark theme is applied first, always — unless the user
   has previously switched to light mode.
   ========================================================= */
(() => {
  'use strict';

  const q = s => document.querySelector(s);
  const cfg = window.BIOTRACK_SUPABASE || {};

  /* =========================================================
     1) THEME — dark first, light only if user chose light
     ========================================================= */

  // Apply the saved theme IMMEDIATELY (before anything else paints).
  // Default = dark. We only add .light-mode if the user explicitly picked light.
  function applyStoredTheme() {
    const saved = localStorage.getItem('biotrack-mode'); // 'dark' | 'light' | null
    const isLight = saved === 'light';
    document.body.classList.toggle('light-mode', isLight);
    return isLight;
  }

  // Set theme + update every toggle button label on the page.
  function setMode(isLight) {
    document.body.classList.toggle('light-mode', isLight);
    localStorage.setItem('biotrack-mode', isLight ? 'light' : 'dark');

    // Topbar toggle
    const modeBtn = q('#modeBtn');
    if (modeBtn) modeBtn.textContent = isLight ? 'Dark mode' : 'Light mode';

    // Floating toggle (auth screen)
    const nightToggle = q('#nightToggle');
    if (nightToggle) nightToggle.textContent = isLight ? 'Dark mode' : 'Light mode';
  }

  // First paint: apply dark (or previously saved light)
  setMode(applyStoredTheme());

  // Topbar toggle button
  const modeBtn = q('#modeBtn');
  if (modeBtn) {
    modeBtn.onclick = () => setMode(!document.body.classList.contains('light-mode'));
  }

  // Floating toggle on auth screen
  const nightToggle = q('#nightToggle');
  if (nightToggle) {
    nightToggle.onclick = () => setMode(!document.body.classList.contains('light-mode'));
  }

  /* =========================================================
     2) SUPABASE AUTHENTICATION
     ========================================================= */
  const authMsg = q('#authMessage');
  const authForm = q('#authForm');
  const createAccountBtn = q('#createAccountBtn');
  const accountDialog = q('#accountDialog');
  const accountForm = q('#accountForm');
  const accountMessage = q('#accountMessage');
  const forgotPasswordBtn = q('#forgotPasswordBtn');
  const recoveryDialog = q('#recoveryDialog');
  const recoveryForm = q('#recoveryForm');
  const recoveryMessage = q('#recoveryMessage');
  let clientPromise;
  let activeProfile = null;
  let passwordRecovery = false;

  function configured() {
    return Boolean(cfg.url && cfg.anonKey && cfg.bossEmail && !/PASTE|YOUR_/i.test(cfg.anonKey));
  }

  async function loadClient() {
    if (!configured()) return null;
    if (!clientPromise) {
      clientPromise = (async () => {
        if (!window.supabase) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
          document.head.appendChild(script);
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
        }
        const client = window.supabase.createClient(cfg.url, cfg.anonKey);
        client.auth.onAuthStateChange(event => {
          if (event === 'PASSWORD_RECOVERY') {
            passwordRecovery = true;
            recoveryDialog.showModal();
          }
        });
        return client;
      })();
    }
    return clientPromise;
  }

  async function resolveProfile(client, user) {
    const isConfiguredBoss = user.email?.trim().toLowerCase() === cfg.bossEmail.trim().toLowerCase();
    const { data: profile, error } = await client
      .from('profiles').select('full_name,role').eq('id', user.id).single();
    if (error) {
      if (isConfiguredBoss) {
        throw new Error('Boss profile is missing. Run supabase-boss-bootstrap.sql in the Supabase SQL Editor, then sign in again.');
      }
      throw new Error('No active view-only profile was found. Ask the Boss to create your account.');
    }
    const expectedRole = isConfiguredBoss ? 'boss' : 'viewer';
    if (profile.role !== expectedRole) {
      if (!isConfiguredBoss && profile.role === 'boss') {
        throw new Error('Only the configured Boss account can sign in with Boss access.');
      }
      if (isConfiguredBoss) {
        throw new Error('This Auth account is not promoted to Boss. Run supabase-boss-bootstrap.sql in the Supabase SQL Editor.');
      }
      throw new Error('This account is not provisioned as a view-only user. Ask the Boss to create your account.');
    }
    return profile;
  }

  async function showSignedIn(client, user) {
    let profile;
    try {
      profile = await resolveProfile(client, user);
    } catch (error) {
      await client.auth.signOut();
      throw error;
    }
    activeProfile = profile;
    document.body.classList.add('app-ready');
    document.body.classList.toggle('viewer-mode', profile.role === 'viewer');
    q('#sessionStatus').textContent = `${profile.full_name} · ${profile.role === 'boss' ? 'Boss' : 'View only'}`;
    createAccountBtn.hidden = profile.role !== 'boss';
    q('#signOutBtn').hidden = false;
    window.BioTrackCloud?.start(client, user, profile);
  }

  window.BioTrackAuth = {
    canManage: () => activeProfile?.role === 'boss',
    getProfile: () => activeProfile
  };

  authForm.onsubmit = async event => {
    event.preventDefault();
    if (!configured()) {
      authMsg.textContent = 'Set a real Supabase project URL and anon key in supabase-config.js first.';
      return;
    }
    const values = Object.fromEntries(new FormData(authForm));
    authMsg.textContent = 'Checking account…';
    try {
      const client = await loadClient();
      const { data, error } = await client.auth.signInWithPassword({
        email: values.email, password: values.password
      });
      if (error) throw error;
      await showSignedIn(client, data.user);
      authMsg.textContent = `Signed in as ${activeProfile.full_name}.`;
    } catch (error) {
      authMsg.textContent = error.message || 'Sign-in failed. Check the account details and Supabase settings.';
    }
  };

  forgotPasswordBtn.onclick = async () => {
    if (!configured()) {
      authMsg.textContent = 'Password recovery is unavailable until Supabase is configured.';
      return;
    }
    const email = authForm.elements.email.value.trim();
    if (!email) {
      authMsg.textContent = 'Enter the account email address first.';
      authForm.elements.email.focus();
      return;
    }
    authMsg.textContent = 'Sending password reset instructions…';
    try {
      const client = await loadClient();
      const redirectTo = cfg.authRedirectUrl || `${window.location.origin}${window.location.pathname}`;
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      authMsg.textContent = 'If that email belongs to an account, password reset instructions have been sent.';
    } catch (error) {
      authMsg.textContent = error.message || 'Could not send password reset instructions.';
    }
  };

  recoveryForm.onsubmit = async event => {
    event.preventDefault();
    if (!passwordRecovery) {
      recoveryMessage.textContent = 'Open the password reset link from your registered email first.';
      return;
    }
    const values = Object.fromEntries(new FormData(recoveryForm));
    if (values.password !== values.confirmPassword) {
      recoveryMessage.textContent = 'The passwords do not match.';
      return;
    }
    recoveryMessage.textContent = 'Updating password…';
    try {
      const client = await loadClient();
      const { error } = await client.auth.updateUser({ password: values.password });
      if (error) throw error;
      await client.auth.signOut();
      passwordRecovery = false;
      recoveryDialog.close();
      recoveryForm.reset();
      window.history.replaceState({}, document.title, window.location.pathname);
      authMsg.textContent = 'Password updated. Sign in using your new password.';
    } catch (error) {
      recoveryMessage.textContent = error.message || 'Could not update the password.';
    }
  };

  createAccountBtn.onclick = () => {
    if (!window.BioTrackAuth.canManage()) return;
    accountForm.reset();
    accountMessage.textContent = '';
    accountDialog.showModal();
  };

  accountForm.onsubmit = async event => {
    event.preventDefault();
    if (!window.BioTrackAuth.canManage()) return;
    const values = Object.fromEntries(new FormData(accountForm));
    accountMessage.textContent = 'Creating view-only account…';
    try {
      const client = await loadClient();
      const { data, error } = await client.functions.invoke('create-viewer', {
        body: { email: values.email, fullName: values.fullName, password: values.password }
      });
      if (error) throw error;
      accountMessage.textContent = `View-only account created for ${data.email}.`;
      accountForm.reset();
    } catch (error) {
      accountMessage.textContent = error.message || 'Could not create account. Check the create-viewer Edge Function deployment.';
    }
  };

  q('#accountClose').onclick = () => accountDialog.close();
  q('#accountCancel').onclick = () => accountDialog.close();

  q('#signOutBtn').onclick = async () => {
    const client = await loadClient();
    await client?.auth.signOut();
    activeProfile = null;
    localStorage.removeItem('biotrack-session');
    document.body.classList.remove('app-ready', 'viewer-mode');
    createAccountBtn.hidden = true;
    q('#signOutBtn').hidden = true;
    q('#sessionStatus').textContent = 'Signed out';
  };

  if (!configured()) {
    authMsg.textContent = 'Add the real Supabase anon key to supabase-config.js to enable sign-in.';
  } else {
    loadClient().then(async client => {
      const { data: { session } } = await client.auth.getSession();
      if (session && !passwordRecovery) await showSignedIn(client, session.user);
    }).catch(error => {
      authMsg.textContent = error.message || 'Could not connect to Supabase.';
    });
  }
})();