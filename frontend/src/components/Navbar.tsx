import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Shield, Server, Bookmark, LogOut, User as UserIcon, LogIn } from 'lucide-react';

interface Props {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<Props> = ({ currentView, setCurrentView, onOpenAuth }) => {
  const { user, logout, quickLogin } = useAuth();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(10, 15, 29, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div className="container navbar-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        minHeight: '4.5rem',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        gap: '0.75rem',
      }}>
        {/* Brand */}
        <div
          onClick={() => setCurrentView('browse')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
          }}>
            <Briefcase size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>NexHire</span>
              <span className="badge badge-type" style={{ fontSize: '0.65rem' }}>DevSecOps</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cloud Talent & Engineering Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentView('browse')}
            className="btn btn-secondary"
            style={{
              backgroundColor: currentView === 'browse' ? 'var(--bg-surface-hover)' : 'transparent',
              borderColor: currentView === 'browse' ? 'var(--primary)' : 'transparent',
            }}
          >
            Browse Jobs
          </button>

          {user && (
            <button
              onClick={() => setCurrentView('saved')}
              className="btn btn-secondary"
              style={{
                backgroundColor: currentView === 'saved' ? 'var(--bg-surface-hover)' : 'transparent',
                borderColor: currentView === 'saved' ? 'var(--primary)' : 'transparent',
              }}
            >
              <Bookmark size={16} />
              Saved
            </button>
          )}

          {user && (user.role === 'EMPLOYER' || user.role === 'ADMIN') && (
            <button
              onClick={() => setCurrentView('employer')}
              className="btn btn-secondary"
              style={{
                backgroundColor: currentView === 'employer' ? 'var(--bg-surface-hover)' : 'transparent',
                borderColor: currentView === 'employer' ? 'var(--primary)' : 'transparent',
              }}
            >
              <Server size={16} />
              Employer Portal
            </button>
          )}

          {user && user.role === 'ADMIN' && (
            <button
              onClick={() => setCurrentView('admin')}
              className="btn btn-secondary"
              style={{
                backgroundColor: currentView === 'admin' ? 'var(--bg-surface-hover)' : 'transparent',
                borderColor: currentView === 'admin' ? 'var(--primary)' : 'transparent',
              }}
            >
              <Shield size={16} />
              Admin
            </button>
          )}
        </nav>

        {/* Right side: Recruiter Quick Demo & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Recruiter 1-Click Fast Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0 0.5rem', fontWeight: 600 }}>
              DEMO:
            </span>
            <button
              onClick={() => quickLogin('ADMIN')}
              className="btn"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'transparent', color: '#f59e0b' }}
              title="1-Click Login as Administrator"
            >
              Admin
            </button>
            <button
              onClick={() => quickLogin('EMPLOYER')}
              className="btn"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'transparent', color: '#818cf8' }}
              title="1-Click Login as Employer"
            >
              Employer
            </button>
            <button
              onClick={() => quickLogin('USER')}
              className="btn"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'transparent', color: '#10b981' }}
              title="1-Click Login as Candidate"
            >
              Candidate
            </button>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.full_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</div>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary"
                title="Logout"
                style={{ padding: '0.5rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn btn-primary">
              <LogIn size={16} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
