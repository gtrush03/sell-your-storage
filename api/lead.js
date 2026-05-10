// POST /api/lead — append a new lead to the Gist store
export default async function handler(req, res) {
  // CORS for safety (sites + admin are same-origin, but just in case)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method-not-allowed' });

  const GIST_ID = process.env.GIST_ID;
  const GH = process.env.GH_TOKEN;
  if (!GIST_ID || !GH) return res.status(500).json({ error: 'config' });

  // Parse body (Vercel auto-parses JSON, but accept urlencoded too)
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const name    = String(body.name    || '').trim().slice(0, 120);
  const phone   = String(body.phone   || '').trim().slice(0, 40);
  const email   = String(body.email   || '').trim().slice(0, 200);
  const notes   = String(body.notes   || '').trim().slice(0, 2000);
  const variant = String(body.variant || 'unknown').slice(0, 20);

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'missing-fields' });
  }

  // Fetch current gist
  let leads = [];
  try {
    const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { Authorization: `token ${GH}`, 'User-Agent': 'sell-your-storage' }
    });
    if (r.ok) {
      const j = await r.json();
      const file = j.files['leads.json'];
      if (file && file.content) {
        try { leads = JSON.parse(file.content); } catch { leads = []; }
      }
    }
  } catch (e) { leads = []; }
  if (!Array.isArray(leads)) leads = [];

  const lead = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name, phone, email, notes, variant,
    ts: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || null,
    ua: req.headers['user-agent'] || null,
    ref: req.headers['referer'] || null
  };
  leads.unshift(lead);

  // Patch gist
  try {
    const p = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${GH}`,
        'User-Agent': 'sell-your-storage',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: { 'leads.json': { content: JSON.stringify(leads, null, 2) } }
      })
    });
    if (!p.ok) {
      const t = await p.text();
      return res.status(500).json({ error: 'gist-write', detail: t.slice(0,200) });
    }
  } catch (e) {
    return res.status(500).json({ error: 'gist-write-net' });
  }

  return res.status(200).json({ ok: true, id: lead.id });
}
