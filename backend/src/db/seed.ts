import { memoryDb, getPool } from '../config/database';
import { hashPassword } from '../utils/password';
import { logger } from '../utils/logger';

export const INITIAL_SEEDED_USERS = [
  {
    id: 'usr-admin-001',
    email: 'admin@jobboard.io',
    password: 'Admin123!',
    full_name: 'Platform Administrator',
    role: 'ADMIN',
  },
  {
    id: 'usr-employer-001',
    email: 'recruiter@techcorp.io',
    password: 'Employer123!',
    full_name: 'Sarah Jenkins',
    role: 'EMPLOYER',
  },
  {
    id: 'usr-candidate-001',
    email: 'alex.dev@cloud.io',
    password: 'Applicant123!',
    full_name: 'Alex Rivera',
    role: 'USER',
  },
];

export const INITIAL_SEEDED_COMPANIES = [
  {
    id: 'cmp-001',
    name: 'CloudScale Systems',
    description: 'Pioneering next-generation Kubernetes clusters, service mesh infrastructure, and distributed cloud computing.',
    website: 'https://cloudscale.example.com',
    location: 'San Francisco, CA (Remote Friendly)',
    logo_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=128&q=80',
    owner_id: 'usr-employer-001',
  },
  {
    id: 'cmp-002',
    name: 'DevOps Nexus',
    description: 'Enterprise DevSecOps, continuous verification, GitOps tooling, and platform engineering consultancy.',
    website: 'https://devopsnexus.example.com',
    location: 'Austin, TX',
    logo_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=128&q=80',
    owner_id: 'usr-employer-001',
  },
];

export const INITIAL_SEEDED_JOBS = [
  {
    id: 'job-001',
    company_id: 'cmp-001',
    title: 'Senior Kubernetes & Platform Engineer',
    description: 'Architect, automate, and operate enterprise multi-tenant EKS clusters with GitOps, ArgoCD, and automated canary rollouts.',
    requirements: [
      '5+ years hands-on experience with Kubernetes, Helm, and container runtimes',
      'Proficiency in Terraform, AWS VPC, IAM OIDC, and EKS',
      'Expertise in Prometheus, Grafana, Alertmanager, and distributed tracing',
      'Production experience with GitOps (ArgoCD or Flux)',
    ],
    location: 'Remote, US',
    is_remote: true,
    type: 'FULL_TIME',
    salary_min: 155000,
    salary_max: 195000,
    salary_currency: 'USD',
    status: 'ACTIVE',
    created_by: 'usr-employer-001',
  },
  {
    id: 'job-002',
    company_id: 'cmp-001',
    title: 'Staff Site Reliability Engineer (SRE)',
    description: 'Drive reliability engineering, SLO/SLI definition, chaos engineering, and incident disaster recovery across global cloud microservices.',
    requirements: [
      'Deep Linux internals, networking protocols, and systems programming',
      'Track record building automated rollback systems and resilience testing',
      'Strong scripting in Go, Python, or TypeScript',
    ],
    location: 'San Francisco, CA',
    is_remote: true,
    type: 'FULL_TIME',
    salary_min: 175000,
    salary_max: 220000,
    salary_currency: 'USD',
    status: 'ACTIVE',
    created_by: 'usr-employer-001',
  },
  {
    id: 'job-003',
    company_id: 'cmp-002',
    title: 'Cloud DevSecOps & Security Architect',
    description: 'Embed security into CI/CD pipelines: container vulnerability scanning (Trivy), secret scanning (Gitleaks), SBOM generation (Syft), and RBAC least privilege.',
    requirements: [
      'Demonstrated expertise in GitHub Actions CI/CD workflows and security hardening',
      'Knowledge of supply chain security (SLSA, SBOM, Cosign, Syft)',
      'Kubernetes security policies (NetworkPolicy, Pod Security Standards)',
    ],
    location: 'Austin, TX',
    is_remote: false,
    type: 'FULL_TIME',
    salary_min: 160000,
    salary_max: 200000,
    salary_currency: 'USD',
    status: 'ACTIVE',
    created_by: 'usr-employer-001',
  },
  {
    id: 'job-004',
    company_id: 'cmp-002',
    title: 'Full Stack Cloud Engineer (React & Node.js)',
    description: 'Build high-performance developer portals, dashboards, and REST APIs connected to PostgreSQL and Redis caching layers.',
    requirements: [
      'Strong proficiency in TypeScript, React, Vite, and modern CSS systems',
      'Solid backend experience with Express.js, PostgreSQL connection pooling, and Redis caching',
      'Experience writing Dockerfiles and participating in CI/CD pipeline automation',
    ],
    location: 'Remote',
    is_remote: true,
    type: 'CONTRACT',
    salary_min: 120000,
    salary_max: 150000,
    salary_currency: 'USD',
    status: 'ACTIVE',
    created_by: 'usr-employer-001',
  },
];

