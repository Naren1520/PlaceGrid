export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'student' | 'company' | 'coordinator';
  companyName?: string;
  companyId?: string;
  skills?: string[];
  resume?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  companyName: string;
  companyId: string;
  requiredSkills: string[];
  applications: string[];
  isOpen: boolean;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  _id: string;
  student: string;
  studentName: string;
  studentEmail: string;
  job: string;
  company: string;
  companyName: string;
  status: 'pending' | 'accepted' | 'rejected';
  matchScore: number;
  studentSkills: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CoordinatorSettings {
  _id: string;
  isFrozen: boolean;
  frozenAt?: Date;
  frozenBy?: string;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthToken {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyName?: string;
    skills?: string[];
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
  companyName?: string;
  iat?: number;
  exp?: number;
}
