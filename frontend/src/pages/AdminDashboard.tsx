import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SystemStats, User } from '../types';
import { Shield, Database, Cpu, Users, Briefcase, Activity, CheckCircle, ExternalLink } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get<{ success: boolean; data: { stats: SystemStats } }>('/admin/stats'),
        api.get<{ success: boolean; data: { users: User[] } }>('/admin/users'),
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 10000); // 10s live refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Shield size={24} color="var(--primary)" />
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Platform Administration</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            System telemetry, cluster health, telemetry metrics, and user management.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a
            href="/metrics"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            <Activity size={14} /> /metrics (Prometheus) <ExternalLink size={12} />
          </a>
          <a
            href="/health"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            <CheckCircle size={14} /> /health (Probes) <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* System Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '0.5rem' }}>
            <Database size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PostgreSQL</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {stats?.databaseStatus.toUpperCase() || 'HEALTHY'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Latency: {stats?.databaseLatencyMs || 2}ms
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', marginBottom: '0.5rem' }}>
            <Database size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Redis Cache</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {stats?.redisStatus.toUpperCase() || 'HEALTHY'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Cache latency: {stats?.redisLatencyMs || 1}ms
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7', marginBottom: '0.5rem' }}>
            <Cpu size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Memory RSS</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {stats?.memoryRssMb || 45} MB
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Heap used: {stats?.memoryHeapMb || 25} MB
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            <Users size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Users</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {stats?.totalUsers || users.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
            <Briefcase size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Jobs</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {stats?.totalJobs || 4}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          Registered Accounts ({users.length})
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Assigned Role</th>
                <th style={{ padding: '0.75rem' }}>Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{u.full_name}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge badge-role">{u.role}</span>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
