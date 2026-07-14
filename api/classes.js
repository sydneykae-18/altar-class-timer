const { kv } = require('@vercel/kv');

const KEY = 'altarClasses';

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const classes = (await kv.get(KEY)) || [];
      res.status(200).json({ classes });
      return;
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.id) {
        res.status(400).json({ error: 'missing id' });
        return;
      }
      const classes = (await kv.get(KEY)) || [];
      const idx = classes.findIndex((c) => c.id === body.id);
      if (idx >= 0) classes[idx] = body;
      else classes.unshift(body);
      await kv.set(KEY, classes);
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) {
        res.status(400).json({ error: 'missing id' });
        return;
      }
      const classes = (await kv.get(KEY)) || [];
      const next = classes.filter((c) => c.id !== id);
      await kv.set(KEY, next);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
