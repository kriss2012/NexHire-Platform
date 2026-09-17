import React from 'react';
import { Job } from '../types';
import { MapPin, DollarSign, Bookmark, ArrowRight, Globe } from 'lucide-react';

interface Props {
  job: Job;
  isSaved?: boolean;
  onSelect: (job: Job) => void;
  onToggleSave?: (jobId: string, e: React.MouseEvent) => void;
  onApply: (job: Job, e: React.MouseEvent) => void;
}

export const JobCard: React.FC<Props> = ({ job, isSaved, onSelect, onToggleSave, onApply }) => {
  const formatSalary = (min?: number, max?: number, curr = 'USD') => {
    if (!min && !max) return 'Competitive';
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 });
    if (min !== undefined && max !== undefined) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min !== undefined) return `From ${formatter.format(min)}`;
    if (max !== undefined) return `Up to ${formatter.format(max)}`;
    return 'Competitive';
  };

  return (
    <div
      onClick={() => onSelect(job)}
      className="glass-panel glass-panel-hover"
      style={{
        padding: '1.5rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <div>
        {/* Header: Company Logo & Info & Bookmark */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={job.company_name}
                style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: 'var(--primary)',
                border: '1px solid var(--border-subtle)',
              }}>
                {(job.company_name || 'JB').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {job.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {job.company_name || 'Innovative Cloud Co'}
              </p>
            </div>
          </div>

          {onToggleSave && (
            <button
              onClick={(e) => onToggleSave(job.id, e)}
              className="btn btn-secondary"
              style={{
                padding: '0.5rem',
                color: isSaved ? '#f59e0b' : 'var(--text-muted)',
                borderColor: isSaved ? 'rgba(245, 158, 11, 0.4)' : 'transparent',
              }}
              title={isSaved ? 'Remove from bookmarks' : 'Save job'}
            >
              <Bookmark size={18} fill={isSaved ? '#f59e0b' : 'none'} />
            </button>
          )}
        </div>

        {/* Tags & Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
          {job.is_remote && (
            <span className="badge badge-remote">
              <Globe size={12} /> Remote
            </span>
          )}
          <span className="badge badge-type">
            {job.type.replace('_', ' ')}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            padding: '0.2rem 0.5rem',
          }}>
            <MapPin size={14} /> {job.location}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.8rem',
            color: '#10b981',
            fontWeight: 600,
            padding: '0.2rem 0.5rem',
          }}>
            <DollarSign size={14} /> {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
          </span>
        </div>

        {/* Short Description */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginTop: '0.875rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.5',
        }}>
          {job.description}
        </p>
      </div>

      {/* Footer: Action Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '0.875rem',
        marginTop: '0.5rem',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Posted {new Date(job.created_at).toLocaleDateString()}
        </span>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={(e) => onApply(job, e)}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
          >
            Apply <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
