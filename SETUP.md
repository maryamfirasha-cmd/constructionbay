# ConstructionBay.mv — Setup Guide

## Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- Vercel account (for deployment)

---

## 1. Install dependencies

```bash
npm install
```

---

## 2. Supabase Setup

### 2a. Create a Supabase project
Go to [supabase.com](https://supabase.com) and create a new project.

### 2b. Run the database migration
In your Supabase Dashboard → SQL Editor, paste and run the contents of:
```
supabase/migrations/001_initial_schema.sql
```

### 2c. Create Storage Buckets
In Supabase Dashboard → Storage, create two **public** buckets:
- `listing-images`
- `avatars`

Then add these storage policies (Storage → listing-images → Policies):

**For `listing-images`:**
```sql
-- Allow public read
create policy "Anyone can view listing images"
  on storage.objects for select using (bucket_id = 'listing-images');

-- Allow authenticated upload
create policy "Authenticated users can upload"
  on storage.objects for insert with check (
    bucket_id = 'listing-images' and auth.uid() is not null
  );

-- Allow owner delete
create policy "Users can delete their own images"
  on storage.objects for delete using (
    bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get these values from: Supabase Dashboard → Settings → API

---

## 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 5. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add the environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

Update `NEXT_PUBLIC_SITE_URL` to your production URL.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage
│   ├── listings/           # Browse, detail, create, edit
│   ├── wanted/             # Wanted requests
│   ├── suppliers/          # Supplier directory & profiles
│   ├── dashboard/          # User dashboard & profile settings
│   ├── login/              # Sign in
│   ├── register/           # Sign up
│   └── auth/callback/      # Supabase auth callback
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── listings/           # ListingCard, FilterSidebar, forms
│   └── dashboard/          # Dashboard-specific components
├── lib/
│   ├── supabase/           # Supabase client (browser + server)
│   └── utils.ts            # Helpers (formatting, WhatsApp links)
├── types/                  # TypeScript types + DB schema
└── middleware.ts            # Auth route protection
supabase/
└── migrations/             # SQL schema
```

---

## Features

| Feature | Status |
|---------|--------|
| User Authentication | ✅ Email/password via Supabase |
| Create Listings | ✅ With image upload |
| Browse & Search | ✅ Full text search + filters |
| Listing Types | ✅ Buy/Sell/Rent/Surplus/Service |
| Categories | ✅ Materials/Equipment/Services |
| Wanted Requests | ✅ Post & browse |
| Supplier Profiles | ✅ Directory + public profile |
| WhatsApp Contact | ✅ Deep links on all listings |
| User Dashboard | ✅ Manage listings, profile |
| Mobile-first Design | ✅ Responsive Tailwind CSS |
| Image Gallery | ✅ Multi-image with thumbnails |
| Maldives Locations | ✅ All major atolls |
| SEO | ✅ Dynamic metadata per page |
| View Counts | ✅ Tracked per listing |
| RLS Security | ✅ Supabase row-level security |
