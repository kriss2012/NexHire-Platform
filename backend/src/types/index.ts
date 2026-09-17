export type UserRole = 'USER' | 'EMPLOYER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type SafeUser = Omit<User, 'password_hash'>;

export interface Company {
  id: string;
  name: string;
  description: string;
  website?: string;
  location: string;
  logo_url?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
export type JobStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

export interface Job {
  id: string;
  company_id: string;
  company_name?: string;
  company_logo?: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  is_remote: boolean;
  type: JobType;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  status: JobStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'INTERVIEWING' | 'REJECTED' | 'ACCEPTED';

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  applicant_name?: string;
  applicant_email?: string;
  job_title?: string;
  company_name?: string;
  resume_url?: string;
  cover_letter?: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
  job?: Job;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}
