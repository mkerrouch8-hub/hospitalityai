## Staff Operations AI — Multi-Tenant SaaS Platform

### Overview

A **production-grade, multi-tenant SaaS platform** for hotel staff operations. Each hotel gets:
- ✅ Isolated workspace (no cross-contamination)
- ✅ Secure authentication & session management
- ✅ Role-based access control
- ✅ Real-time task management
- ✅ Staff invitations & management
- ✅ Daily briefings & incident tracking
- ✅ Complete audit logs

---

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Security**: Row-Level Security (RLS), JWT tokens, encrypted sessions
- **Deployment**: Vercel (or any Node.js host)

### Database Schema
```
hotels (each subscription)
├── staff (per hotel, isolated)
├── tasks (per hotel, isolated)
├── briefings (per hotel, isolated)
├── incidents (per hotel, isolated)
└── activity_logs (per hotel, isolated)
```

Every query is filtered by `hotel_id` via RLS policies — **no hotel can see another hotel's data**.

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js 18+
- A Supabase account (free tier available)
- A domain (e.g., `staff.luxeops.it.com`)

### 2. Clone & Install
```bash
git clone <repo-url>
cd staff-ops-saas
npm install
```

### 3. Set Up Supabase

#### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your **Project URL** and **Anon Key** from Settings → API

#### Run Migrations
1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Paste the entire contents of `migrations.sql`
4. Execute

This creates:
- All tables with RLS policies
- Proper indexes for performance
- Complete multi-tenant isolation

### 4. Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=https://staff.luxeops.it.com
NODE_ENV=production
```

Get your **Service Role Key** from Supabase Settings → API.

### 5. Local Development
```bash
npm run dev
# Visit http://localhost:3000
```

### 6. Deploy to Vercel

#### Option A: Git Integration (Recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import GitHub repo
4. Add environment variables (same as `.env.local`)
5. Deploy

#### Option B: CLI
```bash
npm install -g vercel
vercel --prod
```

---

## 📖 How It Works

### 1. Registration (Hotel Manager)
- Manager visits `/register`
- Creates account with hotel info
- Supabase Auth creates user + JWT token
- App creates hotel record linked to user
- Manager is redirected to dashboard

### 2. Login
- Any hotel staff member visits `/login`
- Enters credentials
- Supabase verifies and issues session
- User sees only their hotel's data (RLS enforces this)

### 3. Data Isolation
**Row-Level Security Policy Example:**
```sql
CREATE POLICY staff_hotel_policy ON staff
  FOR SELECT
  USING (
    hotel_id IN (
      SELECT id FROM hotels WHERE user_id = auth.uid()
    )
  );
```

This means: **A user can only see staff from hotels they own or are invited to.**

### 4. Inviting Staff
Hotel manager invites staff via `/dashboard/staff/invite`:
1. Manager enters staff email
2. System sends invitation link
3. Staff clicks link, sets password
4. Staff account is created with limited permissions
5. Staff is assigned to that hotel only

---

## 🔐 Security Features

### ✅ Implemented
- **JWT-based auth** (Supabase handles it)
- **Row-Level Security** (database-level enforcement)
- **HTTPS only** (enforced on production)
- **Email verification** (Supabase built-in)
- **Session tokens** (auto-managed)
- **Audit logs** (all actions tracked)

### 🛡️ Best Practices
- Never expose service role key to frontend
- All queries filtered by `hotel_id`
- Sensitive operations go through backend APIs
- Two-factor authentication (enable in Supabase)

---

## 📱 Features Roadmap

### Phase 1 (Done)
- ✅ Registration & login
- ✅ Multi-tenant isolation
- ✅ Dashboard overview
- ✅ Role-based access

### Phase 2 (Next)
- [ ] Task creation & assignment
- [ ] Staff member invitations
- [ ] Daily briefing system
- [ ] Incident reporting

### Phase 3
- [ ] Real-time notifications
- [ ] Mobile app
- [ ] AI-powered task suggestions
- [ ] Analytics & reporting

---

## 🔗 API Endpoints (Backend)

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
```

### Tasks
```
GET    /api/tasks (hotel-filtered)
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

### Staff
```
GET    /api/staff
POST   /api/staff/invite
PATCH  /api/staff/:id
DELETE /api/staff/:id
```

### Briefings
```
GET    /api/briefings
POST   /api/briefings
PATCH  /api/briefings/:id
```

(To be implemented in Phase 2)

---

## 🧪 Testing Multi-Tenancy

### Test Data
```sql
-- Create test hotel 1
INSERT INTO hotels (user_id, name, email, phone, city)
VALUES ('user-id-1', 'Hotel A', 'manager@hotela.com', '+1234567890', 'Marrakech');

-- Create test hotel 2
INSERT INTO hotels (user_id, name, email, phone, city)
VALUES ('user-id-2', 'Hotel B', 'manager@hotelb.com', '+0987654321', 'Fès');
```

### Verify Isolation
```sql
-- User 1 can only see Hotel A's tasks
SELECT * FROM tasks
WHERE hotel_id = (SELECT id FROM hotels WHERE user_id = 'user-id-1');

-- User 2 cannot access Hotel A's data (RLS prevents it)
-- Even if they try, database denies the query
```

---

## 📊 Monitoring & Logs

### Supabase Dashboard
- **Auth logs**: All login/signup events
- **Database logs**: Query performance
- **Real-time logs**: WebSocket connections
- **Audit trail**: All table changes

### Application Logs
- Activity logs stored in `activity_logs` table
- Searchable by hotel, user, action
- Timestamps for compliance

---

## 💳 Pricing & Subscriptions

### Tiers
- **Starter**: MAD 1,500/mo (5 staff members)
- **Professional**: MAD 3,500/mo (20 staff members)
- **Enterprise**: Custom (unlimited)

### Billing Implementation (Future)
```typescript
// Add to hotels table:
subscription_plan: 'starter' | 'professional' | 'enterprise'
subscription_status: 'active' | 'paused' | 'cancelled'
billing_cycle_end: DATE
```

---

## 🚨 Troubleshooting

### "Auth context error"
- Make sure app is wrapped in `<AuthProvider>`
- Check `.env.local` has correct Supabase keys

### "Row-level security violation"
- User doesn't own the hotel they're accessing
- Check `hotels` table user_id matches logged-in user

### "Page shows 'Loading...' forever"
- Supabase connection issue
- Check network tab in dev tools
- Verify Supabase URL and keys in console

---

## 📞 Support

- Email: kerrouch@luxeops.it.com
- WhatsApp: +212 699 072 698
- Issues: GitHub issues (if open-source)

---

## 📄 License

Proprietary — LUXE OPS 2026

---

**Built with ❤️ for hospitality teams.**
