import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { api } from '../services/api';
import { JobCard } from '../components/JobCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { ApplicationModal } from '../components/ApplicationModal';
import { Sparkles, Database, RefreshCw, Zap, ShieldCheck, Terminal, Cpu, ArrowUpRight } from 'lucide-react';

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
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  const [filters, setFilters] = useState({
    q: '',
    location: '',
    type: '',
    is_remote: undefined as boolean | undefined,
  });

  const quickTags = [
    { label: 'ALL ROLES', q: '', is_remote: undefined },
    { label: 'KUBERNETES & EKS', q: 'Kubernetes', is_remote: undefined },
    { label: 'DEVSECOPS & SECURITY', q: 'DevSecOps', is_remote: undefined },
    { label: 'SRE & RELIABILITY', q: 'SRE', is_remote: undefined },
    { label: 'FULL STACK CLOUD', q: 'React', is_remote: undefined },
    { label: 'REMOTE ONLY', q: '', is_remote: true },
  ];

  const fetchJobs = async () => {
    setLoading(true);
    const start = performance.now();
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
      setApiLatency(Math.round(performance.now() - start));
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 200);
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
    <main className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      {/* Hero Section - Inspired by LogicLegend.in Minimalist High-Tech Aesthetic */}
      <section style={{
        textAlign: 'center',
        padding: '3.5rem 1rem 3rem',
        position: 'relative',
      }}>
        {/* Top Micro Ticker */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.4rem 1rem',
          backgroundColor: 'rgba(0, 194, 255, 0.05)',
          border: '1px solid rgba(0, 194, 255, 0.25)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.72rem',
          color: 'var(--cyan)',
          marginBottom: '1.75rem',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          boxShadow: '0 0 15px rgba(0, 194, 255, 0.15)',
        }}>
          <span className="pulse-dot-cyan" />
          <span>NEXHIRE.IO // CLOUD TALENT MOVEMENT</span>
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
          fontWeight: 800,
          lineHeight: '1.08',
          maxWidth: '920px',
          margin: '0 auto 1.25rem',
          letterSpacing: '-0.04em',
        }}>
          ENGINEER. DEPLOY. SCALE.{' '}
          <span className="gradient-text-cyan">
            LEAD.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 2.25rem',
          lineHeight: '1.6',
          fontWeight: 400,
        }}>
          The premiere talent ecosystem for Cloud Architects, Kubernetes SREs, and DevSecOps Engineers. Backed by automated observability and zero-trust engineering.
        </p>

        {/* HUD Telemetry Strip */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          maxWidth: '850px',
          margin: '0 auto 2rem',
        }}>
          <div className="hud-box" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
            <span className="pulse-dot" />
            <span style={{ color: 'var(--text-secondary)' }}>API:</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>200 OK</span>
            {apiLatency !== null && <span style={{ color: 'var(--text-muted)' }}>({apiLatency}ms)</span>}
          </div>

          <div className="hud-box" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
            {isCached ? <Zap size={14} color="var(--cyan)" /> : <Database size={14} color="#a5b4fc" />}
            <span style={{ color: 'var(--text-secondary)' }}>CACHE:</span>
            <span style={{ color: isCached ? 'var(--cyan)' : '#a5b4fc', fontWeight: 600 }}>
              {isCached ? 'REDIS HIT' : 'DB STORE'}
            </span>
          </div>

          <div className="hud-box" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span style={{ color: 'var(--text-secondary)' }}>SECURITY:</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>ZERO-TRUST</span>
          </div>

          <div className="hud-box" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
            <Cpu size={14} color="var(--cyan)" />
            <span style={{ color: 'var(--text-secondary)' }}>PIPELINES:</span>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>{total} ACTIVE</span>
          </div>

          <button
            onClick={() => fetchJobs()}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
            title="Refresh Telemetry"
          >
            <RefreshCw size={13} /> SYNC
          </button>
        </div>

        {/* Interactive Quick Filter Chips */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {quickTags.map((tag) => {
            const isActive = filters.q === tag.q && filters.is_remote === tag.is_remote;
            return (
              <button
                key={tag.label}
                onClick={() => {
                  setFilters({ ...filters, q: tag.q, is_remote: tag.is_remote });
                  setPage(1);
                }}
                className="btn"
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.08em',
                  padding: '0.4rem 0.9rem',
                  backgroundColor: isActive ? 'rgba(0, 194, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: isActive ? 'var(--cyan)' : 'var(--border-subtle)',
                  color: isActive ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.7)',
                  boxShadow: isActive ? '0 0 15px rgba(0, 194, 255, 0.3)' : 'none',
                }}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Layout Grid: Filters + Job Cards */}
      <div className="jobs-layout-grid" style={{ marginTop: '2rem' }}>
        <FilterSidebar
          filters={filters}
          onChange={(up) => { setFilters({ ...filters, ...up }); setPage(1); }}
          onReset={handleResetFilters}
          totalResults={total}
        />

        <div>
          {loading ? (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-panel" style={{ height: '160px', opacity: 0.4, animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
              <div className="mono-tag" style={{ marginBottom: '1rem', color: 'var(--cyan)' }}>
                // NO MATCHING POSITION FOUND
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#ffffff' }}>No Active Pipelines Match Filters</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.75rem', fontSize: '0.9rem' }}>
                Reset your query or explore all platform roles across Kubernetes, DevSecOps, and Cloud Architecture.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                  gap: '0.75rem',
                  marginTop: '2rem',
                }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  >
                    ← PREV
                  </button>
                  <span className="mono-tag" style={{ padding: '0 0.75rem', color: 'var(--text-primary)' }}>
                    PAGE {page} OF {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  >
                    NEXT →
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
