# GitHub Integration Guide for PlaceOS X

## Overview

PlaceOS X automatically extracts student skills from their GitHub repositories during registration. This feature allows students to easily populate their skill profile without manual input.

## How It Works

### Student Registration Flow

1. **Step 1**: Student selects "Student" role and enters basic info (email, password, name)
2. **Step 2**: Student provides personal details:
   - Phone number
   - University name
   - Graduation year
   - GitHub username
3. **Step 3**: System fetches skills from GitHub and presents selection options
4. **Step 3a**: Student can manually select/deselect skills before completion

### Automatic Skill Extraction

The GitHub integration automatically analyzes:

- **Repository Languages**: Primary programming languages in your repos
- **Repository Topics**: GitHub topics/tags you've added
- **Repository Names & Descriptions**: Keywords indicating technologies
- **Public Repositories**: Only public repos are analyzed (up to 100 most recent)

### Supported Skills

The system recognizes 40+ technologies including:

#### Frontend
- JavaScript, TypeScript, React, Vue, Angular, Next.js, Nuxt, Svelte
- HTML, CSS, Tailwind CSS, Bootstrap

#### Backend
- Python, Java, C#, Go, Rust, Kotlin, Swift
- Node.js, Express, Django, Spring Boot, ASP.NET, PHP, Ruby

#### Databases
- MongoDB, PostgreSQL, MySQL, Firebase, Redis, Elasticsearch, DynamoDB

#### DevOps & Cloud
- Docker, Kubernetes, AWS, Azure, Google Cloud, Heroku, Vercel
- Git, GitHub, GitLab, Jenkins

#### Tools & Frameworks
- GraphQL, REST API, WebSocket, OAuth, JWT
- Jest, Mocha, Cypress, Selenium

## API Endpoints

### Fetch GitHub Skills

**Endpoint**: `POST /api/github/fetch-skills`

**Request Body**:
```json
{
  "username": "github-username"
}
```

**Response**:
```json
{
  "skills": ["React", "TypeScript", "Node.js", "MongoDB"],
  "githubUrl": "https://github.com/username",
  "username": "github-username"
}
```

**Error Response** (400):
```json
{
  "error": "GitHub user 'invalid-username' not found",
  "skills": [],
  "githubUrl": ""
}
```

## Database Schema

### User Model - Student Fields

```typescript
{
  // ... other fields
  githubUsername: String,        // GitHub username
  githubUrl: String,             // Full GitHub profile URL
  phone: String,                 // Phone number
  university: String,            // University name
  graduationYear: Number,        // Expected graduation year
  skills: [String],              // Array of skill strings
}
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "GitHub user not found" | Invalid username or typo | Check GitHub username spelling |
| "No public repositories found" | User has no public repos | User should create public repos or manually select skills |
| "Failed to fetch GitHub data" | Network issue | Check internet connection and try again |

### Fallback Behavior

If GitHub fetch fails at any step:

1. Student is notified with error message
2. Student can manually select skills from predefined list
3. Registration can proceed without GitHub skills
4. Student can update skills later from dashboard

## Technical Details

### GitHub API Usage

The integration uses GitHub's public API (no authentication required):

- `GET /users/{username}` - Fetch user info
- `GET /users/{username}/repos` - Fetch up to 100 recent repos

### Rate Limiting

GitHub allows 60 requests per hour for unauthenticated requests. This is sufficient for typical usage.

### Skill Matching Algorithm

Skills are extracted using multi-level matching:

1. **Exact Match**: Direct keyword match in repo data
2. **Partial Match**: Keyword appears as substring
3. **Language Mapping**: Map GitHub language to skill name

Example:
```
repo.language = "TypeScript" → "TypeScript" skill
repo.topics = ["react", "nextjs"] → "React", "Next.js" skills
repo.name = "python-automation" → "Python" skill
```

## Examples

### Example 1: Successful Skill Fetch

**GitHub Username**: `torvalds`

**Public Repos**: linux, subsurface, etc.

**Extracted Skills**: C, Git, Linux

### Example 2: Multiple Technology Stack

**GitHub Username**: `gvanrossum`

**Skills Found**: Python, C, JavaScript, Docker, AWS

### Example 3: No Repos

**GitHub Username**: `newuser`

**Result**: Error message, student can manually add skills

## Student Dashboard

After registration, students can:

- View their extracted skills
- Add/remove skills manually
- Update GitHub username to re-fetch skills
- See which skills matched jobs

### Update Skills Endpoint

**Endpoint**: `PATCH /api/students`

**Request Body**:
```json
{
  "skills": ["JavaScript", "React", "Node.js"],
  "githubUsername": "new-username"
}
```

## For Developers

### Add New Skills

To add new skills to the system:

1. Edit `lib/github-utils.ts`
2. Add skill to `SKILL_KEYWORDS` object:
   ```typescript
   const SKILL_KEYWORDS: Record<string, string> = {
     // ... existing skills
     'fastapi': 'FastAPI',
     'flask': 'Flask',
   };
   ```
3. Redeploy application

### Customize Skill Extraction

Modify skill extraction logic in `lib/github-utils.ts`:

```typescript
export function extractSkillsFromRepos(repos: GitHubRepo[]): string[] {
  const foundSkills = new Set<string>();
  // Customize extraction logic here
  return Array.from(foundSkills).sort();
}
```

### Testing

Test the GitHub integration endpoint:

```bash
# Fetch skills for a user
curl -X POST http://localhost:3000/api/github/fetch-skills \
  -H "Content-Type: application/json" \
  -d '{"username": "torvalds"}'
```

## Troubleshooting

### Skills Not Appearing

1. Check if GitHub username is correct
2. Verify user has public repositories
3. Repositories should have proper language identification on GitHub
4. Try clicking "Fetch Skills" button again

### Wrong Skills Detected

If the system incorrectly identifies skills:

1. Add topics to your GitHub repos for better accuracy
2. Skills are extracted from:
   - Repository language (most reliable)
   - Repository topics (recommended to add)
   - Repo name and description (least reliable)

### Improve Accuracy

To help the system better detect your skills:

1. Add appropriate GitHub topics to each repo
2. Set correct language for repos (GitHub auto-detects, verify it's correct)
3. Use clear repository names with technology names
4. Write detailed descriptions mentioning technologies

## Privacy & Security

- No authentication token required (GitHub public data only)
- Only public repository data is analyzed
- GitHub username is stored but not validated beyond API calls
- All skill data is processed server-side
- HTTPS required for all API calls

## API Limits

- Up to 100 public repositories analyzed per user
- GitHub public API: 60 requests/hour (unauthenticated)
- No rate limiting on our end
- Cached results reduce repeated API calls

## Future Enhancements

Potential improvements:

- GitHub authentication for private repo analysis
- Profile badges from GitHub (stars, contributions)
- Auto-update skills on re-login
- Machine learning for better skill detection
- Integration with other platforms (GitLab, Bitbucket)

---

**Last Updated**: April 2026  
**Version**: 1.0.0
