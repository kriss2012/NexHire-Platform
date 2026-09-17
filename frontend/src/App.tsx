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

      {/* Global DevSecOps Architecture Footer */}
      <footer style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '3rem 1.5rem',
        marginTop: 'auto',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              <Layers size={20} color="var(--primary)" />
              <span>JobBoard Cloud Platform</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Built to demonstrate production cloud-native engineering: Kubernetes, Terraform, ArgoCD, Helm, DevSecOps, and full-stack TypeScript.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Architecture Flow</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>• GitHub Actions CI/CD</li>
              <li>• Gitleaks & Trivy Scan</li>
              <li>• AWS ECR & EKS Cluster</li>
              <li>• ArgoCD GitOps Sync</li>
              <li>• Canary Progressive Delivery</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Observability</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><a href="/metrics" target="_blank" style={{ color: 'var(--primary)' }}>• Prometheus (/metrics)</a></li>
              <li><a href="/health" target="_blank" style={{ color: 'var(--primary)' }}>• Health Check (/health)</a></li>
              <li>• Grafana Dashboards</li>
              <li>• Loki Structured Logs</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Security Standards</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>• Non-root multi-stage containers</li>
              <li>• NetworkPolicies Zero-Trust</li>
              <li>• GitHub Actions OIDC (No static keys)</li>
              <li>• Syft SBOM Generation</li>
            </ul>
          </div>
        </div>

        <div className="container" style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          gap: '1rem',
        }}>
          <div>© 2026 JobBoard DevSecOps Platform. All systems operational.</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Branch: main</span>
            <span>Image Tag: Git SHA</span>
            <span>Namespace: jobboard</span>
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
