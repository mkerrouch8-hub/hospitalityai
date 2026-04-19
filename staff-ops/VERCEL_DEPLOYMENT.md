# 🚀 Vercel Deployment Guide

## Step 1: Push Code to GitHub

```bash
# Make sure you're in the project directory
cd staff-ops-saas-deploy

# Add all files
git add .

# Commit
git commit -m "Deploy to production"

# Push to GitHub
git push origin master
```

Replace `origin` with your actual GitHub remote.

## Step 2: Connect to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub (Mkerrouch8@gmail.com)
3. Click "New Project"
4. Select your GitHub repo: `staff-ops-saas`
5. Click "Import"

## Step 3: Add Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

```
NEXT_PUBLIC_SUPABASE_URL = https://ajaflqcxjnxjaqcifzdj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_u-rK-eUdRWv3Fa0IbUWeBg_Nbv2IBrb
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYWZscWN4am54amFxY2lmemRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU0NTQ0MywiZXhwIjoyMDkyMTIxNDQzfQ.TivjNXaYiQc5708mMUiLIz1D-gbEoMdUPFjHawXzNnU
NEXT_PUBLIC_APP_URL = https://staff.luxeops.it.com
NODE_ENV = production
```

## Step 4: Deploy

Click "Deploy" - Vercel will automatically build and deploy your site.

## Step 5: Connect Domain

In Vercel dashboard:
1. Go to Settings → Domains
2. Add `staff.luxeops.it.com`
3. Follow DNS configuration (add CNAME to your domain registrar)

## Step 6: Set Up Supabase Database

Run migrations on your Supabase project:

1. Go to Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `migrations.sql`
4. Click "Run" (or Ctrl+Enter)

## Done! 🎉

Your platform is now live at `staff.luxeops.it.com`

Test it:
1. Visit https://staff.luxeops.it.com
2. Click "Create Account"
3. Sign up with test email
4. Create hotel workspace
5. Verify dashboard loads
