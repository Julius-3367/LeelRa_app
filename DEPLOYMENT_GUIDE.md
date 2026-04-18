# Deployment Guide - LeelRa Application

## Best Free Hosting Options for Full-Stack Next.js

### 1. Vercel (Recommended - Fastest Loading)
**Why Vercel?**
- Built by Next.js creators - perfect optimization
- Global CDN for fastest loading worldwide
- Automatic deployments from GitHub
- Free SSL certificate
- Serverless functions for API routes

**Free Tier Limits:**
- 100GB bandwidth/month
- 100 function invocations/month
- 1 concurrent build
- Perfect for your constituency app

### 2. Railway (Alternative - Includes Database)
**Why Railway?**
- Full-stack deployment (frontend + database)
- PostgreSQL database included
- Easy environment variable management
- Free tier: $5 credit/month

### 3. Netlify (Good Alternative)
**Why Netlify?**
- Fast global CDN
- Easy GitHub integration
- Free SSL and domain
- Need external database (Supabase/PlanetScale)

---

## Vercel Deployment (Recommended)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)
3. Install Vercel GitHub app

### Step 2: Import Repository
1. Click "New Project"
2. Select your `LeelRa_app` repository
3. Vercel will auto-detect Next.js

### Step 3: Configure Environment Variables
Add these in Vercel dashboard:

```env
# Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.opnloqodiufrbwuswfam.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://opnloqodiufrbwuswfam.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_LyD1pKmVAOdWHfOIw9H8lA_8ws2mCP5"

# NextAuth
NEXTAUTH_SECRET="your_32_character_secret"
NEXTAUTH_URL="https://your-app.vercel.app"

# JWT
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="24h"

# Email (SendGrid)
SENDGRID_API_KEY="SG.your_sendgrid_key"
EMAIL_FROM="noreply@leelra.ke"

# Firebase (for push notifications)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project"}'

# Cloudinary (file uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Redis (caching)
REDIS_URL="redis://your_redis_url"

# Pusher (real-time)
PUSHER_APP_ID="your_app_id"
PUSHER_KEY="your_key"
PUSHER_SECRET="your_secret"
PUSHER_CLUSTER="eu"
NEXT_PUBLIC_PUSHER_KEY="your_key"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"

# App URLs
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
APP_URL="https://your-app.vercel.app"
```

### Step 4: Set Up Database
**Option A: Supabase (Free PostgreSQL)**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Add to Vercel environment variables
5. Run migrations in Supabase SQL editor

**Option B: Railway (Includes Database)**
1. Go to [railway.app](https://railway.app)
2. Create PostgreSQL service
3. Get connection string
4. Add to Vercel environment variables

### Step 5: Deploy
1. Click "Deploy" in Vercel
2. Wait for build (2-3 minutes)
3. Your app will be live at `your-app-name.vercel.app`

---

## Database Setup (Supabase Example)

### 1. Create Supabase Project
```bash
# After creating project, get connection string
# Format: postgresql://user:password@host:port/database
```

### 2. Run Database Migrations
In Supabase SQL Editor, run:

```sql
-- Create tables (copy from prisma/migrations)
-- Or use Prisma with your connection string
```

### 3. Seed Data (Optional)
Add sample data for testing.

---

## Performance Optimizations Already Applied

### Frontend Optimizations
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Bundle optimization
- Font loading fallbacks

### Backend Optimizations
- Database query optimization
- Caching strategies
- API response compression

### Expected Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Global CDN**: Fast loading worldwide

---

## Alternative: Railway (All-in-One)

### Why Choose Railway?
- Database included
- Simpler setup
- Good for beginners

### Steps:
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Import project: `railway up`
4. Add PostgreSQL service
5. Configure environment variables
6. Deploy

---

## Post-Deployment Checklist

### 1. Test Core Features
- [ ] User login/logout
- [ ] Request submission
- [ ] Dashboard loading
- [ ] File uploads
- [ ] Email notifications

### 2. Set Up Custom Domain (Optional)
- In Vercel: Settings > Domains
- Add your custom domain
- Update DNS records

### 3. Monitor Performance
- Vercel Analytics
- Google PageSpeed Insights
- GTmetrix

---

## Troubleshooting

### Common Issues:
1. **Database Connection**: Check DATABASE_URL format
2. **Environment Variables**: Ensure all required vars are set
3. **Build Errors**: Check logs in Vercel dashboard
4. **Font Loading**: Falls back to system fonts (OK)

### Get Help:
- Vercel docs: vercel.com/docs
- GitHub issues in repository
- Community forums

---

## Speed Comparison

| Platform | Loading Speed | Setup Difficulty | Database Included |
|----------|---------------|------------------|------------------|
| **Vercel** | Fastest | Easy | External needed |
| Railway | Fast | Easiest | Yes |
| Netlify | Fast | Easy | External needed |

**Recommendation**: Vercel + Supabase for best performance and reliability.
