# Cafe Express — Vercel Deployment Guide

This Next.js App Router project deploys **frontend + backend together** on Vercel. All routes under `app/api/**` become serverless API functions automatically.

---

## Architecture on Vercel

| Layer | Location | Hosting |
|-------|----------|---------|
| Pages (UI) | `app/**/page.tsx` | Vercel Edge / Node |
| API (backend) | `app/api/**/route.ts` | Vercel Serverless Functions |
| Auth middleware | `proxy.ts` | Edge middleware |
| Database | MongoDB Atlas | External (required) |

---

## Prerequisites

1. [Git](https://git-scm.com/downloads) installed
2. [Node.js 20+](https://nodejs.org/)
3. [Vercel account](https://vercel.com)
4. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free tier works)
5. Optional: [GitHub](https://github.com) for one-click import

---

## Step 1 — Verify build locally

```powershell
cd c:\Users\Baap\Desktop\cafe\cafe01\my-app
npm install
npm run build
npm run start
```

Open http://localhost:3000. Fix any errors before deploying.

---

## Step 2 — MongoDB Atlas (production database)

Local `mongodb://localhost:...` **does not work** on Vercel.

1. Create cluster at https://cloud.mongodb.com
2. **Database Access** → add user + password
3. **Network Access** → allow `0.0.0.0/0` (required for Vercel serverless)
4. **Connect** → Drivers → copy connection string
5. Example format:

```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/cafe?retryWrites=true&w=majority
```

---

## Step 3 — Environment variables

Copy `.env.example` to `.env.local` for local development.  
On Vercel, add the same keys in **Project → Settings → Environment Variables**.

### Required

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Random string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` (no trailing slash) |
| `JWT_SECRET` | Same as `NEXTAUTH_SECRET` or separate random string |

### Email (OTP) — pick one approach

**Recommended on Vercel: Resend**

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | From https://resend.com |
| `RESEND_FROM_EMAIL` | Verified sender, e.g. `Cafe <noreply@yourdomain.com>` |
| `RESEND_TEST_EMAIL` | Only for testing without a domain |

**Alternative: Gmail SMTP** (less reliable on serverless)

| Variable | Description |
|----------|-------------|
| `EMAIL_USER` | Gmail address |
| `EMAIL_PASS` | Gmail App Password |

Do **not** set `NODE_TLS_REJECT_UNAUTHORIZED=0` in production.

### Google OAuth (optional)

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth client |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth secret |

Add in Google Console:

- **Authorized JavaScript origins:** `https://your-project.vercel.app`
- **Redirect URI:** `https://your-project.vercel.app/api/auth/callback/google`

### Razorpay (optional)

| Variable | Description |
|----------|-------------|
| `RAZORPAY_KEY_ID` | Server key |
| `RAZORPAY_KEY_SECRET` | Server secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signing secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public key for checkout UI |

Webhook URL in Razorpay dashboard:

```
https://your-project.vercel.app/api/webhooks/razorpay
```

### Optional

| Variable | Description |
|----------|-------------|
| `WHATSAPP_ACCESS_TOKEN` | Meta WhatsApp API |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta phone number ID |
| `INSTAGRAM_CLIENT_ID` / `SECRET` | Instagram login |
| `NEXT_PUBLIC_INSTAGRAM_READY` | Set `true` when Instagram OAuth is configured |
| `ALLOW_SMTP_TEST` | Set `true` only if you need `/api/auth/test-smtp` in production |

---

## Step 4 — Push to GitHub

```powershell
cd c:\Users\Baap\Desktop\cafe\cafe01\my-app
git init
git add .
git commit -m "Production-ready Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

`.env.local` is gitignored — never commit secrets.

---

## Step 5 — Deploy on Vercel (Dashboard)

1. Go to https://vercel.com/new
2. **Import** your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Root directory: `.` (project root)
5. Build command: `npm run build` (default)
6. Add all environment variables from Step 3
7. Click **Deploy**

After first deploy:

1. Copy your live URL (e.g. `https://cafe-express.vercel.app`)
2. Set `NEXTAUTH_URL` to that exact URL
3. Update Google OAuth redirect URIs
4. **Redeploy** (Deployments → ⋯ → Redeploy)

---

## Step 6 — Deploy with Vercel CLI

```powershell
npm install -g vercel
cd c:\Users\Baap\Desktop\cafe\cafe01\my-app
vercel login
vercel
```

First run links the project. Add env vars:

```powershell
vercel env add MONGODB_URI
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add JWT_SECRET
# ... repeat for each variable
```

Production deploy:

```powershell
npm run deploy
# or: vercel --prod
```

Preview deploy:

```powershell
npm run deploy:preview
# or: vercel
```

---

## API routes (production checklist)

These deploy as serverless functions:

| Route | Purpose |
|-------|---------|
| `/api/auth/[...nextauth]` | NextAuth session & OAuth |
| `/api/auth/login` | Credentials + send OTP |
| `/api/auth/send-otp` | Send verification code |
| `/api/auth/verify-otp` | Verify OTP + auth cookie |
| `/api/signup` | Create account (requires OTP token) |
| `/api/signup/verify-otp` | Verify email before signup |
| `/api/cart` | Guest + user cart |
| `/api/orders` | Place & list orders |
| `/api/webhooks/razorpay` | Payment confirmation |
| `/api/reservations` | Table booking (auth required) |

Test after deploy:

```text
GET  https://your-app.vercel.app/api/auth/providers
POST https://your-app.vercel.app/api/auth/send-otp  (with JSON body)
```

`/api/auth/test-smtp` is **disabled in production** unless `ALLOW_SMTP_TEST=true`.

---

## Project files for deployment

| File | Purpose |
|------|---------|
| `vercel.json` | Region (Mumbai), API timeout, cache headers |
| `.env.example` | Template for all env vars (no secrets) |
| `lib/auth.ts` | NextAuth config (shared by API routes) |
| `lib/route-config.ts` | Serverless runtime settings for APIs |
| `next.config.ts` | Image domains (Unsplash, Google avatars) |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Run `npm run build` locally; fix TypeScript errors |
| `Failed to fetch` + `chrome-extension://` | Browser extension blocking requests — use Incognito |
| MongoDB timeout | Use Atlas; allow `0.0.0.0/0`; check `MONGODB_URI` |
| NextAuth redirect loop | `NEXTAUTH_URL` must match live URL exactly |
| OTP email not sent | Use Resend; set `RESEND_API_KEY` |
| Guest checkout blocked | `api/orders` is public in `proxy.ts` |
| Images not loading | Remote images must use allowed domains in `next.config.ts` |

---

## Security checklist

- [ ] Rotate any secrets that were ever committed or shared
- [ ] Use strong `NEXTAUTH_SECRET` and `JWT_SECRET`
- [ ] Never commit `.env.local`
- [ ] Use MongoDB Atlas with a dedicated DB user (least privilege)
- [ ] Keep `ALLOW_SMTP_TEST` unset in production
- [ ] Use Razorpay live keys only on production domain

---

## Quick reference

```powershell
# Local
npm run dev
npm run build
npm run start

# Vercel CLI
vercel login
vercel          # preview
vercel --prod   # production
```

Live site: `https://<your-project>.vercel.app`
