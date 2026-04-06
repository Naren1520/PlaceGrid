# PlaceOS X - Complete Setup Guide

This guide will walk you through setting up PlaceOS X with MongoDB backend from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Setup](#mongodb-setup)
3. [Project Setup](#project-setup)
4. [Environment Variables](#environment-variables)
5. [Testing the API](#testing-the-api)
6. [Deployment](#deployment)

## Prerequisites

### Required Software
- **Node.js** 18.0 or higher
  - Download: https://nodejs.org/
  - Verify: `node --version`
  
- **npm/pnpm** (comes with Node.js)
  - npm: Usually included with Node.js
  - pnpm (recommended): `npm install -g pnpm`
  - Verify: `pnpm --version`

- **Git**
  - Download: https://git-scm.com/
  - Verify: `git --version`

### Recommended Tools
- **MongoDB Compass** - Visual MongoDB client (optional)
  - Download: https://www.mongodb.com/try/download/compass

- **Postman** - API testing tool (optional)
  - Download: https://www.postman.com/downloads/

## MongoDB Setup

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Sign Up Free"**
3. Create account with email/password or Google
4. Verify email address

### Step 2: Create a Cluster

1. After login, click **"Create"** (or **"+ New Project"**)
2. Name project: `PlaceOS X`
3. Click **"Create Project"**
4. Click **"Create a Cluster"** (or **"+ Create"**)
5. Select **"M0 (Free)"** tier
6. Choose your region (closest to you recommended)
7. Click **"Create Cluster"** - this takes 2-3 minutes

### Step 3: Create Database User

1. In left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Username: `admin` (or your choice)
4. Password: Generate secure password or create own
5. **Save this password!** You'll need it
6. Click **"Add User"**

### Step 4: Whitelist IP Address

1. In left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or add specific IP: `<your-ip>/32`
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Go back to **"Databases"** section
2. Click **"Connect"** on your cluster
3. Select **"Drivers"**
4. Copy the connection string
5. Replace `<username>` and `<password>` with your credentials

**Example:**
```
mongodb+srv://admin:MySecurePassword123@cluster0.abc123.mongodb.net/placeos-x?retryWrites=true&w=majority
```

## Project Setup

### Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd placeos-x
```

### Step 2: Install Dependencies

Using pnpm (recommended):
```bash
pnpm install
```

Or using npm:
```bash
npm install
```

Expected output: Installs ~200+ packages, takes 2-5 minutes

### Step 3: Create Environment File

```bash
# Copy example file
cp .env.example .env.local
```

This creates `.env.local` in your project root.

### Step 4: Edit Environment Variables

Open `.env.local` in your editor (VS Code, etc):

```env
# Your MongoDB connection string from Step 5 above
MONGODB_URI=mongodb+srv://admin:MySecurePassword123@cluster0.abc123.mongodb.net/placeos-x?retryWrites=true&w=majority

# Generate a strong random string for JWT
JWT_SECRET=your-generated-secret-here-min-32-chars

# Optional
NEXT_PUBLIC_APP_NAME=PlaceOS X
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Environment Variables

### Generating JWT_SECRET

**Option 1: Using OpenSSL (Mac/Linux)**
```bash
openssl rand -base64 32
```

Output example:
```
aBc1D2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3
```

**Option 2: Using Node.js (Windows)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Online Generator**
Visit: https://generateme.org/crypto/SHA256

Copy the output and paste into `.env.local`:
```env
JWT_SECRET=aBc1D2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3
```

### Complete .env.local Example

```env
# Required: MongoDB Connection String
# Format: mongodb+srv://username:password@cluster.mongodb.net/database-name
MONGODB_URI=mongodb+srv://admin:SecurePassword@cluster0.abc123.mongodb.net/placeos-x?retryWrites=true&w=majority

# Required: JWT Secret (min 32 characters recommended)
JWT_SECRET=aBc1D2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3

# Optional: Application Info
NEXT_PUBLIC_APP_NAME=PlaceOS X
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Running the Application

### Start Development Server

```bash
pnpm dev
```

Or with npm:
```bash
npm run dev
```

Expected output:
```
  ▲ Next.js 16.2.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

Visit: **http://localhost:3000**

## Testing the API

### Test 1: Register New Student

Using curl:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "name": "John Doe",
    "password": "SecurePass123",
    "role": "student"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

### Test 2: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123"
  }'
```

### Test 3: Get User Data (Authenticated)

Replace `YOUR_TOKEN` with token from login response:

```bash
curl http://localhost:3000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Open Postman
2. Create new request
3. Set method to POST
4. URL: `http://localhost:3000/api/auth/register`
5. Headers: `Content-Type: application/json`
6. Body (raw JSON):
```json
{
  "email": "student@example.com",
  "name": "John Doe",
  "password": "SecurePass123",
  "role": "student"
}
```
7. Click Send

## Common Issues & Solutions

### MongoDB Connection Error
```
MongoServerError: connect ECONNREFUSED
```

**Solutions:**
- ✓ Check MONGODB_URI in .env.local
- ✓ Verify cluster is running (green status in Atlas)
- ✓ Add your IP to Network Access whitelist
- ✓ Check username/password are correct

### JWT Secret Not Set
```
Error: JWT_SECRET is not defined
```

**Solution:**
- ✓ Ensure JWT_SECRET is in .env.local
- ✓ Restart dev server after adding variable

### Port 3000 Already in Use
```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Use different port
pnpm dev -p 3001
# Then visit http://localhost:3001
```

### Module Not Found
```
Error: Cannot find module 'mongoose'
```

**Solution:**
```bash
pnpm install
# or
npm install
```

## Development Workflow

1. **Start Server**
   ```bash
   pnpm dev
   ```

2. **Create User Accounts**
   - Student: http://localhost:3000/
   - Company: http://localhost:3000/
   - Coordinator: http://localhost:3000/

3. **Test Features**
   - Student: Browse jobs, apply
   - Company: Post jobs, review applications
   - Coordinator: View analytics, manage freeze

4. **API Testing**
   - Use Postman or curl
   - Check responses in browser console
   - Monitor MongoDB in Atlas

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial PlaceOS X setup"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import GitHub repository
   - Click "Import"

3. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add `MONGODB_URI`
   - Add `JWT_SECRET`
   - Click Deploy

4. **Verify Deployment**
   - Visit your Vercel URL
   - Test login and API endpoints

### Deploy to Other Platforms

**Heroku:**
1. Install Heroku CLI
2. `heroku login`
3. `heroku create app-name`
4. `heroku config:set MONGODB_URI="..."`
5. `heroku config:set JWT_SECRET="..."`
6. `git push heroku main`

**AWS Amplify, Netlify, or others:** Similar process with environment variables

## Next Steps

After setup:

1. Create test accounts for each role
2. Test core features (apply, post jobs, freeze)
3. Review API documentation in README.md
4. Check database in MongoDB Atlas
5. Deploy to production when ready

## Support

- **MongoDB Help:** https://docs.mongodb.com
- **Next.js Help:** https://nextjs.org/docs
- **Node.js Help:** https://nodejs.org/docs
- **Git Help:** https://git-scm.com/doc

---

**Setup complete! Your PlaceOS X instance is ready to use.**
