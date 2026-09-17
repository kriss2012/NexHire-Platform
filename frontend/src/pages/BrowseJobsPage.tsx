import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { api } from '../services/api';
import { JobCard } from '../components/JobCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { ApplicationModal } from '../components/ApplicationModal';
import { Sparkles, Database, RefreshCw, Zap } from 'lucide-react';

interface Props {
  onSelectJob: (job: Job) => void;
  savedJobIds: Set<string>;
  onToggleSave: (jobId: string, e: React.MouseEvent) => void;
  onRequireAuth: () => void;
}

export const BrowseJobsPage: React.FC<Props> = ({ onSelectJob, savedJobIds, onToggleSave, onRequireAuth }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [activeApplyingJob, setActiveApplyingJob] = useState<Job | null>(null);

  const [filters, setFilters] = useState({
    q: '',
    location: '',
    type: '',
    is_remote: undefined as boolean | undefined,
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.location) params.append('location', filters.location);
      if (filters.type) params.append('type', filters.type);
      if (filters.is_remote !== undefined) params.append('is_remote', String(filters.is_remote));
      params.append('page', String(page));
      params.append('limit', '6');

      const res = await api.get<{
        success: boolean;
        data: { jobs: Job[]; total: number; cached: boolean };
      }>(`/jobs?${params.toString()}`);

      setJobs(res.data.jobs || []);
      setTotal(res.data.total || 0);
      setIsCached(!!res.data.cached);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 250);
    return () => clearTimeout(timer);
  }, [filters, page]);

  const handleResetFilters = () => {
    setFilters({ q: '', location: '', type: '', is_remote: undefined });
    setPage(1);
  };

  const handleApplyClick = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveApplyingJob(job);
  };

  const totalPages = Math.ceil(total / 6) || 1;

  return (
    <main className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 1rem 3.5rem',
        position: 'relative',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.85rem',
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          color: '#818cf8',
          marginBottom: '1rem',
          fontWeight: 600,
        }}>
          <Sparkles size={14} /> NexHire Cloud & DevSecOps Platform
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 800,
          lineHeight: '1.2',
          maxWidth: '850px',
          margin: '0 auto 1rem',
          letterSpacing: '-0.03em',
        }}>
          Discover Premier <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>DevSecOps & Cloud</span> Engineering Roles
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          maxWidth: '620px',
          margin: '0 auto 1.5rem',
        }}>
          Enterprise career platform backed by PostgreSQL, Redis caching, robust REST API, and production observability.
        </p>

        {/* Live Redis Cache indicator */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isCached ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            color: isCached ? '#10b981' : '#818cf8',
            border: `1px solid ${isCached ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
            fontWeight: 600,
          }}>
            {isCached ? <Zap size={13} /> : <Database size={13} />}
            Redis Cache: {isCached ? 'HIT' : 'MISS (PostgreSQL Query)'}
          </span>
          <button
            onClick={() => fetchJobs()}
            className="btn btn-secondary"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            title="Refresh from server"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </section>

      {/* Main Grid: Filters + Job Cards */}
      <div className="jobs-layout-grid">
        <FilterSidebar
          filters={filters}
          onChange={(up) => { setFilters({ ...filters, ...up }); setPage(1); }}
          onReset={handleResetFilters}
          totalResults={total}
        />

        <div>
          {loading ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-panel" style={{ height: '140px', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No matching jobs found</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Try adjusting your search criteria or resetting filters.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.has(job.id)}
                  onSelect={onSelectJob}
                  onToggleSave={onToggleSave}
                  onApply={handleApplyClick}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1.5rem',
                }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0 0.5rem' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {activeApplyingJob && (
        <ApplicationModal
          job={activeApplyingJob}
          onClose={() => setActiveApplyingJob(null)}
          onSuccess={() => {
            setActiveApplyingJob(null);
            alert('Application successfully submitted! View it in your dashboard.');
          }}
        />
      )}
    </main>
  );
};
