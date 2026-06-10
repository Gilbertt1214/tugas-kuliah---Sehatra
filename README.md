# 🏥 Sehatra - Aplikasi Kesehatan Keluarga

Platform kesehatan digital lengkap untuk monitoring kesehatan, deteksi penyakit AI, dan emergency response.

## ✨ Features

- 🔐 **Authentication** - Login, Register, JWT-based auth
- 📊 **Health Monitoring** - Track vital signs (tekanan darah, gula darah, dll)
- 🏥 **Medical Records** - Simpan rekam medis & booking dokter
- 🤖 **Disease Detection** - AI-powered symptom checker
- 🧠 **Mental Health** - Mood tracking & PHQ-9 assessment
- 🚨 **Emergency** - SOS button & emergency contacts
- 👨‍👩‍👧‍👦 **Family Management** - Track kesehatan keluarga
- 💊 **Healthy Living** - Goals, medications, reminders
- 👮 **Admin Panel** - User management & statistics

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm atau yarn

### Installation

```bash
# Clone repository
git clone https://github.com/username/sehatra-app.git
cd sehatra-app

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env sesuai kebutuhan

# Run development server
npm run dev
```

Buka http://localhost:3000

### Default Accounts

**Admin:**
- Email: `admin@sehatra.com`
- Password: `admin123`

**User:**
- Email: `user@sehatra.com`
- Password: `user123`

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** SQLite (local) / Turso (production)
- **Auth:** JWT (jose)
- **Styling:** CSS Modules
- **Icons:** Lucide React
- **Charts:** Recharts

## 📁 Project Structure

```
sehatra-app/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── admin/
│   │   ├── dashboard/
│   │   ├── detection/
│   │   ├── emergency/
│   │   ├── family/
│   │   ├── healthy-living/
│   │   ├── mental-health/
│   │   ├── monitoring/
│   │   └── records/
│   ├── api/                  # API routes
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── detection/
│   │   ├── emergency/
│   │   ├── family/
│   │   ├── health/
│   │   ├── healthy-living/
│   │   └── mental-health/
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── components/               # Reusable components
├── lib/
│   ├── db.ts                # Database configuration
│   ├── auth.ts              # Authentication helpers
│   └── ai-engine.ts         # AI detection logic
├── middleware.ts            # Auth middleware
└── public/                  # Static assets
```

## 🗄️ Database

### Development (Local SQLite)

```env
TURSO_DATABASE_URL=file:database.sqlite
```

### Production (Turso Cloud)

```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
JWT_SECRET=your-secret
```

### Database Schema

14 tables:
- `users` - User accounts
- `health_profiles` - User health info
- `health_metrics` - Vital signs tracking
- `medical_records` - Medical history
- `doctor_bookings` - Appointment bookings
- `emergency_contacts` - Emergency contacts
- `emergency_alerts` - SOS alerts
- `family_members` - Family health tracking
- `disease_detections` - AI detection history
- `mental_health_logs` - Mood tracking
- `mental_health_assessments` - PHQ-9 results
- `health_goals` - Fitness goals
- `medications` - Medication reminders
- `health_reminders` - Health reminders

## 🚀 Deployment

### Netlify + Turso (Recommended)

Lihat dokumentasi lengkap:
- **Quick Guide:** `QUICK_DEPLOY_GUIDE.md`
- **Full Guide:** `DEPLOY_NETLIFY.md`
- **Checklist:** `CHECKLIST_DEPLOY.md`

**Quick Deploy:**
```bash
# 1. Setup Turso
turso auth login
turso db tokens create auth-gilbertt1214

# 2. Push to GitHub
git push origin main

# 3. Deploy to Netlify
# - Import from GitHub
# - Set environment variables
# - Deploy!
```

**Environment Variables (Netlify):**
```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
JWT_SECRET=your-production-secret
```

## 🧪 Development

### Scripts

```bash
# Development
npm run dev          # Start dev server
npm run dev:clean    # Clean cache & start

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
bash scripts/reset-turso.sh  # Reset Turso database
```

### Troubleshooting

Lihat `TROUBLESHOOTING.md` untuk common issues:
- Module not found errors
- Database connection issues
- Build errors
- Performance issues

## 📚 Documentation

### Setup & Deployment
- `QUICK_START.md` - Getting started
- `DEPLOY_NETLIFY.md` - Deployment guide
- `QUICK_DEPLOY_GUIDE.md` - Quick deploy
- `CHECKLIST_DEPLOY.md` - Deploy checklist
- `NETLIFY_FAQ.md` - Deployment FAQ

### Database
- `README_TURSO.md` - Turso integration
- `TURSO_SETUP.md` - Turso setup
- `GET_TOKEN.md` - Get Turso token
- `MIGRATION_GUIDE.md` - Database migration

### Development
- `CONTOH_MIGRASI.md` - Code examples
- `TROUBLESHOOTING.md` - Common issues
- `STATUS_UPDATE.md` - Project status

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
# Database (choose one)
TURSO_DATABASE_URL=file:database.sqlite           # Local
# TURSO_DATABASE_URL=libsql://your-db.turso.io    # Production
# TURSO_AUTH_TOKEN=your-token                     # Production

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production

# Optional: Embedded Replica (Hybrid Mode)
# TURSO_SYNC_URL=libsql://your-db.turso.io
```

### TypeScript Configuration

Path aliases configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team
- Turso team
- All contributors

## 📞 Support

- **Documentation:** Check docs in repository
- **Issues:** Open GitHub issue
- **Questions:** Check `NETLIFY_FAQ.md` & `TROUBLESHOOTING.md`

---

**Built with ❤️ for better healthcare access**

🌐 **Live Demo:** https://your-site.netlify.app (after deployment)
