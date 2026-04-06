'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function CoordinatorDashboard() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({ email: '', password: '', companyName: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'coordinator') {
      router.push('/');
    } else {
      fetchCompanies();
      fetchStudents();
    }
  }, [user, router]);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCompany),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Company created successfully!');
        setIsAddCompanyOpen(false);
        setNewCompany({ email: '', password: '', companyName: '' });
        fetchCompanies();
      } else {
        alert(data.error || 'Failed to create company');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">PlaceOS X</h1>
            <p className="text-sm text-muted-foreground">Coordinator Dashboard</p>
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
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{companies.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{students.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Companies Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Companies ({companies.length})</CardTitle>
                <CardDescription>Manage company accounts</CardDescription>
              </div>
              <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
                <DialogTrigger asChild>
                  <Button>Add Company</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Company</DialogTitle>
                    <DialogDescription>Create a new company account</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCompany} className="space-y-4">
                    <div key="companyName-field">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={newCompany.companyName}
                        onChange={(e) => setNewCompany({ ...newCompany, companyName: e.target.value })}
                        required
                      />
                    </div>
                    <div key="email-field">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newCompany.email}
                        onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                        required
                      />
                    </div>
                    <div key="password-field">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="text"
                        value={newCompany.password}
                        onChange={(e) => setNewCompany({ ...newCompany, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Creating...' : 'Create Company'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {companies.length === 0 ? (
              <p className="text-muted-foreground">No companies yet</p>
            ) : (
              <div className="space-y-3">
                {companies.map((company) => (
                  <div key={company._id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{company.companyName}</p>
                        <p className="text-sm text-muted-foreground mt-1">Email: {company.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(company.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        company.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {company.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Students ({students.length})</CardTitle>
            <CardDescription>Registered students</CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-muted-foreground">No students yet</p>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student._id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">Email: {student.email}</p>
                        {student.university && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {student.university} - Class of {student.graduationYear}
                          </p>
                        )}
                      </div>
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
