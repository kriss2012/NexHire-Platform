import React from 'react';
import { Job } from '../types';
import { ArrowLeft, MapPin, DollarSign, Globe, CheckCircle2, Bookmark, Send, Building2 } from 'lucide-react';

interface Props {
  job: Job;
  isSaved?: boolean;
  onBack: () => void;
  onApply: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
}

export const JobDetailPage: React.FC<Props> = ({ job, isSaved, onBack, onApply, onToggleSave }) => {
  const formatSalary = (min?: number, max?: number, curr = 'USD') => {
    if (!min && !max) return 'Competitive compensation package';
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 });
    if (min !== undefined && max !== undefined) return `${formatter.format(min)} - ${formatter.format(max)} / year`;
    if (min !== undefined) return `From ${formatter.format(min)} / year`;
    if (max !== undefined) return `Up to ${formatter.format(max)} / year`;
    return 'Competitive compensation package';
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <button
        onClick={onBack}
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Listings
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        {/* Main Job Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <span className="badge badge-type" style={{ marginBottom: '0.75rem' }}>
                  {job.type.replace('_', ' ')}
                </span>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {job.title}
                </h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building2 size={16} color="var(--primary)" /> {job.company_name}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={16} /> {job.location}
                  </span>
                  {job.is_remote && (
                    <span className="badge badge-remote">
                      <Globe size={12} /> 100% Remote
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => onToggleSave(job.id)}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.75rem',
                    color: isSaved ? '#f59e0b' : 'var(--text-muted)',
                    borderColor: isSaved ? 'rgba(245, 158, 11, 0.4)' : 'transparent',
                  }}
                  title={isSaved ? 'Remove Bookmark' : 'Bookmark Job'}
                >
                  <Bookmark size={20} fill={isSaved ? '#f59e0b' : 'none'} />
                </button>
                <button onClick={() => onApply(job)} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                  <Send size={16} /> Apply Now
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem 1.25rem',
              marginTop: '1.5rem',
              color: '#10b981',
              fontWeight: 700,
            }}>
              <DollarSign size={20} />
              Estimated Compensation: {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              About the Role
            </h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {job.description}
            </div>
          </div>

          {/* Requirements Checklist */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                Key Technical Requirements
              </h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {job.requirements.map((req, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Company Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              About the Company
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
              {job.company_logo ? (
                <img
                  src={job.company_logo}
                  alt={job.company_name}
                  style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  color: 'var(--primary)',
                }}>
                  {(job.company_name || 'JB').substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{job.company_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Cloud Employer</div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Specialized cloud-native company building scalable infrastructure, microservices, and distributed Kubernetes systems.
            </p>

            <button
              onClick={() => onApply(job)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Apply for this Position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
