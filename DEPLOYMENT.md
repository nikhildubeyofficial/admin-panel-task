# Deployment Guide

This Admin Panel is built with **Next.js 14** and **Prisma** (PostgreSQL). It is designed to be easily deployed on Vercel.

## 1. Database Hosting

You need a PostgreSQL database. Good options:
- **Neon** (Serverless Postgres) - Recommended for Vercel
- **Supabase**
- **Railway**
- **Render**

### Steps (Example using Neon/Supabase):
1. Create a new project/database.
2. Get the **Database Connection String** (Transaction Mode is recommended for serverless).
3. It should look like: `postgres://user:password@host:port/database`

## 2. Environment Variables

Prepare your secrets. In your local `.env`, you should have:

```env
DATABASE_URL="postgres://..."
JWT_SECRET="your-strong-secret-key"
RESEND_API_KEY="re_123..."
NEXT_PUBLIC_GOOGLE_CLIENT_ID="...optional..."
```

## 3. Deploy to Vercel

1. **Push to GitHub**: Ensure your project is in a GitHub repository.
2. **Login to Vercel**: Go to [vercel.com](https://vercel.com) and log in.
3. **Import Project**: Click "Add New..." > "Project" and select your repository.
4. **Environment Variables**:
   - In the "Configure Project" screen, expand "Environment Variables".
   - Add all the variables from your `.env` file (DATABASE_URL, JWT_SECRET, RESEND_API_KEY).
5. **Build Settings**: Vercel automatically detects Next.js. The default settings are usually correct:
   - Build Command: `next build`
   - Install Command: `npm install`
6. **Deploy**: Click "Deploy".

## 4. Post-Deployment Setup

After deployment is successful:

1. **Run Migrations**: Vercel might not run migrations automatically on the production DB unless you set it up in the build command.
   - **Option A (Recommended)**: Connect to your production DB locally and run `npx prisma migrate deploy`.
     - Update your local `.env` temporally to point to the PROD `DATABASE_URL`.
     - Run `npx prisma migrate deploy`.
     - Revert your local `.env` to development DB.
   - **Option B**: Add a build script in `package.json`: `"vercel-build": "prisma migrate deploy && next build"` and set the Build Command in Vercel to `npm run vercel-build`.

2. **Seed Admin User**:
   - You need an initial admin to log in.
   - Run the seed script locally pointing to the PROD DB: `node --loader tsx prisma/seed.mjs`.
   - OR, use the Vercel CLI: `vercel env pull` then run the seed script.
   
## 5. Domain & SSL

Vercel provides a free `.vercel.app` domain with SSL. You can add your custom domain in the Vercel project settings under "Domains".

## 6. Monitoring

- **Logs**: Check Vercel "Logs" tab for runtime errors.
- **Analytics**: Vercel Analytics (optional) can be enabled for performance tracking.
