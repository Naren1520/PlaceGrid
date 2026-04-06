'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

const PREDEFINED_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Angular',
  'Python', 'Java', 'C#', 'Go', 'Rust', 'Kotlin',
  'Node.js', 'Express', 'Django', 'Spring Boot', 'ASP.NET',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud',
  'Git', 'GitHub', 'REST API', 'GraphQL', 'WebSocket',
  'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap',
  'Jest', 'Cypress', 'Mocha', 'Selenium',
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'student' | 'company' | 'coordinator' | null>(null);
  const [step, setStep] = useState(1);
  
  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Student fields
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [fetchedSkills, setFetchedSkills] = useState<string[]>([]);
  const [isFetchingGitHub, setIsFetchingGitHub] = useState(false);
  const [githubError, setGithubError] = useState('');
  
  // Company fields
  const [companyName, setCompanyName] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Store token and user data
      login(data.user.email, data.user.name, data.user.role, data.token, data.user.companyName);
      router.push('/dashboard');
    } catch (err) {
      console.error('[v0] Login error:', err);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGitHubSkills = async () => {
    if (!githubUsername.trim()) {
      setGithubError('Please enter your GitHub username');
      return;
    }

    setIsFetchingGitHub(true);
    setGithubError('');
    setFetchedSkills([]);

    try {
      const response = await fetch('/api/github/fetch-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: githubUsername.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGithubError(data.error || 'Failed to fetch skills from GitHub');
        return;
      }

      setFetchedSkills(data.skills || []);
      setSkills(data.skills || []);
      setGithubError('');
    } catch (err) {
      console.error('[v0] GitHub fetch error:', err);
      setGithubError('Failed to connect to GitHub');
    } finally {
      setIsFetchingGitHub(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          ...(role === 'student' && {
            phone,
            university,
            graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
            githubUsername,
            skills,
          }),
          ...(role === 'company' && { companyName }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Store token and redirect
      login(data.user.email, data.user.name, data.user.role, data.token, data.user.companyName);
      router.push('/dashboard');
    } catch (err) {
      console.error('[v0] Registration error:', err);
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedStep1 = email && password && name;
  const canProceedStudentStep = phone && university && graduationYear;
  const canSubmitStudent = skills.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold">PlaceOS X</CardTitle>
            <CardDescription className="text-base">Autonomous Placement Intelligence</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                onClick={() => { setMode('login'); setStep(1); setError(''); }}
                variant={mode === 'login' ? 'default' : 'outline'}
                className="flex-1"
              >
                Login
              </Button>
              <Button
                type="button"
                onClick={() => { setMode('register'); setStep(1); setError(''); }}
                variant={mode === 'register' ? 'default' : 'outline'}
                className="flex-1"
              >
                Register
              </Button>
            </div>

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com or admin"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-semibold text-foreground mb-1">Coordinator Login:</p>
                  <p className="text-xs text-muted-foreground">Email: admin</p>
                  <p className="text-xs text-muted-foreground">Password: admin123</p>
                </div>
              </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Role Selection */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Select Your Role</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['student', 'company', 'coordinator'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2 px-3 rounded-lg font-medium transition text-sm ${
                            role === r
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-foreground hover:bg-muted'
                          }`}
                        >
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Common fields */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}

                  <Button
                    type="button"
                    onClick={() => {
                      setError('');
                      setStep(2);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    disabled={!canProceedStep1 || !role}
                  >
                    Next
                  </Button>
                </>
              )}

              {/* Step 2: Role-specific details */}
              {step === 2 && role === 'student' && (
                <>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">Student Information</h3>
                    <p className="text-xs text-muted-foreground">Tell us about yourself</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">University</label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="MIT, Stanford, etc."
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Graduation Year</label>
                    <select
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select year</option>
                      {[2024, 2025, 2026, 2027, 2028].map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">GitHub Username</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={githubUsername}
                        onChange={(e) => {
                          setGithubUsername(e.target.value);
                          setGithubError('');
                        }}
                        placeholder="your-github-username"
                        className="flex-1 px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button
                        type="button"
                        onClick={fetchGitHubSkills}
                        disabled={isFetchingGitHub || !githubUsername.trim()}
                        variant="outline"
                        className="whitespace-nowrap"
                      >
                        {isFetchingGitHub ? 'Fetching...' : 'Fetch Skills'}
                      </Button>
                    </div>
                    {githubError && <p className="text-xs text-destructive">{githubError}</p>}
                    {fetchedSkills.length > 0 && (
                      <p className="text-xs text-green-600">Found {fetchedSkills.length} skills from GitHub</p>
                    )}
                  </div>

                  {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                      variant="outline"
                      className="flex-1"
                      disabled={!canProceedStudentStep}
                    >
                      Next
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="ghost"
                      className="flex-1"
                    >
                      Back
                    </Button>
                  </div>
                </>
              )}

              {step === 2 && role === 'company' && (
                <>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">Company Information</h3>
                    <p className="text-xs text-muted-foreground">Tell us about your company</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Corp"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      disabled={!companyName || isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="ghost"
                      className="flex-1"
                    >
                      Back
                    </Button>
                  </div>
                </>
              )}

              {step === 2 && role === 'coordinator' && (
                <>
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">No additional information needed for coordinators</p>
                    {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="ghost"
                      className="flex-1"
                    >
                      Back
                    </Button>
                  </div>
                </>
              )}

              {/* Step 3: Skills Selection for Students */}
              {step === 3 && role === 'student' && (
                <>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">Select Your Skills</h3>
                    <p className="text-xs text-muted-foreground">
                      {fetchedSkills.length > 0
                        ? `${fetchedSkills.length} skills found from GitHub`
                        : 'Choose from predefined skills or add custom ones'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto p-2 border border-border rounded-lg bg-secondary/50">
                    {PREDEFINED_SKILLS.map((skill) => (
                      <label
                        key={skill}
                        className="flex items-center gap-2 p-2 rounded hover:bg-primary/10 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={skills.includes(skill)}
                          onChange={() => toggleSkill(skill)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span className="text-sm">{skill}</span>
                      </label>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Selected: <span className="font-semibold">{skills.length}</span> skills
                  </p>

                  {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      disabled={!canSubmitStudent || isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Complete Registration'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      variant="ghost"
                      className="flex-1"
                    >
                      Back
                    </Button>
                  </div>
                </>
              )}
            </form>
            )}

            {/* Features */}
            {mode === 'login' && (
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <p className="font-semibold text-sm text-foreground">Key Features:</p>
                <ul className="text-muted-foreground text-xs space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>GitHub auto-skill extraction for students</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>AI-powered skill matching algorithm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Placement risk prediction analytics</span>
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
