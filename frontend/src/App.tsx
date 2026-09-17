import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BrowseJobsPage } from './pages/BrowseJobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SavedJobsPage } from './pages/SavedJobsPage';
import { AuthModal } from './pages/AuthModal';
import { ApplicationModal } from './components/ApplicationModal';
import { Job, SavedJob } from './types';
import { api } from './services/api';
import { Layers, Terminal, Shield, GitBranch } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>('browse');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);

  // Fetch saved job IDs on load/auth change
  useEffect(() => {
    async function loadSaved() {
      if (!user) {
        setSavedJobIds(new Set());
        return;
      }
      try {
        const res = await api.get<{ success: boolean; data: { savedJobs: SavedJob[] } }>('/saved-jobs');
        if (res.data?.savedJobs) {
          setSavedJobIds(new Set(res.data.savedJobs.map((s) => s.job_id)));
        }
      } catch (err) {
        console.warn('Could not fetch saved jobs', err);
      }
    }
    loadSaved();
  }, [user]);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setCurrentView('job-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSave = async (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const isAlreadySaved = savedJobIds.has(jobId);
    try {
      if (isAlreadySaved) {
        await api.delete(`/jobs/${jobId}/save`);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await api.post(`/jobs/${jobId}/save`);
        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    } catch (err: any) {
      alert(err.message || 'Bookmark update failed');
    }
  };

  const handleApplyFromDetail = (job: Job) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setApplyingJob(job);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          if (view === 'browse') setSelectedJob(null);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <div style={{ flex: 1 }}>
        {currentView === 'browse' && (
          <BrowseJobsPage
            onSelectJob={handleSelectJob}
            savedJobIds={savedJobIds}
            onToggleSave={handleToggleSave}
            onRequireAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentView === 'job-detail' && selectedJob && (
          <JobDetailPage
            job={selectedJob}
            isSaved={savedJobIds.has(selectedJob.id)}
            onBack={() => setCurrentView('browse')}
            onApply={handleApplyFromDetail}
            onToggleSave={(id) => handleToggleSave(id)}
          />
        )}

        {currentView === 'employer' && <EmployerDashboard />}

        {currentView === 'admin' && <AdminDashboard />}

        {currentView === 'saved' && (
          <SavedJobsPage
            onSelectJob={handleSelectJob}
            onBack={() => setCurrentView('browse')}
            onToggleSave={handleToggleSave}
          />
        )}
      </div>

      {/* Global LogicLegend-Inspired DevSecOps Architecture Footer */}
      <footer style={{
        backgroundColor: '#050505',
        borderTop: '1px solid var(--border-subtle)',
        padding: '3.5rem 1.5rem 2rem',
        marginTop: 'auto',
        position: 'relative',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, marginBottom: '0.85rem' }}>
              <div style={{
                width: '1.8rem',
                height: '1.8rem',
                borderRadius: '6px',
                background: 'rgba(0, 194, 255, 0.15)',
                border: '1px solid var(--cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Layers size={14} color="var(--cyan)" />
              </div>
              <span style={{ fontSize: '1.15rem', color: '#ffffff', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
                NexHire Platform
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              A high-performance cloud engineering platform demonstrating multi-stage Docker builds, Kubernetes EKS zero-trust, Helm, ArgoCD GitOps, and Redis telemetry.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-remote" style={{ fontSize: '0.65rem' }}>
                <span className="pulse-dot" /> 100% OPERATIONAL
              </span>
              <span className="badge badge-type" style={{ fontSize: '0.65rem' }}>
                RENDER LIVE
              </span>
            </div>
          </div>

          <div>
            <h4 className="mono-tag" style={{ marginBottom: '1rem', color: 'var(--cyan)' }}>
              // 01. GITOPS PIPELINE
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>• GitHub Actions CI/CD Automated Test & Lint</li>
              <li>• Trivy Security & Gitleaks Deep Secret Scan</li>
              <li>• Syft Automated SBOM Generation</li>
              <li>• ArgoCD Continuous GitOps Reconciliation</li>
              <li>• Canary Progressive Rollout Engine</li>
            </ul>
          </div>

          <div>
            <h4 className="mono-tag" style={{ marginBottom: '1rem', color: 'var(--cyan)' }}>
              // 02. OBSERVABILITY
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>
                <a href="/metrics" target="_blank" style={{ color: 'var(--cyan)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  • Prometheus Live Metrics (/metrics)
                </a>
              </li>
              <li>
                <a href="/health" target="_blank" style={{ color: 'var(--cyan)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  • Health Probes API (/health)
                </a>
              </li>
              <li>• Redis Cache Hit/Miss Telemetry</li>
              <li>• Winston Structured JSON Logging</li>
            </ul>
          </div>

          <div>
            <h4 className="mono-tag" style={{ marginBottom: '1rem', color: 'var(--cyan)' }}>
              // 03. ARCHITECTURE
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>• Non-Root Alpine Container Architecture</li>
              <li>• Kubernetes NetworkPolicies Zero-Trust</li>
              <li>• Horizontal Pod Autoscaler (HPA 70% CPU)</li>
              <li>• High-Frequency In-Memory Database Fallback</li>
            </ul>
          </div>
        </div>

        <div className="container" style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          gap: '1rem',
          fontFamily: 'var(--font-mono)',
        }}>
          <div>© 2026 NEXHIRE.IO — LEARN. BUILD. EXPERIMENT. LEAD.</div>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span>HOST: RENDER PROD</span>
            <span>REGION: US-WEST</span>
            <span>CLUSTER: K8S v1.30</span>
            <span style={{ color: 'var(--cyan)' }}>LIVE: ONLINE</span>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {applyingJob && (
        <ApplicationModal
          job={applyingJob}
          onClose={() => setApplyingJob(null)}
          onSuccess={() => {
            setApplyingJob(null);
            alert('Application submitted successfully!');
          }}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
