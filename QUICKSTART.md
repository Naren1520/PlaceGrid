# PlaceOS X - Quick Start Guide

Get PlaceOS X running in 5 minutes.

## Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)

## Step 1: Install & Setup (2 minutes)

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
```

## Step 2: Configure MongoDB (2 minutes)

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/placeos-x
JWT_SECRET=your-secret-key-min-32-chars
```

**Get MongoDB:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string from "Connect" → "Drivers"
4. Replace username:password with your credentials

**Generate JWT Secret:**
```bash
openssl rand -base64 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 3: Run (1 minute)

```bash
pnpm dev
```

Visit: **http://localhost:3000**

## Test the App

### Create Accounts

**Student:**
1. Home page → Select "Student"
2. Email: `student@test.com`
3. Password: `Test123`
4. Sign up

**Company:**
1. Home page → Select "Company"
2. Email: `company@test.com`
3. Company: `Acme Corp`
4. Password: `Test123`
5. Sign up

**Coordinator:**
1. Home page → Select "Coordinator"
2. Email: `coordinator@test.com`
3. Password: `Test123`
4. Sign up

### Use the App

**Student:**
- View jobs on Dashboard
- Click "Apply" on jobs
- Check match scores
- Track applications

**Company:**
- Click "Post New Job"
- Fill details and required skills
- View applicants in Applicants tab
- Accept/Reject applications

**Coordinator:**
- View student stats
- See risk levels (HIGH/MEDIUM/LOW)
- Click "Freeze System" to pause placements

## Deploy (Optional)

### Vercel

```bash
# Push to GitHub
git add .
git commit -m "PlaceOS X setup"
git push origin main

# Go to https://vercel.com
# Import repo
# Add env vars (MONGODB_URI, JWT_SECRET)
# Deploy!
```

## File Structure

```
app/api/              # Backend endpoints
app/dashboard/        # Role dashboards
lib/db/              # Database models & connection
lib/auth-utils.ts    # JWT & password functions
.env.example         # Environment template
README.md            # Full documentation
API.md               # API reference
SETUP.md             # Detailed setup guide
```

## API Quick Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/register` | POST | ❌ | Create account |
| `/auth/login` | POST | ❌ | Login |
| `/jobs` | GET | ✅ | List jobs |
| `/jobs` | POST | ✅ | Post job (companies) |
| `/applications` | GET | ✅ | View applications |
| `/applications` | POST | ✅ | Apply to job (students) |
| `/applications` | PATCH | ✅ | Update status (companies) |
| `/students` | GET | ✅ | Get profile |
| `/students` | PATCH | ✅ | Update skills |
| `/coordinator/freeze` | GET | ✅ | Check freeze status |
| `/coordinator/freeze` | POST | ✅ | Toggle freeze (coordinators) |

## Common Tasks

### Register via API

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "name": "Test User",
    "password": "Test123",
    "role": "student"
  }'
```

### Login via API

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "Test123"
  }'
```

### Get Jobs

```bash
TOKEN="your-jwt-token-from-login"

curl http://localhost:3000/api/jobs \
  -H "Authorization: Bearer $TOKEN"
```

### Post Job (Company)

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Developer",
    "description": "Build web apps",
    "requiredSkills": ["JavaScript", "React"]
  }'
```

### Apply to Job (Student)

```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId": "job-id-here"}'
```

## Troubleshooting

### Can't connect to MongoDB
- Check MONGODB_URI in .env.local
- Verify cluster is running (green status)
- Add your IP to MongoDB Atlas whitelist

### JWT errors
- Ensure JWT_SECRET is set
- Restart dev server after changing .env.local
- Include "Bearer " prefix in Authorization header

### Port 3000 in use
```bash
pnpm dev -p 3001
```

### Clear database
- Delete collections in MongoDB Atlas
- Restart application

## Next Steps

1. **Read Full Docs**
   - `README.md` - Complete overview
   - `API.md` - All endpoints explained
   - `SETUP.md` - Detailed setup guide

2. **Explore Features**
   - Post jobs as company
   - Apply as student
   - Freeze system as coordinator
   - Check analytics

3. **Deploy**
   - Push to GitHub
   - Deploy to Vercel

4. **Customize**
   - Add more predefined skills
   - Customize matching algorithm
   - Add email notifications
   - Implement reporting

## Key Concepts

**Match Score:** How well student skills match job requirements (0-100%)
- Calculated: `(matched / required) × 100`
- Example: 3 of 4 skills match = 75%

**Risk Level:** Placement success prediction based on average match score
- HIGH (< 50%): Struggling to find matches
- MEDIUM (50-70%): Moderate probability
- LOW (> 70%): Strong placement likelihood

**Freeze:** System-wide pause on job postings and applications
- Companies can't post new jobs
- Students can't apply
- Coordinator only feature

## Predefined Skills

JavaScript, TypeScript, React, Node.js, Python, Java, C++, MongoDB, SQL, AWS, Docker, Git, REST API, GraphQL, HTML, CSS, Tailwind CSS, Next.js, Express.js

## Support

- **Setup Issues:** See SETUP.md
- **API Questions:** See API.md
- **General Help:** See README.md
- **MongoDB Help:** https://docs.mongodb.com
- **Next.js Help:** https://nextjs.org/docs

---

**That's it! Happy coding! 🚀**
