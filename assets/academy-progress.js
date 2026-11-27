// Affiche le grade pédagogique et les points (lecture seule : tout est calculé par la base).
const $ = id => document.getElementById(id);
function el(tag, text, cls) { const n = document.createElement(tag); if (text != null) n.textContent = text; if (cls) n.className = cls; return n; }
function clear() { $('grade-panel').hidden = true; $('grade-name').textContent = 'Badaud'; $('grade-points').textContent = '—'; }
async function load() {
  const client = window.__dbClient; if (!client) return;
  const { data, error } = await client.rpc('academy_progress');
  if (error || !data) return;
  $('grade-name').textContent = data.grade.name; $('grade-points').textContent = data.earned + ' pts';
  const span = data.next ? data.next.min - data.grade.min : 1, done = data.next ? data.earned - data.grade.min : 1;
  const pct = Math.max(0, Math.min(100, Math.round(100 * done / span)));
  $('grade-fill').style.width = pct + '%'; $('grade-fill').parentElement.setAttribute('aria-valuenow', pct);
  $('grade-next').textContent = data.next ? 'Encore ' + (data.next.min - data.earned) + ' points pour atteindre : ' + data.next.name + '.' : 'Tu as atteint le dernier grade pour l’instant.';
  const ladder = $('grade-ladder'); ladder.replaceChildren();
  for (const g of data.grades) { const li = el('li', g.name + ' · ' + g.min + ' pts'); if (g.rank < data.grade.rank) li.className = 'done'; else if (g.rank === data.grade.rank) li.className = 'now'; ladder.append(li); }
  const rules = $('grade-rules'); rules.replaceChildren();
  for (const r of data.rules) rules.append(el('li', '+' + r.points + ' · ' + r.label + (r.cap ? ' (plafond ' + r.cap + ' par jour)' : '')));
  $('grade-panel').hidden = false;
}
window.addEventListener('db-session', e => { if (e.detail.signedIn) setTimeout(() => load().catch(() => {}), 0); else clear(); });
