# PlaceOS X - API Documentation

Complete API reference for PlaceOS X backend.

## Base URL
```
http://localhost:3000/api
https://your-domain.com/api (production)
```

## Authentication

Most endpoints require JWT authentication. Include token in header:

```bash
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained from login/register endpoints and expire after 7 days.

---

## Authentication Endpoints

### Register User

Create a new user account.

**Request:**
```
POST /auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePassword123",
  "role": "student",
  "companyName": "Acme Corp",     // Required for company role
  "companyId": "company_123"      // Optional, auto-generated if not provided
}
```

**Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| email | string | Yes | Must be unique |
| name | string | Yes | Full name |
| password | string | Yes | Min 6 characters |
| role | string | Yes | 'student', 'company', or 'coordinator' |
| companyName | string | If company | Company name |
| companyId | string | No | Auto-generated if not provided |

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "companyName": null,
    "skills": []
  }
}
```

**Error Responses:**
```json
// 400 - Missing fields
{ "error": "Missing required fields" }

// 409 - User exists
{ "error": "User already exists" }

// 400 - Invalid role
{ "error": "Invalid role" }
```

---

### Login

Authenticate user and get JWT token.

**Request:**
```
POST /auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "companyName": null,
    "skills": ["JavaScript", "React", "Node.js"]
  }
}
```

**Error Responses:**
```json
// 400 - Missing fields
{ "error": "Email and password required" }

// 401 - Invalid credentials
{ "error": "Invalid email or password" }
```

---

## Jobs Endpoints

### Get All Jobs

Retrieve all open job postings.

**Request:**
```
GET /jobs
```

**Headers:**
```
Authorization: Bearer <token>  // Optional
```

**Success Response (200):**
```json
{
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Full Stack Developer",
      "description": "Build amazing web applications",
      "companyName": "Acme Corp",
      "requiredSkills": ["JavaScript", "React", "Node.js"],
      "isOpen": true,
      "deadline": "2026-12-31T23:59:59Z",
      "createdAt": "2026-04-06T10:00:00Z",
      "updatedAt": "2026-04-06T10:00:00Z"
    }
  ],
  "isFrozen": false
}
```

**Special Responses:**
```json
// When system is frozen
{
  "jobs": [],
  "isFrozen": true,
  "message": "Placement system is currently frozen"
}
```

---

### Create Job

Post a new job opening (companies only).

**Request:**
```
POST /jobs
Authorization: Bearer <company-token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Full Stack Developer",
  "description": "Build amazing web applications. Remote position.",
  "requiredSkills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "deadline": "2026-12-31T23:59:59Z"
}
```

**Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Job title |
| description | string | Yes | Job description |
| requiredSkills | array | Yes | Array of skill strings |
| deadline | string | No | ISO date string |

**Success Response (201):**
```json
{
  "job": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Full Stack Developer",
    "description": "Build amazing web applications. Remote position.",
    "company": "507f1f77bcf86cd799439011",
    "companyName": "Acme Corp",
    "companyId": "company_123",
    "requiredSkills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "applications": [],
    "isOpen": true,
    "deadline": "2026-12-31T23:59:59Z",
    "createdAt": "2026-04-06T10:00:00Z",
    "updatedAt": "2026-04-06T10:00:00Z"
  }
}
```

**Error Responses:**
```json
// 401 - Not authenticated
{ "error": "Unauthorized" }

// 403 - Not a company
{ "error": "Only companies can post jobs" }

// 403 - System frozen
{ "error": "Cannot post jobs while system is frozen" }

// 400 - Missing fields
{ "error": "Missing required fields" }
```

---

## Applications Endpoints

### Get Applications

Get applications (role-based filtering).

**Request:**
```
GET /applications
Authorization: Bearer <token>
```

**Success Response (200):**

**For Students:**
```json
{
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "student": "507f1f77bcf86cd799439011",
      "job": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Full Stack Developer",
        "companyName": "Acme Corp"
      },
      "company": "507f1f77bcf86cd799439010",
      "status": "pending",
      "matchScore": 75,
      "appliedAt": "2026-04-06T10:00:00Z"
    }
  ]
}
```

