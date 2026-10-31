# 🌌 PixVerse — Modern Cloud Photo Gallery

A fast, elegant Google Photos-inspired gallery built with React 19, Vite, and **Supabase Cloud (Postgres Database, RLS, Storage)**, engineered for zero-friction deployment to **Netlify**.

---

## ⚡ Live Supabase Project Details

A brand new Supabase cloud project has been created, initialized, and linked to this codebase:

| Resource | Details |
|---|---|
| **Project Name** | `pixverse-gallery` |
| **Project Ref / ID** | `ioojwbryftvwpvlcnskq` |
| **Region** | `ap-south-1` (Mumbai / South Asia) |
| **Dashboard URL** | [supabase.com/dashboard/project/ioojwbryftvwpvlcnskq](https://supabase.com/dashboard/project/ioojwbryftvwpvlcnskq) |
| **API URL** | `https://ioojwbryftvwpvlcnskq.supabase.co` |
| **Database Host** | `db.ioojwbryftvwpvlcnskq.supabase.co` |
| **PostgreSQL Engine** | PostgreSQL 17 |
| **Schema Migration** | `supabase/migrations/20261029185029_init_pixverse_schema.sql` (Pushed & Active) |

---

## 🗄️ Database Tables Live in Supabase

1. **`public.profiles`**: User profiles with usernames, emails, roles, custom avatar colors, and bios.
2. **`public.categories`**: Photo categories with safe deletion and automatic reassignment to *"My Uploads"*.
3. **`public.photos`**: Full photo records (URL, title, category, favorite state, trash state, ratings, timestamps, uploader info).
4. **`public.features`**: Community feature requests and voting.
5. **Row Level Security (RLS)**: Public read/write policies configured for fast seamless gallery access.

---

## 🚀 Instant Deployment to Netlify

### Option A: Drag & Drop (Zero Setup)
1. Run `npm run build` in your terminal.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the `dist/` folder.
4. Your site is live immediately connecting to your Supabase Postgres database!

### Option B: Connect with Git (Continuous Deployment)
1. Push this repository to GitHub/GitLab.
2. In Netlify, click **"Add new site"** → **"Import an existing project"**.
3. Under Environment Variables in Netlify, set:
   - `VITE_SUPABASE_URL=https://ioojwbryftvwpvlcnskq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlvb2p3YnJ5ZnR2d3B2bGNuc2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTE4ODEsImV4cCI6MjEwODg2Nzg4MX0.jqogcJ_-O8F4r1Vl3YXRejnF9PLba18Q4TlPiEPUslk`
4. Click **Deploy Site**.

---

## ⚡ Instant Demo Credentials
Visitors and reviewers can sign in immediately using pre-configured test accounts or by clicking the 1-Click Demo buttons inside the sign-in modal:

- **General Member**:
  - **Username**: `demo`
  - **Password**: `password123`
- **Pro Photographer**:
  - **Username**: `alex`
  - **Password**: `alex2026`
