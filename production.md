# Vercel Deployment Guide

This project is fully ready for production deployment on Vercel. 

## 1. Push to GitHub
If you haven't already, push your code to your GitHub repository:
```bash
git add .
git commit -m "Migrate to Next.js App Router for Vercel"
git push
```

## 2. Connect to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository (`vc-dashboard-96`).
4. Vercel will automatically detect that this is a **Next.js** project.

## 3. Configure Environment Variables
Before clicking "Deploy", open the **Environment Variables** panel in Vercel and add your credentials exactly as they appear in your `.env`:

| Key | Value (example) |
| --- | --- |
| `NEXT_PUBLIC_GEMINI_API_KEY` | `AIzaSy...` (from Google AI Studio) |
| `DATA_SOURCE` | `supabase` (or `csv`) |
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJ...` (from Supabase Settings) |

## 4. Deploy
1. Click **Deploy**.
2. Vercel will install the Next.js dependencies, build the application, and assign a live URL (e.g., `https://vc-dashboard-96.vercel.app`).
3. Your dashboard is now live in production! The API routes (`/api/sales`) will run seamlessly on Vercel Edge/Serverless functions.
