'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

function calculateMatchScore(studentSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 100;
  const matches = studentSkills.filter(skill => requiredSkills.includes(skill)).length;
  return Math.round((matches / requiredSkills.length) * 100);
}

export default function StudentDashboard() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/');
    } else {
      fetchJobs();
      fetchApplications();
    }
  }, [user, router]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApply = async (jobId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Applied successfully!');
        fetchApplications();
      } else {
        alert(data.error || 'Failed to apply');
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  const hasApplied = (jobId: string) => {
    return applications.some(app => app.job?._id === jobId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">PlaceOS X</h1>
            <p className="text-sm text-muted-foreground">Student Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground">{user?.name}</span>
            <Button variant="outline" onClick={() => { logout(); router.push('/'); }}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Student Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm"><span className="font-semibold">Name:</span> {user?.name}</p>
              <p className="text-sm"><span className="font-semibold">Email:</span> {user?.email}</p>
              {user?.university && (
                <p className="text-sm"><span className="font-semibold">University:</span> {user.university}</p>
              )}
              {user?.graduationYear && (
                <p className="text-sm"><span className="font-semibold">Graduation Year:</span> {user.graduationYear}</p>
              )}
              {user?.skills && user.skills.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill: string) => (
                      <span key={skill} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Applications ({applications.length})</CardTitle>
            <CardDescription>Track your job applications</CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="text-muted-foreground">No applications yet</p>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <div key={app._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{app.job?.title || 'Job'}</p>
                      <p className="text-sm text-muted-foreground">{app.companyName}</p>
                      <p className="text-sm text-muted-foreground">Match Score: {app.matchScore}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied: {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Available Jobs ({jobs.length})</CardTitle>
            <CardDescription>Click apply to submit your application</CardDescription>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-muted-foreground">No jobs available</p>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => {
                  const score = calculateMatchScore(user?.skills || [], job.requiredSkills || []);
                  const applied = hasApplied(job._id);
                  return (
                    <div key={job._id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.companyName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{score}%</p>
                          <p className="text-xs text-muted-foreground">Match Score</p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {job.requiredSkills?.map((skill: string) => (
                          <span key={skill} className="px-2 py-1 bg-secondary text-foreground text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <Button 
                        onClick={() => handleApply(job._id)} 
                        size="sm"
                        disabled={loading || applied}
                      >
                        {applied ? 'Already Applied' : 'Apply Now'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
