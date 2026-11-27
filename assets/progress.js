// Points de l'académie : demande d'attribution au serveur (Supabase). Rien n'est décidé ici : la base applique barème, plafond et unicité.
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './account-config.js';
const STORAGE_KEY = 'sb-' + new URL(SUPABASE_URL).hostname.split('.')[0] + '-auth-token';
function toast(text) {
  const t = document.createElement('div'); t.textContent = text; t.setAttribute('role', 'status');
  t.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translate(-50%,12px);background:#0a1f4d;color:#ffc531;border:1px solid #ffc531;padding:10px 16px;border-radius:999px;font:700 14px system-ui,sans-serif;z-index:99999;opacity:0;transition:opacity .3s,transform .3s;box-shadow:0 6px 18px #0006';
  document.body.append(t); requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translate(-50%,0)'; });
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 3200);
}
export async function award(kind, ref) {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) return null; // visiteur non connecté : rien à envoyer, on ne charge rien
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm');
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { flowType: 'pkce', detectSessionInUrl: false } });
    const { data, error } = await client.rpc('academy_award', { p_kind: kind, p_ref: ref || location.pathname });
    if (error || !data) return null;
    if (data.granted > 0) toast('+' + data.granted + ' points · ' + data.grade.name);
    return data;
  } catch { return null; }
}
