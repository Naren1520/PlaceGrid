// Predefined skills list for matching
export const PREDEFINED_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'CSS',
  'HTML',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'Docker',
  'Git',
  'REST API',
  'GraphQL',
  'UI/UX Design',
  'Project Management',
  'Communication',
];

export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  companyId: string;
  requiredSkills: string[];
  deadline: string;
  status: 'open' | 'closed';
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentSkills: string[];
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}

export interface Company {
  id: string;
  email: string;
  name: string;
  companyName: string;
}

export interface PlacementStats {
  totalStudents: number;
  placedStudents: number;
  totalJobs: number;
  totalApplications: number;
  avgMatchScore: number;
  frozenStatus: boolean;
}

// Helper function to calculate match score
export function calculateMatchScore(studentSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 100;
  const matched = studentSkills.filter(skill => requiredSkills.includes(skill)).length;
  return Math.round((matched / requiredSkills.length) * 100);
}

// Helper function to get risk level
export function getRiskLevel(averageScore: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (averageScore < 50) return 'HIGH';
  if (averageScore < 70) return 'MEDIUM';
  return 'LOW';
}

// Initialize localStorage if needed
export function initializeDataStore() {
  if (typeof window === 'undefined') return;

  const keys = ['jobs', 'applications', 'companies', 'placement_stats'];
  keys.forEach(key => {
    if (!localStorage.getItem(key)) {
      if (key === 'placement_stats') {
        localStorage.setItem(key, JSON.stringify({
          totalStudents: 0,
          placedStudents: 0,
          totalJobs: 0,
          totalApplications: 0,
          avgMatchScore: 0,
          frozenStatus: false,
        }));
      } else {
        localStorage.setItem(key, JSON.stringify([]));
      }
    }
  });
}

// Job operations
export function getJobs(): Job[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('jobs') || '[]');
}

export function addJob(job: Omit<Job, 'id' | 'createdAt'>): Job {
  const jobs = getJobs();
  const newJob: Job = {
    ...job,
    id: `job_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  jobs.push(newJob);
  localStorage.setItem('jobs', JSON.stringify(jobs));
  return newJob;
}

export function updateJobStatus(jobId: string, status: 'open' | 'closed'): void {
  const jobs = getJobs();
  const job = jobs.find(j => j.id === jobId);
  if (job) {
    job.status = status;
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }
}

// Application operations
export function getApplications(): Application[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('applications') || '[]');
}

export function applyForJob(application: Omit<Application, 'id' | 'appliedAt' | 'matchScore'>): Application {
  const applications = getApplications();
  const matchScore = calculateMatchScore(application.studentSkills, 
    getJobs().find(j => j.id === application.jobId)?.requiredSkills || []);
  
  const newApp: Application = {
    ...application,
    id: `app_${Date.now()}`,
    matchScore,
    appliedAt: new Date().toISOString(),
  };
  applications.push(newApp);
  localStorage.setItem('applications', JSON.stringify(applications));
  return newApp;
}

export function updateApplicationStatus(appId: string, status: 'accepted' | 'rejected'): void {
  const applications = getApplications();
  const app = applications.find(a => a.id === appId);
  if (app) {
    app.status = status;
    localStorage.setItem('applications', JSON.stringify(applications));
  }
}

// Company operations
export function getCompanies(): Company[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('companies') || '[]');
}

export function addCompany(company: Omit<Company, 'id'>): Company {
  const companies = getCompanies();
  const newCompany: Company = {
    ...company,
    id: `company_${Date.now()}`,
  };
  companies.push(newCompany);
  localStorage.setItem('companies', JSON.stringify(companies));
  return newCompany;
}

// Stats operations
export function getPlacementStats(): PlacementStats {
  if (typeof window === 'undefined') {
    return {
      totalStudents: 0,
      placedStudents: 0,
      totalJobs: 0,
      totalApplications: 0,
      avgMatchScore: 0,
      frozenStatus: false,
    };
  }
  return JSON.parse(localStorage.getItem('placement_stats') || '{}');
}

export function updateFrozenStatus(frozenStatus: boolean): void {
  const stats = getPlacementStats();
  stats.frozenStatus = frozenStatus;
  localStorage.setItem('placement_stats', JSON.stringify(stats));
}

export function getFrozenStatus(): boolean {
  return getPlacementStats().frozenStatus;
}