**For Companies:**
```json
{
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "student": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "skills": ["JavaScript", "React", "Node.js"]
      },
      "job": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Full Stack Developer"
      },
      "status": "pending",
      "matchScore": 75,
      "appliedAt": "2026-04-06T10:00:00Z"
    }
  ]
}
```

**For Coordinators:** See all applications

---

### Apply to Job

Student applies to a job.

**Request:**
```
POST /applications
Authorization: Bearer <student-token>
Content-Type: application/json
```

**Body:**
```json
{
  "jobId": "507f1f77bcf86cd799439012"
}
```

**Success Response (201):**
```json
{
  "application": {
    "_id": "507f1f77bcf86cd799439013",
    "student": "507f1f77bcf86cd799439011",
    "studentName": "John Doe",
    "studentEmail": "john@example.com",
    "job": "507f1f77bcf86cd799439012",
    "company": "507f1f77bcf86cd799439010",
    "companyName": "Acme Corp",
    "status": "pending",
    "matchScore": 75,
    "studentSkills": ["JavaScript", "React", "Node.js"],
    "createdAt": "2026-04-06T10:00:00Z"
  }
}
```

**Match Score Calculation:**
```
matchScore = (matchedSkills / requiredSkills) × 100

Example:
- Student has: [JavaScript, React, Node.js]
- Job requires: [JavaScript, React, Python]
- Matched: 2 out of 3 = 66%
```

**Error Responses:**
```json
// 401 - Not authenticated
{ "error": "Unauthorized" }

// 403 - Not a student
{ "error": "Only students can apply" }

// 403 - System frozen
{ "error": "Applications are frozen" }

// 409 - Already applied
{ "error": "Already applied to this job" }

// 404 - Job not found
{ "error": "Job not found" }
```

---

### Update Application Status

Company or coordinator updates application status.

**Request:**
```
PATCH /applications
Authorization: Bearer <company-token>
Content-Type: application/json
```

**Body:**
```json
{
  "applicationId": "507f1f77bcf86cd799439013",
  "status": "accepted"
}
```

**Parameters:**
| Field | Type | Required | Values |
|-------|------|----------|--------|
| applicationId | string | Yes | Valid application ID |
| status | string | Yes | 'pending', 'accepted', 'rejected' |

**Success Response (200):**
```json
{
  "application": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "accepted",
    "matchScore": 75,
    ...
  }
}
```

**Error Responses:**
```json
// 403 - Not authorized
{ "error": "Only companies can update applications" }

// 400 - Invalid status
{ "error": "Invalid application ID or status" }

// 404 - Not found
{ "error": "Application not found" }
```

---

## Student Endpoints

### Get Student Profile

Get current student's profile and statistics.

**Request:**
```
GET /students
Authorization: Bearer <student-token>
```

**Success Response (200):**
```json
{
  "student": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "student",
    "skills": ["JavaScript", "React", "Node.js"],
    "resume": "LinkedIn profile URL..."
  },
  "stats": {
    "totalApplications": 5,
    "pending": 2,
    "accepted": 2,
    "rejected": 1
  }
}
```

### Get All Students (Coordinator Only)

**Request:**
```
GET /students
Authorization: Bearer <coordinator-token>
```

**Success Response (200):**
```json
{
  "students": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "skills": ["JavaScript", "React", "Node.js"],
      "totalApplications": 5,
      "acceptedApplications": 2,
      "avgMatchScore": 72,
      "riskLevel": "LOW"
    }
  ]
}
```

**Risk Levels:**
- **HIGH**: Average match score < 50%
- **MEDIUM**: Average match score 50-70%
- **LOW**: Average match score > 70%

---

### Update Student Profile

Update skills and resume.

**Request:**
```
PATCH /students
Authorization: Bearer <student-token>
Content-Type: application/json
```

**Body:**
```json
{
  "skills": ["JavaScript", "React", "Node.js", "MongoDB", "AWS"],
  "resume": "https://linkedin.com/in/johndoe"
}
```

