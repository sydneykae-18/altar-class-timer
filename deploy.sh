#!/bin/bash
# ALTAR Class Timer — one-command deploy
# Usage: bash deploy.sh "your commit message"
# Or just: bash deploy.sh  (uses a default message)

MSG="${1:-Update class timer}"
cd "$(dirname "$0")"

git add -A
git commit -m "$MSG"
git push origin main

echo ""
echo "✓ Pushed. Vercel will auto-deploy in ~30 seconds."
echo "  Check: https://vercel.com/dashboard"
