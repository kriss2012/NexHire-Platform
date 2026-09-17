import React, { useState } from 'react';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, CheckCircle, Send, AlertCircle, FileText } from 'lucide-react';

interface Props {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplicationModal: React.FC<Props> = ({ job, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [applicantName, setApplicantName] = useState(user?.full_name || '');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || '');
  const [resumeUrl, setResumeUrl] = useState('https://storage.jobboard.io/resumes/my-resume.pdf');
  const [coverLetter, setCoverLetter] = useState(
    'I am excited to submit my application for this position. My experience aligns closely with your cloud and platform engineering stack.'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post(`/jobs/${job.id}/apply`, {
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        resume_url: resumeUrl,
        cover_letter: coverLetter,
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 15, 29, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '2rem',
        position: 'relative',
        boxShadow: 'var(--shadow-glow)',
      }}>
        <button
          onClick={onClose}
          className="btn btn-secondary"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', padding: '0.4rem' }}
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle size={56} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Application Submitted!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Your application for <strong>{job.title}</strong> has been received by {job.company_name}.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="badge badge-type" style={{ marginBottom: '0.5rem' }}>Applying to</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{job.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{job.company_name}</p>
            </div>

            {error && (
              <div style={{
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#f43f5e',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
              }}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Resume Link / URL
                </label>
                <div style={{ position: 'relative' }}>
                  <FileText size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="url"
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.25rem' }}
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Cover Letter / Note to Employer
                </label>
                <textarea
                  rows={4}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Submitting...' : <><Send size={16} /> Submit Application</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
