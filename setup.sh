#!/bin/bash
# ═══════════════════════════════════════
# CoachForge — Quick Setup
# ═══════════════════════════════════════

echo ""
echo "🔥 CoachForge Setup"
echo "═══════════════════"
echo ""
echo "This will ask you for your API keys one by one."
echo "Have these dashboards open:"
echo "  - supabase.com (Settings → API)"
echo "  - dashboard.stripe.com (Developers → API keys)"
echo "  - console.anthropic.com (API Keys)"
echo "  - resend.com (API Keys)"
echo "  - dashboard.daily.co (Developers)"
echo "  - console.deepgram.com (API Keys)"
echo ""
read -p "Ready? Press Enter to start..."

echo ""
echo "── SUPABASE ──"
read -p "Project URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Anon Key (eyJ...): " SUPABASE_ANON
read -p "Service Role Key (eyJ...): " SUPABASE_SERVICE

echo ""
echo "── STRIPE (use TEST mode keys) ──"
read -p "Secret Key (sk_test_...): " STRIPE_SECRET
read -p "Publishable Key (pk_test_...): " STRIPE_PUB
read -p "Starter Price ID (price_...): " STRIPE_STARTER
read -p "Pro Price ID (price_...): " STRIPE_PRO
read -p "Agency Price ID (price_...): " STRIPE_AGENCY

echo ""
echo "── ANTHROPIC ──"
read -p "API Key (sk-ant-...): " ANTHROPIC_KEY

echo ""
echo "── RESEND ──"
read -p "API Key (re_...): " RESEND_KEY

echo ""
echo "── DAILY.CO ──"
read -p "API Key: " DAILY_KEY
read -p "Domain (e.g. coachforge.daily.co): " DAILY_DOMAIN

echo ""
echo "── DEEPGRAM ──"
read -p "API Key: " DEEPGRAM_KEY

# Write .env.local
cat > .env.local << EOF
# ═══════════════════════════════════════
# COACHFORGE — Environment Variables
# ═══════════════════════════════════════

# Supabase
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE

# Stripe
STRIPE_SECRET_KEY=$STRIPE_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUB
STRIPE_WEBHOOK_SECRET=whsec_placeholder
STRIPE_PRICE_STARTER=$STRIPE_STARTER
STRIPE_PRICE_PRO=$STRIPE_PRO
STRIPE_PRICE_AGENCY=$STRIPE_AGENCY

# Daily.co (Video Calls)
DAILY_API_KEY=$DAILY_KEY
NEXT_PUBLIC_DAILY_DOMAIN=$DAILY_DOMAIN

# Deepgram (Transcription)
DEEPGRAM_API_KEY=$DEEPGRAM_KEY

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=$ANTHROPIC_KEY

# Resend (Email)
RESEND_API_KEY=$RESEND_KEY
RESEND_FROM_EMAIL=hello@coachforge.pro

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=coachforge-cron-$(date +%s)
EOF

echo ""
echo "✅ .env.local created!"
echo ""
echo "Now run:"
echo "  npm install"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000"
echo ""
