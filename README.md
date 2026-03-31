# 🤖 AI Chat Platform

Professional Multi-Platform AI Chat Platform with Personas — منصة دردشة احترافية متعددة المنصات بالذكاء الاصطناعي مع شخصيات متخصصة

## ✨ Features

- **7 AI Platforms**: OpenRouter, Groq, OpenAI, Anthropic, Google Gemini, Together AI, Mistral
- **Persona System**: 4 built-in personas + custom creation + community sharing
- **3 Account Types**: Admin, Premium, Free with role-based access
- **Bilingual**: Full Arabic (RTL) + English (LTR) support
- **Real-time Streaming**: SSE streaming with typing indicator
- **AES-256 Encryption**: All API keys encrypted at rest
- **Rate Limiting**: Smart per-role rate limiting
- **Admin Dashboard**: Full user/key/model/persona/notification management
- **Telegram Notifications**: 9 event types with instant alerts
- **PWA Ready**: Installable progressive web app
- **Dark/Light Theme**: System-aware theme switching
- **Export/Import**: JSON and PDF export
- **Invite Codes**: Premium access via invite codes
- **Onboarding Tour**: 6-step guided tour for new users

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript (strict), Tailwind CSS 3.x |
| UI | Shadcn/UI, Lucide Icons, class-variance-authority |
| State | Zustand 4.x with persist middleware |
| AI | Vercel AI SDK, SSE streaming |
| i18n | next-intl (Arabic + English) |
| Auth | Supabase Auth (email + password) |
| Database | Supabase PostgreSQL with Row Level Security |
| Hosting | Cloudflare Pages (frontend), Cloudflare Workers (proxy) |
| Notifications | Telegram Bot API |
| Rendering | react-markdown, rehype-highlight |
| Export | jsPDF, file-saver |

## 📋 Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x or **pnpm**
- **Supabase** account (free tier works)
- **Cloudflare** account (free tier works)
- **Telegram Bot** (optional, for notifications)

## 🔐 Environment Variables

Create `.env.local` from `.env.example`:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret) | `eyJhbG...` |
| `ENCRYPTION_KEY` | 32-character AES-256 key | `my-32-character-encryption-key!` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | `123456:ABC-DEF...` |
| `TELEGRAM_CHAT_ID` | Telegram chat/group ID | `-1001234567890` |
| `SUPER_ADMIN_EMAIL` | Super admin email (auto-promoted) | `admin@example.com` |
| `SUPER_ADMIN_PASSWORD` | Super admin password | `StrongPass123!` |
| `NEXT_PUBLIC_APP_NAME` | Application display name | `AI Chat Platform` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `https://your-app.pages.dev` |

## 🗄️ Supabase Setup

### 1. Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and keys from Settings > API

### 2. Run SQL Files
Execute these SQL files **in order** in the Supabase SQL Editor:

```sql
-- Step 1: Create all 14 tables
-- Run: supabase/schema.sql

-- Step 2: Enable RLS and create policies
-- Run: supabase/rls-policies.sql

-- Step 3: Create functions and triggers
-- Run: supabase/functions.sql

-- Step 4: Seed initial data (4 built-in personas)
-- Run: supabase/seed.sql
```

### 3. Configure Auth
1. Go to Authentication > Settings
2. **Disable** email confirmation (for development)
3. Set Site URL to your app URL

### 4. Set Super Admin Email
In Supabase SQL Editor, set the app setting:

```sql
ALTER DATABASE postgres SET app.settings.super_admin_email = 'your-admin@email.com';
```

## 🚀 Local Development

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/ai-chat-platform.git
cd ai-chat-platform

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Start development server
npm run dev

# 5. Open in browser
open http://localhost:3000
```

## 👤 First-Time Setup

1. Start the app and go to the registration page
2. **Register with the email set in `SUPER_ADMIN_EMAIL`**
3. This account will automatically be set as Super Admin
4. Go to `/admin` to access the admin dashboard
5. Add global API keys for the platforms you want to support
6. Add models for each API key
7. Your users can now chat using the public API

## ☁️ Cloudflare Deployment

### Pages (Frontend)

```bash
# Build for Cloudflare Pages
npm run pages:build

