# 🚀 Staff Operations SaaS — Complete Deployment Guide

## Phase 1: Supabase Setup (10 minutes)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → Sign in
2. Click "New Project"
3. Project name: `staff-luxeops`
4. Database password: Generate strong password (save it)
5. Region: Closest to Morocco (EU - Dublin or EU - Frankfurt)
6. Click "Create new project" (takes 2-3 minutes)

### Step 2: Get Your Credentials
After project creates:
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: `eyJhbGc...` (starts with eyJ)
   - **Service Role Key**: `eyJhbGc...` (longer, different from anon)
3. Save all three in a secure note

### Step 3: Run Database Migrations
1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **+ New Query**
3. Copy-paste the entire `migrations.sql` file from this project
4. Click **Run**
5. You should see "Success" — all tables created ✅

### Step 4: Enable Email Auth
1. Go to **Authentication** → **Providers**
2. Email should be enabled by default
3. Click Settings (gear icon) → **Email Auth**
4. Enable: "Confirm email" (or disable for testing)
5. Save

---

## Phase 2: Local Setup (5 minutes)

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/staff-ops-saas.git
cd staff-ops-saas
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create `.env.local`
Create file in project root:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=paste-your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 4: Test Locally
```bash
npm run dev
# Open http://localhost:3000 in browser
```

**Test flow:**
1. Click "Create New Account"
2. Fill in: Email, Password, Hotel Name
3. Submit → should redirect to dashboard
4. Click "Sign Out" → should go back to login

If this works, everything is connected! ✅

---

## Phase 3: Deploy to Vercel (5 minutes)

### Option A: Git Integration (Recommended)

#### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Staff Operations SaaS"
git branch -M main
git remote add origin https://github.com/yourusername/staff-ops-saas.git
git push -u origin main
```

#### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → Sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repo
4. Name: `staff-luxeops`
5. Framework: **Next.js**
6. Root Directory: `./` (default)
7. Click "Deploy"

#### Step 3: Add Environment Variables
Before deployment finalizes:
1. Go to **Settings** → **Environment Variables**
2. Add all three from your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
   NEXT_PUBLIC_APP_URL = https://staff.luxeops.it.com
   NODE_ENV = production
   ```
3. **Save** and **Redeploy**

#### Step 4: Configure Domain
1. In Vercel project, go to **Settings** → **Domains**
2. Click "Add Domain"
3. Enter: `staff.luxeops.it.com`
4. Follow Vercel's DNS setup (add CNAME to your domain provider)

**DNS Setup (at your domain provider — GoDaddy, Namecheap, etc.):**
- Type: `CNAME`
- Name: `staff`
- Value: `cname.vercel-dns.com` (or Vercel's provided value)
- Save

(DNS propagation takes 5-30 minutes)

### Option B: Manual Deployment (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod --env-file .env.local

# Follow prompts and it's done
```

---

## Phase 4: Test Production (10 minutes)

### Step 1: Test Authentication
1. Open `https://staff.luxeops.it.com` (or your deployed URL)
2. Click "Create Account"
3. Register with:
   - Email: `manager1@test.com`
   - Password: `TestPass123!`
   - Hotel: "Test Hotel Marrakech"
   - City: Marrakech
4. Submit → Should see dashboard ✅

### Step 2: Test Data Isolation
1. Open **Supabase Dashboard** → **SQL Editor**
2. Create second test user:
```sql
-- In SQL Editor, create a second hotel
INSERT INTO hotels (user_id, name, email, phone, city)
SELECT id, 'Test Hotel 2', 'manager2@test.com', '+212600000000', 'Fès'
FROM auth.users
WHERE email = 'manager2@test.com'
LIMIT 1;
```

3. Log out and register as `manager2@test.com`
4. You should see only "Test Hotel 2" in dashboard
5. Manager1 cannot see Manager2's data ✅

### Step 3: Verify Security
- Try accessing another hotel's ID in URL (change `hotel_id` in localStorage)
- Database RLS should block it (get no data back)
- Check browser console → no errors ✅

---

## Phase 5: Production Checklist

### Security
- [ ] All env variables are production keys (from Supabase)
- [ ] Service role key is NEVER exposed to frontend
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] Email verification enabled in Supabase
- [ ] Row-level security policies working

### Performance
- [ ] Database indexes created (in migrations.sql)
- [ ] Vercel deployment shows green status
- [ ] Page loads in < 2 seconds
- [ ] No console errors

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Supabase logs being recorded
- [ ] Email notifications set up for errors
- [ ] Backup strategy in place (Supabase backups daily by default)

### Compliance
- [ ] Privacy policy visible
- [ ] Terms of service displayed
- [ ] GDPR compliance ready
- [ ] Audit logs enabled

---

## Post-Deployment: Next Steps

### Immediate (Week 1)
1. Add staff invitations system
2. Create task management interface
3. Set up daily briefing scheduler
4. Add incident reporting

### Short-term (Month 1)
1. Email notifications (n8n integration)
2. Mobile app (React Native)
3. Analytics dashboard
4. Stripe billing integration

### Long-term (Month 3+)
1. AI-powered task suggestions
2. Video chat for staff
3. Multi-language support
4. Advanced reporting

---

## 🆘 Troubleshooting

### "Can't access Supabase"
```
Check: NEXT_PUBLIC_SUPABASE_URL is correct
- Go to Supabase Settings → API
- Copy exact URL again
```

### "Login always fails"
```
Check: Email auth provider is enabled
- Supabase Dashboard → Authentication → Providers
- Email should show "Enabled"
```

### "Data not saving"
```
Check: Database migrations ran
- Supabase → SQL Editor
- Select default database
- Run: SELECT COUNT(*) FROM hotels;
- Should return a number, not error
```

### "Domain not working"
```
Check: DNS propagation
- Use: https://dnschecker.org
- Enter: staff.luxeops.it.com
- Wait 15-30 minutes if not yet propagated
- Check Vercel domain status (should show green)
```

### "Environment variables not working"
```
Check: Vercel has correct values
- Vercel Dashboard → Project Settings → Environment Variables
- Verify all 5 variables are there
- Click "Redeploy" after adding/updating
```

---

## 📊 Monitoring Commands

### Check Database Health
```sql
-- In Supabase SQL Editor:
SELECT COUNT(*) FROM auth.users;
SELECT COUNT(*) FROM hotels;
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;
```

### Check Logs
- **Vercel**: Project → Deployments → click latest → View Logs
- **Supabase**: Project → Logs → select database
- **Errors**: Vercel Functions tab

---

## 🎯 Your Hotel Launch Checklist

Before inviting first hotel clients:

- [ ] Domain working
- [ ] SSL certificate (auto, from Vercel)
- [ ] Registration page tested
- [ ] Login page tested
- [ ] Dashboard loads without errors
- [ ] Can see hotel data (isolated per account)
- [ ] Backup strategy documented
- [ ] Support email configured
- [ ] Error monitoring set up
- [ ] Analytics tracking enabled

---

## 💬 Questions?

**Email**: kerrouch@luxeops.it.com
**WhatsApp**: +212 699 072 698

---

**✅ You now have a production-ready multi-tenant SaaS platform.**

**Each hotel gets:**
- Secure login with their own email/password
- Isolated dashboard (cannot see other hotels)
- Complete staff management
- Task tracking
- Incident reporting
- Audit logs

**Nobody with main credentials can access individual hotel workspaces.**

Happy launching! 🚀
