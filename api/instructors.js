const { kv } = require('@vercel/kv');

const KEY = 'altarInstructors';

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const instructors = (await kv.get(KEY)) || null;
      res.status(200).json({ instructors });
      return;
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (!Array.isArray(body.instructors)) {
        res.status(400).json({ error: 'instructors must be an array' });
        return;
      }
      await kv.set(KEY, body.instructors);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