**Success Response (200):**
```json
{
  "student": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["JavaScript", "React", "Node.js", "MongoDB", "AWS"],
    "resume": "https://linkedin.com/in/johndoe"
  }
}
```

---

## Coordinator Endpoints

### Get Freeze Status

Check if placement system is frozen.

**Request:**
```
GET /coordinator/freeze
```

**Success Response (200):**
```json
{
  "isFrozen": false,
  "frozenAt": null,
  "reason": null
}
```

**When Frozen:**
```json
{
  "isFrozen": true,
  "frozenAt": "2026-04-06T10:00:00Z",
  "reason": "Placement process frozen by coordinator"
}
```

---

### Toggle Freeze Status

Freeze or unfreeze the placement system.

**Request:**
```
POST /coordinator/freeze
Authorization: Bearer <coordinator-token>
Content-Type: application/json
```

**Body - Freeze:**
```json
{
  "action": "freeze",
  "reason": "Annual placement cycle closed"
}
```

**Body - Unfreeze:**
```json
{
  "action": "unfreeze"
}
```

**Parameters:**
| Field | Type | Required | Values |
|-------|------|----------|--------|
| action | string | Yes | 'freeze', 'unfreeze' |
| reason | string | No | Reason for freezing |

**Success Response (200):**
```json
{
  "message": "System frozen successfully",
  "isFrozen": true,
  "frozenAt": "2026-04-06T10:00:00Z"
}
```

**Effects When Frozen:**
- ✗ Companies cannot post new jobs
- ✗ Students cannot apply to jobs
- ✓ Existing applications can still be reviewed
- ✓ Status can still be updated

**Error Response:**
```json
// 403 - Not coordinator
{ "error": "Only coordinators can manage freeze" }
```

---

## Error Handling

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check JSON body, verify required fields |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User role doesn't have permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (e.g., already applied) |
| 500 | Server Error | Contact support, check server logs |

### Example Error Response

```json
{
  "error": "Only companies can post jobs"
}
```

---

## Rate Limiting

Currently no rate limiting. Consider implementing in production:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per user

---

## Examples

### Complete Registration & Login Flow

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "password": "SecurePass123",
    "role": "student"
  }'

# Save the token from response

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# 3. Use token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:3000/api/students \
  -H "Authorization: Bearer $TOKEN"
```

### Complete Job Post & Apply Flow

```bash
# Company posts job
curl -X POST http://localhost:3000/api/jobs \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Developer",
    "description": "Build web apps",
    "requiredSkills": ["JavaScript", "React"]
  }'

# Student applies
curl -X POST http://localhost:3000/api/applications \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId": "507f1f77bcf86cd799439012"}'

# Company reviews applications
curl http://localhost:3000/api/applications \
  -H "Authorization: Bearer $COMPANY_TOKEN"

# Company accepts application
curl -X PATCH http://localhost:3000/api/applications \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "507f1f77bcf86cd799439013",
    "status": "accepted"
  }'
```

---

## Predefined Skills List

The system has these predefined skills:

```
JavaScript, TypeScript, React, Node.js, Python, Java, C++,
MongoDB, SQL, AWS, Docker, Git, REST API, GraphQL,
HTML, CSS, Tailwind CSS, Next.js, Express.js
```

Custom skills can be added by modifying the PREDEFINED_SKILLS array in API routes.

---

## Field Validation

### Skills Array
- Array of strings
- Must be from predefined list (or custom if allowed)
- Can be empty

### Match Score
- Integer 0-100
- Calculated server-side
- Automatically computed from student skills vs required skills

### Status Values
- 'pending' - Initial state
- 'accepted' - Company accepted application
- 'rejected' - Company rejected application

---

## Changelog

### v1.0.0 (Initial Release)
- Authentication (register/login)
- Job posting and management
- Job applications
- Student profiles
- Coordinator freeze control
- Risk prediction analytics

---

**For more information, see README.md and SETUP.md**
