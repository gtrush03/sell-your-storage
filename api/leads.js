// GET /api/leads — return current leads (admin only, requires Bearer token)
export default async function handler(req, res) {
  const ADMIN = process.env.ADMIN_TOKEN;
  const GIST_ID = process.env.GIST_ID;
  const GH = process.env.GH_TOKEN;
  if (!ADMIN || !GIST_ID || !GH) return res.status(500).json({ error: 'config' });

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : (req.query.token || '');
  if (token !== ADMIN) return res.status(401).json({ error: 'unauthorized' });

  try {
    const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { Authorization: `token ${GH}`, 'User-Agent': 'sell-your-storage' }
    });
    if (!r.ok) return res.status(500).json({ error: 'gist-read' });
    const j = await r.json();
    const file = j.files['leads.json'];
    let leads = [];
    if (file && file.content) {
      try { leads = JSON.parse(file.content); } catch { leads = []; }
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, leads });
  } catch (e) {
    return res.status(500).json({ error: 'gist-read-net' });
  }
}
