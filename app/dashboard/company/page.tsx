'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CompanyDashboard() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requiredSkills: [] as string[],
    deadline: '',
  });
  const [loading, setLoading] = useState(false);

  const PREDEFINED_SKILLS = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Angular',
    'Python', 'Java', 'C#', 'Go', 'Rust', 'Kotlin',
    'Node.js', 'Express', 'Django', 'Spring Boot', 'ASP.NET',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Redis',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud',
  ];

  useEffect(() => {
    if (!user || user.role !== 'company') {
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
        setIsFrozen(data.isFrozen || false);
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

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.description || newJob.requiredSkills.length === 0 || !newJob.deadline) {
      alert('Please fill all fields including deadline');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newJob),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Job posted successfully!');
        setNewJob({ title: '', description: '', requiredSkills: [], deadline: '' });
        fetchJobs();
      } else {
        alert(data.error || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setNewJob((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter((s) => s !== skill)
        : [...prev.requiredSkills, skill],
    }));
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId: appId, status }),
      });

      if (res.ok) {
        alert(`Application ${status}!`);
        fetchApplications();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    }
  };

  const downloadApplicants = (jobId: string) => {
    const jobApps = applications.filter((app) => app.job?._id === jobId);
    const csv = [
      ['Name', 'Email', 'Match Score', 'Status', 'Skills', 'Applied At'].join(','),
      ...jobApps.map((app) =>
        [
          app.studentName,
          app.studentEmail,
          app.matchScore + '%',
          app.status,
          (app.studentSkills || []).join('; '),
          new Date(app.appliedAt).toLocaleString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applicants-${jobId}.csv`;
    a.click();
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
            {isFrozen && (
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded">
                SYSTEM FROZEN
              </span>
            )}
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
            <CardDescription>Create a job posting with deadline</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g., Software Engineer"
                  required
                  disabled={isFrozen}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Job description..."
                  required
                  disabled={isFrozen}
                />
              </div>
              <div>
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={newJob.deadline}
                  onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                  required
                  disabled={isFrozen}
                />
              </div>
              <div>
                <Label>Required Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PREDEFINED_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      disabled={isFrozen}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                        newJob.requiredSkills.includes(skill)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-muted'
                      } ${isFrozen ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={loading || isFrozen} className="w-full">
                {loading ? 'Posting...' : 'Post Job'}
              </Button>
            </form>
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
                {jobs.map((job) => {
                  const jobApps = applications.filter((app) => app.job?._id === job._id);
                  const isPastDeadline = job.deadline && new Date() > new Date(job.deadline);
                  return (
                    <div key={job._id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{job.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Deadline: {new Date(job.deadline).toLocaleString()}
                            {isPastDeadline && <span className="text-red-600 ml-2">(Closed)</span>}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{jobApps.length}</p>
                          <p className="text-xs text-muted-foreground">Applications</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {job.requiredSkills?.map((skill: string) => (
                          <span key={skill} className="px-2 py-1 bg-secondary text-foreground text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                      {jobApps.length > 0 && (
                        <Button size="sm" variant="outline" onClick={() => downloadApplicants(job._id)}>
                          Download Applicants CSV
                        </Button>
                      )}
                    </div>
                  );
                })}
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
                {applications.map((app) => (
                  <div key={app._id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{app.studentName}</h3>
                        <p className="text-sm text-muted-foreground">{app.studentEmail}</p>
                        <p className="text-sm text-muted-foreground">Applied to: {app.job?.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied: {new Date(app.appliedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{app.matchScore}%</p>
                        <p className="text-xs text-muted-foreground">Match</p>
                      </div>
                    </div>
                    {app.studentSkills && app.studentSkills.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold mb-1">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {app.studentSkills.map((skill: string) => (
                            <span key={skill} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {app.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleUpdateStatus(app._id, 'shortlisted')}>
                            Shortlist
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(app._id, 'rejected')}>
                            Reject
                          </Button>
                          <Button size="sm" variant="default" onClick={() => handleUpdateStatus(app._id, 'placed')}>
                            Mark as Placed
                          </Button>
                        </>
                      )}
                      {app.status !== 'pending' && (
                        <span
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            app.status === 'shortlisted'
                              ? 'bg-blue-100 text-blue-800'
                              : app.status === 'placed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {app.status.toUpperCase()}
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
