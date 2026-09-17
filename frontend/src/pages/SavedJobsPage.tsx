import React, { useState, useEffect } from 'react';
import { Job, SavedJob } from '../types';
import { api } from '../services/api';
import { JobCard } from '../components/JobCard';
import { ApplicationModal } from '../components/ApplicationModal';
import { Bookmark, ArrowLeft } from 'lucide-react';

interface Props {
  onSelectJob: (job: Job) => void;
  onBack: () => void;
  onToggleSave: (jobId: string, e: React.MouseEvent) => void;
}

export const SavedJobsPage: React.FC<Props> = ({ onSelectJob, onBack, onToggleSave }) => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApplyingJob, setActiveApplyingJob] = useState<Job | null>(null);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: { savedJobs: SavedJob[] } }>('/saved-jobs');
      setSavedJobs(res.data.savedJobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleApplyClick = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveApplyingJob(job);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      <button
        onClick={onBack}
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Browse
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Bookmark size={28} color="#f59e0b" fill="#f59e0b" />
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Bookmarked Opportunities</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Saved jobs you are tracking.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[1, 2].map((n) => (
            <div key={n} className="glass-panel" style={{ height: '140px', opacity: 0.5 }} />
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Bookmark size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No bookmarked jobs yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Browse open positions and click the bookmark icon to save them for later.
          </p>
          <button onClick={onBack} className="btn btn-primary">
            Explore Open Roles
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {savedJobs.map((s) =>
            s.job ? (
              <JobCard
                key={s.id}
                job={s.job}
                isSaved={true}
                onSelect={onSelectJob}
                onToggleSave={onToggleSave}
                onApply={handleApplyClick}
              />
            ) : null
          )}
        </div>
      )}

      {activeApplyingJob && (
        <ApplicationModal
          job={activeApplyingJob}
          onClose={() => setActiveApplyingJob(null)}
          onSuccess={() => {
            setActiveApplyingJob(null);
            alert('Application submitted successfully!');
          }}
        />
      )}
    </div>
  );
};
