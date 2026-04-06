'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getJobs, applyForJob, getApplications, PREDEFINED_SKILLS, calculateMatchScore } from '@/lib/data-store';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/');
    } else {
      setJobs(getJobs().filter(j => j.status === 'open'));
      setApplications(getApplications().filter(a => a.studentId === user.id));
    }
  }, [user, router]);

  const handleApply = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    const score = calculateMatchScore(selectedSkills, job?.requiredSkills || []);
    applyForJob({
      jobId,
      studentId: user!.id,
      studentName: user!.name,
      studentEmail: user!.email,
      studentSkills: selectedSkills,
      status: 'pending',
    });
    alert('Applied successfully!');
    setApplications(getApplications().filter(a => a.studentId === user?.id));
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
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
        {/* Skills Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Skills</CardTitle>
            <CardDescription>Select skills to improve job matching</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    selectedSkills.includes(skill)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-muted'
                  }`}
                >
                  {skill}
                </button>
              ))}
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
                  <div key={app.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-semibold text-foreground">{app.jobId}</p>
                      <p className="text-sm text-muted-foreground">Match Score: {app.matchScore}%</p>
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
            <CardDescription>Click apply to submit your profile</CardDescription>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-muted-foreground">No jobs available</p>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => {
                  const score = calculateMatchScore(selectedSkills, job.requiredSkills);
                  return (
                    <div key={job.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{score}%</p>
                          <p className="text-xs text-muted-foreground">Match Score</p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {job.requiredSkills.map(skill => (
                          <span key={skill} className="px-2 py-1 bg-secondary text-foreground text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <Button onClick={() => handleApply(job.id)} size="sm">
                        Apply Now
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
