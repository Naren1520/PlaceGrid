# PlaceOS X - Autonomous Placement Intelligence Platform

A complete, full-stack AI-powered placement management system that connects students with job opportunities using skill matching, risk prediction, and real-time analytics.

## Features

- **AI-Powered Skill Matching**: Automatically matches student skills with job requirements using intelligent algorithms
- **Risk Prediction**: Predicts placement success based on average match scores (HIGH/MEDIUM/LOW)
- **Multi-Role System**: Separate dashboards for Students, Companies, and Coordinators
- **Global Freeze Control**: Coordinators can freeze the entire placement process
- **Real-Time Analytics**: Monitor placement metrics and student performance
- **Application Tracking**: Track all applications and their status in real-time
- **MongoDB Backend**: Persistent data storage with secure JWT authentication
- **Responsive Design**: Premium SaaS interface with warm color palette

## Tech Stack

### Frontend
- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS v4 with shadcn/ui components
- Zod for form validation

### Backend
- Node.js with Next.js API routes
- MongoDB with Mongoose ODM
- JWT authentication with bcryptjs
- Full RESTful API

## Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB Atlas account (or local MongoDB)
- Git

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd placeos-x

# Install dependencies
pnpm install
# or
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# MongoDB Configuration (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/placeos-x

# JWT Configuration (Required)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional
NEXT_PUBLIC_APP_NAME=PlaceOS X
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. MongoDB Setup

#### Option A: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project and cluster
4. In "Database" section, click "Connect"
5. Select "Drivers" and copy the connection string
6. Update in `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/placeos-x
   ```

#### Option B: Local MongoDB

```bash
# Install MongoDB locally, then use:
MONGODB_URI=mongodb://localhost:27017/placeos-x
```

### 4. Generate JWT Secret

```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (using Node):
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Paste the output in your `.env.local`:
```env
JWT_SECRET=<your-generated-string>
```

### 5. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage Guide

### Creating Test Accounts

All authentication is managed via MongoDB. Sign up on the home page and select your role.

#### Student Account
1. Click "Student" role
2. Enter email and password
3. Select skills from predefined list
4. Browse jobs and apply

#### Company Account
1. Click "Company" role
2. Enter email, company name, and password
3. Post job openings with required skills
4. Review applicants and their match scores
5. Accept/reject applications

#### Coordinator Account
1. Click "Coordinator" role
2. Enter email and password
3. View placement analytics
4. Manage student risk levels
5. Toggle system freeze status

## API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Jobs
```
GET  /api/jobs              # Get all jobs
POST /api/jobs              # Create job (companies only)
```

### Applications
```
GET  /api/applications      # Get applications (role-based)
POST /api/applications      # Apply to job (students only)
PATCH /api/applications     # Update status (companies only)
```

### Students
```
GET  /api/students          # Get student data
PATCH /api/students         # Update skills
```

### Coordinator
```
GET  /api/coordinator/freeze    # Get freeze status
POST /api/coordinator/freeze    # Toggle freeze
```

## API Authentication

All endpoints (except auth) require Bearer token:

```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
  http://localhost:3000/api/students
```

Tokens are valid for 7 days and returned after login.

## Algorithms & Scoring

### Match Score Calculation
```javascript
matchScore = (matchedSkills / requiredSkills) × 100

