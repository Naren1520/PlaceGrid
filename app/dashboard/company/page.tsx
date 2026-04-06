'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { getJobs, addJob, updateApplicationStatus, getApplications, PREDEFINED_SKILLS } from '@/lib/data-store';

export default function CompanyDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [newJob, setNewJob] = useState({ title: '', description: '', requiredSkills: [] as string[] });

  useEffect(() => {
    if (!user || user.role !== 'company') {
      router.push('/');
    } else {
      setJobs(getJobs().filter(j => j.companyId === user.companyId));
      setApplications(getApplications().filter(a => 
        getJobs().find(j => j.id === a.jobId && j.companyId === user.companyId)
      ));
    }
  }, [user, router]);

  const handlePostJob = () => {
    if (!newJob.title || !newJob.description || newJob.requiredSkills.length === 0) {
      alert('Please fill all fields and select skills');
      return;
    }
    addJob({
      title: newJob.title,
      description: newJob.description,
      company: user?.name || 'Unknown',
      companyId: user?.companyId || '',
      requiredSkills: newJob.requiredSkills,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'open',
    });
    setNewJob({ title: '', description: '', requiredSkills: [] });
    alert('Job posted successfully!');
    setJobs(getJobs().filter(j => j.companyId === user?.companyId));
  };

  const toggleSkill = (skill: string) => {
    setNewJob(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill]
    }));
  };

  const handleApplicationAction = (appId: string, status: 'accepted' | 'rejected') => {
    updateApplicationStatus(appId, status);
    setApplications(getApplications().filter(a => 
      getJobs().find(j => j.id === a.jobId && j.companyId === user?.companyId)
    ));
    alert(`Application ${status}!`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">PlaceOS X</h1>
            <p className="text-sm text-muted-foreground">Company Dashboard</p>
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
        {/* Post Job Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Post a New Job</CardTitle>
            <CardDescription>Create a job posting to attract students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Job Title</label>
              <input
                type="text"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                placeholder="e.g., Software Engineer"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                placeholder="Job description..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Required Skills</label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_SKILLS.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      newJob.requiredSkills.includes(skill)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-muted'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handlePostJob} className="bg-primary hover:bg-primary/90">
              Post Job
            </Button>
          </CardContent>
        </Card>

        {/* Your Jobs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Job Postings ({jobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-muted-foreground">No jobs posted yet</p>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold text-foreground">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-secondary text-foreground text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({applications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="text-muted-foreground">No applications yet</p>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <div key={app.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{app.studentName}</h3>
                        <p className="text-sm text-muted-foreground">{app.studentEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{app.matchScore}%</p>
                        <p className="text-xs text-muted-foreground">Match Score</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {app.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApplicationAction(app.id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplicationAction(app.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {app.status !== 'pending' && (
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                          app.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {app.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
