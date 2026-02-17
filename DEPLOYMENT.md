# Deployment Guide

## 1. Prerequisites

- **GitHub Account**: To host the repository.
- **Vercel Account**: For frontend hosting.
- **Database Provider**: Supabase, Railway, Neon, or generic PostgreSQL.
- **Resend Account**: For email services.

## 2. Database Setup (Example: Supabase/Railway)

1.  Create a new PostgreSQL project.
2.  Copy the **Connection String** (Transaction mode recommended for serverless).
3.  Set this string as `DATABASE_URL` in your environment variables.

## 3. Environment Variables

Configure these in your hosting provider (Vercel Project Settings > Environment Variables):

| Variable         | Description                                     |
|------------------|-------------------------------------------------|
| `DATABASE_URL`   | PostgreSQL connection string                    |
| `JWT_SECRET`     | Strong random string (e.g. `openssl rand -hex 32`)|
| `RESEND_API_KEY` | API Key from Resend.com                         |
| `NODE_ENV`       | Set to `production`                             |

## 4. Deploying to Vercel

1.  Push your code to a GitHub repository.
2.  Go to Vercel Dashboard > **Add New...** > **Project**.
3.  Import your GitHub repository.
4.  Framework Preset: **Next.js**.
5.  Expand **Environment Variables** and add the variables from Step 3.
6.  Click **Deploy**.

## 5. Post-Deployment Steps

1.  **Run Migrations**: 
    Vercel builds check for types but might not run migrations automatically against prod DB.
    Run locally connected to prod DB, or add to build command:
    `npx prisma migrate deploy`
    
2.  **Seed Admin User**:
    To create the initial admin account, run locally pointing to prod DB:
    ```bash
    DATABASE_URL="your-prod-url" node prisma/seed.mjs
    ```

3.  **Verify**:
    - Login to your production URL.
    - Check Dashboard.