Example:
- Student has: [JavaScript, React, Node.js]
- Job requires: [JavaScript, React, Python]
- Matched: 2 out of 3
- Score: (2/3) × 100 = 66%
```

### Risk Level Prediction
Based on average match score across all applications:

- **HIGH RISK** (<50%): Students struggling to find matches
- **MEDIUM RISK** (50-70%): Moderate placement probability
- **LOW RISK** (>70%): Strong placement likelihood

### Freeze System
When active:
- No new jobs can be posted
- No new applications accepted
- Existing applications can still be reviewed
- Only coordinators can toggle

## Database Schema

### User Model
```javascript
{
  email: String,              // Unique
  name: String,
  password: String,           // Hashed with bcryptjs
  role: 'student'|'company'|'coordinator',
  companyName: String,        // For company role
  companyId: String,          // For company isolation
  skills: [String],           // For students
  createdAt: Date,
  updatedAt: Date
}
```

### Job Model
```javascript
{
  title: String,
  description: String,
  company: ObjectId,          // Reference to User
  companyName: String,
  requiredSkills: [String],
  applications: [ObjectId],   // References to Applications
  isOpen: Boolean,
  deadline: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Application Model
```javascript
{
  student: ObjectId,
  studentName: String,
  studentEmail: String,
  job: ObjectId,
  company: ObjectId,
  status: 'pending'|'accepted'|'rejected',
  matchScore: Number,         // 0-100
  studentSkills: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## Project Structure

```
placeos-x/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   └── login/route.ts
│   │   ├── jobs/route.ts
│   │   ├── applications/route.ts
│   │   ├── students/route.ts
│   │   └── coordinator/freeze/route.ts
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── student/page.tsx
│   │   ├── company/page.tsx
│   │   └── coordinator/page.tsx
│   ├── page.tsx             # Home/Login
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Styles
├── lib/
│   ├── db/
│   │   ├── models.ts        # Mongoose schemas
│   │   └── connection.ts    # MongoDB connection
│   ├── auth-context.tsx     # React context (fallback)
│   ├── auth-utils.ts        # JWT & password utilities
│   └── data-store.ts        # localStorage utilities
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── layout/
├── public/                  # Static files
├── .env.example             # Environment template
└── package.json
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your generated JWT secret
5. Click Deploy!

### Environment Variables for Deployment

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/placeos-x
JWT_SECRET=your-super-secret-key
```

## Troubleshooting

### MongoDB Connection Error
- ✓ Check `MONGODB_URI` format
- ✓ Add your IP to MongoDB Atlas IP Whitelist
- ✓ Verify username/password are correct
- ✓ Ensure database name exists in connection string

### JWT Authentication Issues
- ✓ Verify `JWT_SECRET` is set in `.env.local`
- ✓ Check Authorization header format: `Bearer <token>`
- ✓ Tokens expire after 7 days
- ✓ Clear browser cache if token persists

### Port Already in Use
```bash
pnpm dev -p 3001
```

### Reset Database
Delete all collections in MongoDB Atlas and restart the app.

## Development Guide

### Add New API Endpoint

1. Create file in `app/api/`
2. Import utilities:
   ```typescript
   import dbConnect from '@/lib/db/connection';
   import { verifyToken, getTokenFromHeaders } from '@/lib/auth-utils';
   import { User, Job } from '@/lib/db/models';
   ```
3. Connect to DB and verify auth:
   ```typescript
   await dbConnect();
   const token = getTokenFromHeaders(req.headers);
   const decoded = verifyToken(token);
   ```

### Add New Data Model

1. Define schema in `lib/db/models.ts`
2. Create/reuse model at file end
3. Use in API routes with Mongoose queries

### Styling Changes

- Edit colors in `app/globals.css` (CSS variables)
- Use Tailwind CSS classes
- Reference shadcn/ui for components

## Environment Variables Reference

| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `MONGODB_URI` | Yes | String | MongoDB connection string |
| `JWT_SECRET` | Yes | String | Secret for JWT signing |
| `NEXT_PUBLIC_APP_NAME` | No | String | Public app name |
| `NEXT_PUBLIC_APP_VERSION` | No | String | Public app version |

## Security Best Practices

- ✓ Passwords hashed with bcryptjs (10 salt rounds)
- ✓ JWT tokens expire after 7 days
- ✓ Company data isolated by `companyId`
- ✓ Role-based access control on all endpoints
- ✓ Environment variables for sensitive data

## Performance

- MongoDB indexes on email and userId
- JWT validation on every protected endpoint
- Role-based filtering reduces data transfer
- Mongoose caching for connection reuse

## Support & Troubleshooting

**Connection Issues?**
- Verify `.env.local` exists with correct values
- Check MongoDB Atlas IP whitelist
- Test connection in MongoDB Compass

**API Errors?**
- Check Authorization header format
- Verify token hasn't expired (7 days)
- Check request body JSON format

**Need Help?**
- Review MongoDB docs: https://docs.mongodb.com
- Check Next.js API docs: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Mongoose docs: https://mongoosejs.com

---

**Built with Next.js 16, React 19, MongoDB, and Tailwind CSS**
