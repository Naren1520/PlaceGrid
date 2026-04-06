# PlaceOS X - Commands Reference

All commands needed to set up, run, and deploy PlaceOS X.

## Installation

```bash
# Install dependencies
pnpm install

# Or with npm
npm install
```

## Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables (use your editor)
# Required:
# - MONGODB_URI (from MongoDB Atlas)
# - JWT_SECRET (run: openssl rand -base64 32)
```

## Development

```bash
# Start development server
pnpm dev

# Run on specific port
pnpm dev -p 3001

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Testing with cURL

### Register User

```bash
# Student
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "name": "John Student",
    "password": "Password123",
    "role": "student"
  }'

# Company
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "company@test.com",
    "name": "Company Admin",
    "password": "Password123",
    "role": "company",
    "companyName": "Acme Corp"
  }'

# Coordinator
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coordinator@test.com",
    "name": "Jane Coordinator",
    "password": "Password123",
    "role": "coordinator"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "Password123"
  }'

# Copy token from response
```

### Save Token for Testing

```bash
# Save token as environment variable (Linux/Mac)
TOKEN="eyJhbGciOiJIUzI1NiIs..."
export AUTH_HEADER="Authorization: Bearer $TOKEN"

# Or for Windows PowerShell
$TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### Get Jobs

```bash
curl http://localhost:3000/api/jobs \
  -H "Authorization: Bearer $TOKEN"
```

### Post Job (as Company)

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Developer",
    "description": "Build amazing web applications with modern tech stack",
    "requiredSkills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "deadline": "2026-12-31T23:59:59Z"
  }'
```

### Apply to Job (as Student)

```bash
# First get a job ID from the jobs list
JOB_ID="507f1f77bcf86cd799439012"

curl -X POST http://localhost:3000/api/applications \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"jobId\": \"$JOB_ID\"
  }"
```

### View Applications

```bash
# As student - see own applications
curl http://localhost:3000/api/applications \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# As company - see applications to your jobs
curl http://localhost:3000/api/applications \
  -H "Authorization: Bearer $COMPANY_TOKEN"

# As coordinator - see all applications
curl http://localhost:3000/api/applications \
  -H "Authorization: Bearer $COORDINATOR_TOKEN"
```

### Update Application Status (as Company)

```bash
# Get application ID from applications list
APP_ID="507f1f77bcf86cd799439013"

# Accept
curl -X PATCH http://localhost:3000/api/applications \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"applicationId\": \"$APP_ID\",
    \"status\": \"accepted\"
  }"

# Reject
curl -X PATCH http://localhost:3000/api/applications \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"applicationId\": \"$APP_ID\",
    \"status\": \"rejected\"
  }"
```

### Get Student Profile

```bash
curl http://localhost:3000/api/students \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### Update Student Skills

```bash
curl -X PATCH http://localhost:3000/api/students \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB"],
    "resume": "https://linkedin.com/in/johndoe"
  }'
```

### Get All Students (as Coordinator)

```bash
curl http://localhost:3000/api/students \
  -H "Authorization: Bearer $COORDINATOR_TOKEN"
```

### Check Freeze Status

```bash
curl http://localhost:3000/api/coordinator/freeze
```

### Freeze System (as Coordinator)

```bash
curl -X POST http://localhost:3000/api/coordinator/freeze \
  -H "Authorization: Bearer $COORDINATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "freeze",
    "reason": "Annual placement cycle closed"
  }'
```

### Unfreeze System (as Coordinator)

```bash
curl -X POST http://localhost:3000/api/coordinator/freeze \
  -H "Authorization: Bearer $COORDINATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "unfreeze"
  }'
```

## Testing with Postman

### Create Request

1. Open Postman
2. Click "+" to create new request
3. Select method (POST, GET, PATCH)
4. Enter URL (http://localhost:3000/api/...)
5. Add headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer <token>`
6. Add body (if needed, raw JSON)
7. Click "Send"

### Import Collection

Postman can import API documentation:
1. File → Import
2. Paste API.md or create from API.md

## MongoDB Commands

### Access MongoDB Atlas

```bash
# Install MongoDB Compass (GUI)
# Download from: https://www.mongodb.com/try/download/compass

# Or use command line
mongosh "mongodb+srv://username:password@cluster.mongodb.net/placeos-x"
```

### Query Database

```javascript
// In MongoDB Shell / Compass

// View all users
db.users.find()

// View all jobs
db.jobs.find()

// View all applications
db.applications.find()

// Find specific user
db.users.findOne({ email: "student@test.com" })

// Count documents
db.users.countDocuments()

// Delete all data (careful!)
db.users.deleteMany({})
db.jobs.deleteMany({})
db.applications.deleteMany({})
```

## Deployment Commands

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET

# Deploy with environment variables
vercel --prod
```

### Heroku

```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create app-name

# Set environment variables
heroku config:set MONGODB_URI="..."
heroku config:set JWT_SECRET="..."

# Deploy
git push heroku main

# View logs
heroku logs --tail

# View app
heroku open
```

### AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure
amplify configure

# Initialize
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

## Dependency Management

```bash
# Check outdated packages
pnpm outdated

# Update packages
pnpm update

# Add new package
pnpm add package-name

# Remove package
pnpm remove package-name

# Install specific version
pnpm add package-name@1.2.3
```

## Database Backup

### MongoDB Atlas Backup

```bash
# Automated backups are enabled by default in Atlas

# Manual export
mongodump --uri "mongodb+srv://username:password@cluster.mongodb.net/placeos-x"

# Manual import
mongorestore dump/
```

## Generate JWT Secret

```bash
# Option 1: OpenSSL (Linux/Mac)
openssl rand -base64 32

# Option 2: Node.js (All platforms)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online
# Visit: https://generateme.org/crypto/SHA256
```

## Environment Variables

```bash
# View environment in development
echo $MONGODB_URI
echo $JWT_SECRET

# Set environment variables (Linux/Mac)
export MONGODB_URI="mongodb+srv://..."
export JWT_SECRET="..."

# Set environment variables (Windows PowerShell)
$env:MONGODB_URI="mongodb+srv://..."
$env:JWT_SECRET="..."

# View all environment variables
env
# or
Get-ChildItem Env:
```

## Clean Commands

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear cache
pnpm store prune

# Clean build artifacts
rm -rf .next

# Rebuild
pnpm build
```

## Debugging

```bash
# Run with debug logging
DEBUG=* pnpm dev

# Check Node version
node --version

# Check pnpm version
pnpm --version

# Check git status
git status

# View commit history
git log

# Check disk space
df -h

# Check memory usage
free -h
# or
top
```

## Production Checklist

```bash
# Before deploying:

# 1. Build the app
pnpm build

# 2. Check for errors
pnpm lint

# 3. Start production server
pnpm start

# 4. Test critical endpoints
curl http://localhost:3000/api/auth/register

# 5. Verify environment variables
echo "MongoDB: $MONGODB_URI"
echo "JWT Secret: ${JWT_SECRET:0:10}..."

# 6. Check database connection
# Test login with valid credentials

# 7. Review logs
# Check .next/logs/ or deployment platform logs
```

## Quick Start Sequence

```bash
# Complete setup in order
pnpm install
cp .env.example .env.local
# Edit .env.local with MONGODB_URI and JWT_SECRET

pnpm dev
# Visit http://localhost:3000

# In another terminal, test API:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Test","password":"Test123","role":"student"}'
```

---

**Keep this file handy for quick command reference!**
