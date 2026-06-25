# Setup Guide — Screenshot Analyzer

This guide walks you through setting up all 7 services needed to run Screenshot Analyzer locally and on Vercel.

---

## Quick Start (Local)

```bash
# 1. Copy the env template
cp .env.example .env.local

# 2. Fill in your keys (see sections below)
#    Open .env.local and replace each YOUR_... placeholder

# 3. Generate Prisma client
npx prisma generate

# 4. Push database schema to Supabase
npx prisma db push

# 5. Start the dev server
npm run dev
```

---

## 1. Supabase (Database)

Supabase provides PostgreSQL + Auth + API.

### Step-by-step:

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Note your **Project URL** and **Anon Key** from:  
   → Settings → API
3. Get the **Service Role Key** from the same page (keep this secret!)
4. Get the **Database Password** you set during project creation
5. Go to → Settings → Database → **Connection String**
6. Copy the **Session Pooler** string (port 6543) for `DATABASE_URL`
7. Copy the **Direct** connection string (port 5432) for `DIRECT_URL`
8. Go to → Settings → Database → Network Restrictions → **Enable "Allow all IPv4"**  
   (Required for Vercel to connect)

### Env vars:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
DATABASE_URL=postgresql://postgres.xxxxx:pass@aws-0-xxxx.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:pass@db.xxxxx.supabase.co:5432/postgres
```

---

## 2. Google Gemini AI (Code Generation)

Used to generate React / Vue / HTML / Android code from designs.

### Step-by-step:

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **"Get API Key"** → Create API key
3. Copy the key (should start with `AIzaSy` — NOT `AQ.`)

### Env var:
```
GEMINI_API_KEY=AIzaSy...
```

---

## 3. Cloudflare R2 (Image Storage)

Stores uploaded screenshots and analysis results.

### Step-by-step:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Create a bucket named `screenshot-analyzer-images`
3. Go to **Manage R2 API Tokens** → Create API Token
4. Give it **Object Read + Write** permissions
5. Copy the **Access Key ID** and **Secret Access Key**
6. Copy the **Endpoint** URL (looks like `https://xxxxx.r2.cloudflarestorage.com`)

### Env vars:
```
R2_ACCESS_KEY_ID=cdba45eae...
R2_SECRET_ACCESS_KEY=b470efb6...
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
R2_BUCKET_NAME=screenshot-analyzer-images
```

---

## 4. Upstash Redis (Caching + Rate Limiting)

Used for API rate limiting and analysis result caching.

### Step-by-step:

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a Redis database (free tier works)
3. Go to your database → **Details**
4. Copy the **REST URL** and **REST Token**

### Env vars:
```
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxx
```

---

## 5. Sentry (Error Monitoring) — Optional

Tracks errors and performance in production.

### Step-by-step:

1. Go to [sentry.io](https://sentry.io) → Create a project (choose **Next.js**)
2. Go to Settings → Projects → **Client Keys (DSN)**
3. Copy your DSN
4. (Optional for source maps) Go to Settings → Developer Settings → **Auth Tokens** → Create token with `project:releases` scope

### Env vars:
```
SENTRY_DSN=https://xxxxx@oxxxxx.ingest.us.sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@oxxxxx.ingest.us.sentry.io/xxxxx
# Optional — for source map uploads on Vercel:
# SENTRY_ORG=your-org
# SENTRY_PROJECT=your-project
# SENTRY_AUTH_TOKEN=sntrys_xxxxx
```

---

## 6. Hugging Face ML Service — Optional

The ML service performs actual screenshot element detection.  
Without it, the app uses mock data for demo purposes.

### Step-by-step:

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) → Create new Space
2. Choose **Docker** → **Blank**
3. Deploy the Python code from the `ml-service/` folder
4. Copy the Space URL

### Env var:
```
ML_SERVICE_URL=https://your-username-screenshot-analyzer-ml.hf.space
```

---

## 7. NextAuth (Authentication) — Optional

### Env vars:
```
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxx
NEXTAUTH_URL=http://localhost:3000  # Change to Vercel URL in production
```

---

## Vercel Deployment

Once all env vars are set:

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Vercel auto-detects Next.js — no config needed
4. Paste all env vars from `.env.local` into Vercel → Settings → Environment Variables
5. Deploy!

The `postinstall` script auto-runs `prisma generate` during Vercel builds.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `P1001: Can't reach database server` | Enable "Allow all IPv4" in Supabase → Database → Network Restrictions |
| `FATAL: tenant/user not found` | Check the pooler URL format — it should be `postgres.YOUR_REF`, not just `postgres` |
| Gemini key not working | Keys must start with `AIzaSy`. Get one from [aistudio.google.com](https://aistudio.google.com/apikey) |
| Images not uploading | Verify R2 bucket exists and API token has read+write permissions |
| ML analysis returns mock data | `ML_SERVICE_URL` is not configured or the HF Space is sleeping (use a cron pinger) |