# Deploy to Cloudflare Pages
npm run pages:deploy
```

Or connect your Git repository to Cloudflare Pages:
1. Go to Cloudflare Dashboard > Pages
2. Create a project from your Git repo
3. Build command: `npx @cloudflare/next-on-pages`
4. Output directory: `.vercel/output/static`
5. Add all environment variables

### Workers (AI Proxy)

```bash
# Deploy the AI proxy worker
cd workers
npx wrangler deploy

# Set secrets
npx wrangler secret put ENCRYPTION_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

## 📁 Project Structure

```
ai-chat-platform/
├── app/                      # Next.js App Router
│   ├── [locale]/             # Locale-based routing (ar/en)
│   │   ├── layout.tsx        # Root layout with fonts and i18n
│   │   ├── page.tsx          # Landing page
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── chat/             # Chat interface
│   │   ├── personas/         # Personas library
│   │   ├── settings/         # User settings
│   │   └── admin/            # Admin dashboard
│   └── api/                  # API routes
│       ├── chat/             # AI chat endpoint
│       ├── models/           # Models endpoint
│       ├── auth/             # Auth callback
│       ├── admin/            # Admin endpoints
│       └── webhook/          # Telegram webhook
├── components/               # React components
│   ├── ui/                   # Shadcn/UI components
│   ├── chat/                 # Chat components
│   ├── sidebar/              # Sidebar components
│   ├── header/               # Header components
│   ├── personas/             # Persona components
│   ├── settings/             # Settings components
│   ├── admin/                # Admin components
│   ├── onboarding/           # Onboarding tour
│   ├── common/               # Common components
│   └── auth/                 # Auth components
├── lib/                      # Libraries
│   ├── supabase-client.ts    # Browser Supabase client
│   ├── supabase-server.ts    # Server Supabase client
│   ├── supabase-admin.ts     # Admin Supabase client
│   ├── ai-providers/         # AI platform adapters
│   ├── encryption.ts         # AES-256 encryption
│   ├── rate-limiter.ts       # Rate limiting logic
│   ├── telegram.ts           # Telegram notifications
│   └── export.ts             # Export utilities
├── hooks/                    # Custom React hooks
├── stores/                   # Zustand state stores
├── types/                    # TypeScript type definitions
├── utils/                    # Utility functions
├── i18n/                     # Translations (ar.json, en.json)
├── workers/                  # Cloudflare Workers
├── supabase/                 # Database schema and migrations
└── public/                   # Static assets
```

## 🔧 Troubleshooting

### Common Issues

**"Missing Supabase environment variables"**
- Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart the dev server after changing env vars

**"RLS policy violation"**
- Run `supabase/rls-policies.sql` in Supabase SQL Editor
- Ensure the user is authenticated before making requests

**"Super admin not created"**
- Run the `ALTER DATABASE` command to set `app.settings.super_admin_email`
- Register with the exact email specified
- Check `supabase/functions.sql` was executed (the `handle_new_user` trigger)

**"API key encryption error"**
- Ensure `ENCRYPTION_KEY` is exactly 32 characters
- Use the same key across all environments

**"Models not loading"**
- Admin must add global API keys first
- Then add models linked to those API keys
- Check the API key is valid and active

**"Telegram notifications not working"**
- Create a bot via @BotFather on Telegram
- Get the chat ID by sending a message to the bot and checking the API
- Ensure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set

**"RTL layout issues"**
- The app uses `dir="rtl"` for Arabic and `dir="ltr"` for English
- Use `start`/`end` instead of `left`/`right` in Tailwind (e.g., `ps-4` not `pl-4`)

### Performance Tips

- Use private API keys for faster responses (no proxy delay)
- Premium users have a hidden 1-minute delay; free users have 3-minute visible delay
- The message limit per chat is 15 — start new conversations for long discussions

## 📄 License

This project is proprietary. All rights reserved.

---

Built with ❤️ using Next.js, Supabase, and Cloudflare