export async function seedDatabase(): Promise<void> {
  logger.info('Starting database seeding...');
  const pool = getPool();
  const now = new Date().toISOString();

  // Seed into memoryDb for immediate in-memory availability
  memoryDb.users = [];
  memoryDb.companies = [];
  memoryDb.jobs = [];
  memoryDb.applications = [];
  memoryDb.saved_jobs = [];

  for (const u of INITIAL_SEEDED_USERS) {
    const password_hash = await hashPassword(u.password);
    const userObj = {
      id: u.id,
      email: u.email,
      password_hash,
      full_name: u.full_name,
      role: u.role,
      created_at: now,
      updated_at: now,
    };
    memoryDb.users.push(userObj);

    // If PostgreSQL is reachable, also upsert
    try {
      await pool.query(
        `INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO UPDATE 
         SET password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name, role = EXCLUDED.role`,
        [userObj.id, userObj.email, userObj.password_hash, userObj.full_name, userObj.role, userObj.created_at, userObj.updated_at]
      );
    } catch (_) {}
  }

  for (const c of INITIAL_SEEDED_COMPANIES) {
    const compObj = { ...c, created_at: now, updated_at: now };
    memoryDb.companies.push(compObj);
    try {
      await pool.query(
        `INSERT INTO companies (id, name, description, website, location, logo_url, owner_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [compObj.id, compObj.name, compObj.description, compObj.website, compObj.location, compObj.logo_url, compObj.owner_id, compObj.created_at, compObj.updated_at]
      );
    } catch (_) {}
  }

  for (const j of INITIAL_SEEDED_JOBS) {
    const jobObj = { ...j, created_at: now, updated_at: now };
    memoryDb.jobs.push(jobObj);
    try {
      await pool.query(
        `INSERT INTO jobs (id, company_id, title, description, requirements, location, is_remote, type, salary_min, salary_max, salary_currency, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO NOTHING`,
        [jobObj.id, jobObj.company_id, jobObj.title, jobObj.description, JSON.stringify(jobObj.requirements), jobObj.location, jobObj.is_remote, jobObj.type, jobObj.salary_min, jobObj.salary_max, jobObj.salary_currency, jobObj.status, jobObj.created_by, jobObj.created_at, jobObj.updated_at]
      );
    } catch (_) {}
  }

  // Seed a sample application
  const sampleApp = {
    id: 'app-001',
    job_id: 'job-001',
    user_id: 'usr-candidate-001',
    applicant_name: 'Alex Rivera',
    applicant_email: 'alex.dev@cloud.io',
    resume_url: 'https://storage.jobboard.io/resumes/alex-rivera-sre.pdf',
    cover_letter: 'Passionate DevOps and Kubernetes engineer with 4+ years of AWS and Terraform experience.',
    status: 'REVIEWED',
    created_at: now,
    updated_at: now,
  };
  memoryDb.applications.push(sampleApp);

  // Seed a sample saved job
  const sampleSaved = {
    id: 'save-001',
    user_id: 'usr-candidate-001',
    job_id: 'job-002',
    created_at: now,
  };
  memoryDb.saved_jobs.push(sampleSaved);

  logger.info('Database seeding completed successfully.');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
