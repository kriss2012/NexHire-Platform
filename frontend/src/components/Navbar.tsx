import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Shield, Server, Bookmark, LogOut, LogIn, Cpu, Activity } from 'lucide-react';

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
      backgroundColor: 'rgba(5, 5, 5, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      {/* Top Cyber Telemetry Strip */}
      <div style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '0.3rem 1.5rem',
        fontSize: '0.68rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
            <span className="pulse-dot" /> SYSTEM ONLINE
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span>REGION: US-WEST</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span>CLUSTER: K8S v1.30</span>
        </div>
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem', md: { display: 'flex' } }}>
          <span style={{ color: 'var(--cyan)' }}>LIVE PRODUCTION</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span>CANARY: 100% HEALTHY</span>
        </div>
      </div>

      <div className="container navbar-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        minHeight: '4.5rem',
        paddingTop: '0.6rem',
        paddingBottom: '0.6rem',
        gap: '1rem',
      }}>
        {/* Brand */}
        <div
          onClick={() => setCurrentView('browse')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '2.6rem',
            height: '2.6rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(0, 194, 255, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
            border: '1px solid rgba(0, 194, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 194, 255, 0.3)',
          }}>
            <Cpu size={22} color="var(--cyan)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                fontFamily: 'var(--font-display)',
                color: '#ffffff',
              }}>
                NexHire
              </span>
              <span className="badge badge-type" style={{ fontSize: '0.65rem' }}>
                v1.0.0 PROD
              </span>
            </div>
            <p className="mono-tag" style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.4)' }}>
              CLOUD & DEVSECOPS ECOSYSTEM
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setCurrentView('browse')}
            className={`btn ${currentView === 'browse' ? 'btn-cyber' : 'btn-secondary'}`}
            style={{
              padding: '0.5rem 1.1rem',
              borderColor: currentView === 'browse' ? 'var(--cyan)' : 'transparent',
            }}
          >
            Browse Pipelines
          </button>

          {user && (
            <button
              onClick={() => setCurrentView('saved')}
              className={`btn ${currentView === 'saved' ? 'btn-cyber' : 'btn-secondary'}`}
              style={{
                padding: '0.5rem 1.1rem',
                borderColor: currentView === 'saved' ? 'var(--cyan)' : 'transparent',
              }}
            >
              <Bookmark size={15} />
              Saved
            </button>
          )}

          {user && (user.role === 'EMPLOYER' || user.role === 'ADMIN') && (
            <button
              onClick={() => setCurrentView('employer')}
              className={`btn ${currentView === 'employer' ? 'btn-cyber' : 'btn-secondary'}`}
              style={{
                padding: '0.5rem 1.1rem',
                borderColor: currentView === 'employer' ? 'var(--cyan)' : 'transparent',
              }}
            >
              <Server size={15} />
              Employer Portal
            </button>
          )}

          {user && user.role === 'ADMIN' && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`btn ${currentView === 'admin' ? 'btn-cyber' : 'btn-secondary'}`}
              style={{
                padding: '0.5rem 1.1rem',
                borderColor: currentView === 'admin' ? 'var(--cyan)' : 'transparent',
              }}
            >
              <Shield size={15} />
              Cluster Telemetry
            </button>
          )}
        </nav>

        {/* Right side: Recruiter Quick Demo & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Recruiter 1-Click Fast Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            padding: '0.2rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
          }}>
            <span className="mono-tag" style={{ padding: '0 0.5rem' }}>
              DEMO:
            </span>
            <button
              onClick={() => quickLogin('ADMIN')}
              className="btn"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.68rem', background: 'transparent', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}
              title="1-Click Login as Administrator"
            >
              ADMIN
            </button>
            <button
              onClick={() => quickLogin('EMPLOYER')}
              className="btn"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.68rem', background: 'transparent', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}
              title="1-Click Login as Employer"
            >
              EMPLOYER
            </button>
            <button
              onClick={() => quickLogin('USER')}
              className="btn"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.68rem', background: 'transparent', color: '#34d399', fontFamily: 'var(--font-mono)' }}
              title="1-Click Login as Candidate"
            >
              CANDIDATE
            </button>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>{user.full_name}</div>
                <div className="mono-tag" style={{ color: 'var(--cyan)' }}>{user.role}</div>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary"
                title="Logout"
                style={{ padding: '0.5rem', borderRadius: 'var(--radius-full)' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn btn-primary">
              <LogIn size={15} />
              Access Portal
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
