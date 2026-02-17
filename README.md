# Student Referral & Rewards Program - Admin Panel

A production-ready, full-stack admin panel for managing a student referral and rewards program. Built with Next.js 14, Prisma, PostgreSQL, and modern UI components.

## 🚀 Features

### Core Functionality
- **Admin Authentication**: Secure JWT-based login with HTTP-only cookies and Google Sign-In support
- **Task Validation**: Review and approve/reject student task submissions
- **Certificate Generation**: Automatic PDF certificate creation and email delivery
- **Payout Management**: Safe, transactional payout processing with state tracking
- **Referral Tracking**: Monitor student referral networks
- **Analytics Dashboard**: Real-time metrics and statistics

### Security & Reliability
- ✅ Transactional database operations (prevent double payouts)
- ✅ Input validation with Zod
- ✅ Audit logging for all critical actions
- ✅ Protected routes with middleware
- ✅ Password hashing with bcrypt
- ✅ Error handling and recovery

## 📋 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 19
- Tailwind CSS
- shadcn/ui components
- React Query (TanStack Query)
- Lucide Icons

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt password hashing

**Additional Services:**
- pdf-lib (PDF generation)
- Resend (Email delivery)
- date-fns (Date formatting)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### 1. Clone & Install

```bash
cd "Student Program Admin Panel"
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the following variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A strong random secret (use `openssl rand -base64 32`)
- `RESEND_API_KEY`: Your Resend API key (optional for development)
- `GOOGLE_CLIENT_ID` & `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID (optional, for Google Sign-In)

**To enable Google Sign-In:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000` to authorized JavaScript origins
6. Copy the Client ID to both `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed admin user
node --loader tsx prisma/seed.mjs
```

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

⚠️ **Change these credentials immediately in production!**

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to `/login`.

## 📁 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login routes
│   │   ├── (dashboard)/      # Protected admin pages
│   │   │   ├── page.jsx      # Dashboard overview
│   │   │   ├── tasks/        # Task verification
│   │   │   ├── payouts/      # Payout management
│   │   │   ├── users/        # User list
│   │   │   └── referrals/    # Referral tracking
│   │   └── api/              # API endpoints
│   ├── components/
│   │   └── ui/               # shadcn components
│   ├── lib/
│   │   ├── db.js             # Prisma client
│   │   ├── jwt.js            # JWT utilities
│   │   ├── password.js       # Password hashing
│   │   └── validations/      # Zod schemas
│   ├── services/
│   │   └── certificate.js    # Certificate generation
│   └── middleware.js         # Route protection
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.mjs              # Seed script
└── public/                   # Static assets
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### Task Management
- `GET /api/tasks/submissions` - Get pending submissions
- `PATCH /api/tasks/submissions/[id]` - Approve/reject submission

### Payouts
- `GET /api/payouts/requests` - Get redemption requests
- `POST /api/payouts/process` - Process payout (approve/reject/complete)

### Analytics
- `GET /api/analytics` - Dashboard statistics
- `GET /api/users` - User list
- `GET /api/referrals` - Referral data

## 🎯 Key Workflows

### Task Approval Flow
1. Student submits task with proof
2. Admin reviews in `/dashboard/tasks`
3. On approval:
   - Points credited to user
   - Certificate generated (PDF)
   - Certificate emailed to user
   - Audit log created

### Payout Flow
1. User requests redemption
2. Admin reviews in `/dashboard/payouts`
3. Admin approves → Creates payout record
4. Admin marks as paid with transaction ID
5. Status updated to PAID
6. Audit log created

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Hosting

Use any PostgreSQL provider:
- [Railway](https://railway.app)
- [Supabase](https://supabase.com)
- [Neon](https://neon.tech)
- [Render](https://render.com)

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="strong-random-secret"
RESEND_API_KEY="re_..."
NODE_ENV="production"
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with admin credentials
- [ ] View dashboard metrics
- [ ] Approve a task submission
- [ ] Verify certificate generation
- [ ] Process a payout request
- [ ] Check audit logs in database

### Database Verification

```bash
# Connect to database
npx prisma studio

# Check tables: User, Admin, TaskSubmission, Payout, AuditLog
```

## 📊 Database Schema

Key models:
- **Admin**: Admin users with roles
- **User**: Students with points and referral codes
- **TaskSubmission**: Task submissions with status
- **Certificate**: Generated certificates
- **RedeemRequest**: Point redemption requests
- **Payout**: Payment records with transaction IDs
- **AuditLog**: System action logs

## 🔧 Troubleshooting

### Prisma Client Issues
```bash
npx prisma generate
```

### Database Connection Errors
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check firewall/network settings

### Email Not Sending
- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for errors
- In development, emails are logged to console

## 📝 License

MIT

## 🤝 Support

For issues or questions, please check the documentation or create an issue in the repository.

---

**Built with ❤️ using Next.js and modern web technologies**
