# Altar Class Timer

Static site (`index.html`) plus one serverless API route (`api/classes.js`) that stores your saved classes in Vercel KV, so any device that opens this same Vercel link sees the same saved classes — no more "built it on my laptop, not there on my phone."

## One-time setup to enable saving (do this in your Vercel dashboard)

1. Open your project on vercel.com.
2. Go to the **Storage** tab.
3. Click **Create Database** → choose **KV** (Redis-backed key-value store) → follow the prompts to create it.
4. When asked, **connect it to this project** — Vercel will automatically add the `KV_REST_API_URL` / `KV_REST_API_TOKEN` environment variables for you.
5. Vercel will prompt a redeploy (or trigger one yourself from the Deployments tab) so the new environment variables take effect.

Once that's connected, tapping **Save Class** in the Build tab saves your workout (with date, muscle group, and instructor) to the cloud, and the **My Classes** tab will show it on any device that opens this site.

## Updating the app itself

To update: replace `index.html` (and/or `api/classes.js`) with the latest version, push/upload again, and Vercel redeploys automatically within seconds.

## How saving works

- **Save Class** — saves the current Build tab as an entry in your cloud class library (creates a new entry the first time, updates it on later saves).
- **My Classes** tab — lists every saved class by date, with Load / Duplicate / Delete.
- Local browser storage is still used as a same-device draft cache, so in-progress edits aren't lost if you navigate away before saving — but the cloud library (via Save Class) is what actually follows you across devices.
