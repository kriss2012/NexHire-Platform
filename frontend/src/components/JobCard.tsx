import React from 'react';
import { Job } from '../types';
import { MapPin, DollarSign, Bookmark, ArrowUpRight, Globe, CheckCircle2, Shield } from 'lucide-react';

interface Props {
  job: Job;
  isSaved?: boolean;
  onSelect: (job: Job) => void;
  onToggleSave?: (jobId: string, e: React.MouseEvent) => void;
  onApply: (job: Job, e: React.MouseEvent) => void;
}

export const JobCard: React.FC<Props> = ({ job, isSaved, onSelect, onToggleSave, onApply }) => {
  const formatSalary = (min?: number, max?: number, curr = 'USD') => {
    if (!min && !max) return 'Competitive Equity';
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 });
    if (min !== undefined && max !== undefined) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min !== undefined) return `From ${formatter.format(min)}`;
    if (max !== undefined) return `Up to ${formatter.format(max)}`;
    return 'Competitive Equity';
  };

  return (
    <div
      onClick={() => onSelect(job)}
      className="glass-panel glass-panel-hover"
      style={{
        padding: '1.6rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1.2rem',
        position: 'relative',
      }}
    >
      <div>
        {/* Header: Company Logo & Info & Bookmark */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={job.company_name}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
                }}
              />
            ) : (
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(0, 194, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: 'var(--cyan)',
                border: '1px solid rgba(0, 194, 255, 0.3)',
                boxShadow: '0 0 15px rgba(0, 194, 255, 0.15)',
              }}>
                {(job.company_name || 'NX').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}>
                  {job.title}
                </h3>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginTop: '0.2rem',
              }}>
                <span>{job.company_name || 'Enterprise Cloud Partner'}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                <span className="mono-tag" style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Shield size={11} /> VERIFIED PARTNER
                </span>
              </p>
            </div>
          </div>

          {onToggleSave && (
            <button
              onClick={(e) => onToggleSave(job.id, e)}
              className="btn btn-secondary"
              style={{
                padding: '0.5rem',
                color: isSaved ? '#fbbf24' : 'var(--text-muted)',
                borderColor: isSaved ? 'rgba(251, 191, 36, 0.5)' : 'var(--border-subtle)',
                backgroundColor: isSaved ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                borderRadius: 'var(--radius-full)',
              }}
              title={isSaved ? 'Remove from bookmarks' : 'Save position'}
            >
              <Bookmark size={17} fill={isSaved ? '#fbbf24' : 'none'} />
            </button>
          )}
        </div>

        {/* Tags & Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginTop: '1.1rem' }}>
          {job.is_remote && (
            <span className="badge badge-remote">
              <Globe size={11} /> REMOTE
            </span>
          )}
          <span className="badge badge-type">
            {job.type.replace('_', ' ')}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            padding: '0.2rem 0.6rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
          }}>
            <MapPin size={12} /> {job.location}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.78rem',
            color: 'var(--cyan)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            backgroundColor: 'rgba(0, 194, 255, 0.08)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(0, 194, 255, 0.25)',
          }}>
            <DollarSign size={12} /> {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
          marginTop: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.6',
        }}>
          {job.description}
        </p>

        {/* Requirements Preview Chips */}
        {job.requirements && job.requirements.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
            marginTop: '0.85rem',
          }}>
            {job.requirements.slice(0, 3).map((req, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <CheckCircle2 size={11} color="var(--cyan)" />
                {req.length > 45 ? req.slice(0, 45) + '...' : req}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Action Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '1rem',
        marginTop: '0.25rem',
      }}>
        <span className="mono-tag" style={{ fontSize: '0.72rem' }}>
          POSTED {new Date(job.created_at).toLocaleDateString()}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(job);
            }}
            className="btn btn-secondary"
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            INSPECT ROLE
          </button>
          <button
            onClick={(e) => onApply(job, e)}
            className="btn btn-primary"
            style={{
              padding: '0.45rem 1.1rem',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            APPLY NOW <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
