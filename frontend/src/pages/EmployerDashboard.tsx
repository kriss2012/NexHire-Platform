import React, { useState, useEffect } from 'react';
import { Job, Application, ApplicationStatus, Company } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Plus, Trash2, Users, Briefcase, CheckCircle, AlertCircle, Building2 } from 'lucide-react';

export const EmployerDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);

  // New Job Form State
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [location, setLocation] = useState('Remote, US');
  const [isRemote, setIsRemote] = useState(true);
  const [type, setType] = useState<'FULL_TIME' | 'CONTRACT' | 'PART_TIME' | 'INTERNSHIP'>('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState(140000);
  const [salaryMax, setSalaryMax] = useState(185000);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes, compsRes] = await Promise.all([
        api.get<{ success: boolean; data: { jobs: Job[] } }>('/jobs?limit=50'),
        api.get<{ success: boolean; data: { applications: Application[] } }>('/applications'),
        api.get<{ success: boolean; data: { companies: Company[] } }>('/companies'),
      ]);

      setJobs(jobsRes.data.jobs || []);
      setApplications(appsRes.data.applications || []);
      setCompanies(compsRes.data.companies || []);

      if (compsRes.data.companies && compsRes.data.companies.length > 0) {
        setCompanyId(compsRes.data.companies[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const requirements = requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    try {
      await api.post('/jobs', {
        company_id: companyId,
        title,
        description,
        requirements: requirements.length > 0 ? requirements : ['Kubernetes experience', 'CI/CD automation'],
        location,
        is_remote: isRemote,
        type,
        salary_min: Number(salaryMin),
        salary_max: Number(salaryMax),
        salary_currency: 'USD',
        status: 'ACTIVE',
      });

      setShowPostModal(false);
      setTitle('');
      setDescription('');
      setRequirementsText('');
      setFeedback('Job listing published successfully! Redis cache invalidated.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update application status');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Employer Management Portal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Publish jobs, review applicant submissions, and manage hiring workflows.
          </p>
        </div>

        <button onClick={() => setShowPostModal(true)} className="btn btn-primary">
          <Plus size={16} /> Post a New Job
        </button>
      </div>

      {feedback && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
        }}>
          <CheckCircle size={16} />
          {feedback}
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            <Briefcase size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Jobs</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{jobs.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981', marginBottom: '0.5rem' }}>
            <Users size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Applicants</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{applications.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#06b6d4', marginBottom: '0.5rem' }}>
            <Building2 size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Companies</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{companies.length}</div>
        </div>
      </div>

      {/* Applications Review Table */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          Applicant Pipeline ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No applicant submissions received yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Candidate</th>
                  <th style={{ padding: '0.75rem' }}>Applied Position</th>
                  <th style={{ padding: '0.75rem' }}>Resume</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600 }}>{app.applicant_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.applicant_email}</div>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                      {app.job_title || 'Software Role'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <a
                        href={app.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        View Resume
                      </a>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                        style={{
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-card)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.35rem 0.5rem',
                          fontSize: '0.8rem',
                        }}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="REVIEWED">REVIEWED</option>
                        <option value="INTERVIEWING">INTERVIEWING</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Posted Jobs Management */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          Managed Job Listings ({jobs.length})
        </h2>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {jobs.map((j) => (
            <div
              key={j.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{j.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {j.company_name} • {j.location} • {j.type} • Status: {j.status}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleDeleteJob(j.id)}
                  className="btn btn-danger"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                  title="Delete Job"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Job Modal */}
      {showPostModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 15, 29, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div className="glass-panel animate-fade-in" style={{
            maxWidth: '620px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Post a New Position</h2>

            <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Company
                </label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="input-field"
                  required
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead SRE Engineer"
                  className="input-field"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Description
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe role responsibilities, tech stack, and team..."
                  className="input-field"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Requirements (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Kubernetes\nTerraform\nPrometheus & Grafana"
                  className="input-field"
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Employment Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Min Salary ($)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Max Salary ($)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowPostModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Publishing...' : 'Publish Job Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
