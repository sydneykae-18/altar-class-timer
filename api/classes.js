const { kv } = require('@vercel/kv');

const KEY = 'altarClasses';
const LOG_KEY = 'altarDeletionLog';

function norm(s) {
  return String(s || '').trim().toLowerCase();
}

// Mirrors the client's shortInstructorName() so a legacy full-name createdBy
// ("Sydney Wilhelms") still matches a short-form deletedBy ("Sydney W.") sent
// by the newer UI — ownership shouldn't break just because display format changed.
function shortName(s) {
  const parts = String(s || '').trim().split(/\s+/);
  if (parts.length < 2) return s || '';
  return parts[0] + ' ' + parts[parts.length - 1].charAt(0).toUpperCase() + '.';
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      if (req.query.log) {
        const log = (await kv.get(LOG_KEY)) || [];
        res.status(200).json({ log });
        return;
      }
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
      if (idx >= 0) {
        // createdBy is locked at creation time — never let a later save change who
        // "owns" a class, even if the client tries to send a different value.
        const original = classes[idx];
        classes[idx] = { ...body, createdBy: original.createdBy || body.createdBy || '' };
      } else {
        if (!body.createdBy) {
          res.status(400).json({ error: 'missing createdBy' });
          return;
        }
        classes.unshift(body);
      }
      await kv.set(KEY, classes);
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      const deletedBy = req.query.deletedBy;
      if (!id) {
        res.status(400).json({ error: 'missing id' });
        return;
      }
      if (!deletedBy) {
        res.status(400).json({ error: 'missing deletedBy' });
        return;
      }
      const classes = (await kv.get(KEY)) || [];
      const target = classes.find((c) => c.id === id);
      if (!target) {
        res.status(404).json({ error: 'class not found' });
        return;
      }
      if (norm(shortName(target.createdBy)) !== norm(shortName(deletedBy))) {
        res.status(403).json({
          error: 'not the creator',
          createdBy: target.createdBy || 'Unknown',
        });
        return;
      }
      const next = classes.filter((c) => c.id !== id);
      await kv.set(KEY, next);

      const log = (await kv.get(LOG_KEY)) || [];
      log.unshift({
        classId: target.id,
        name: target.name || 'Untitled class',
        classType: target.classType || target.muscleGroup || '',
        createdBy: target.createdBy || 'Unknown',
        deletedBy,
        deletedAt: new Date().toISOString(),
      });
      await kv.set(LOG_KEY, log);

      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
