import React from 'react';
import { ApplicationStatus } from '../types';

interface Props {
  status: ApplicationStatus;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const styles: Record<ApplicationStatus, { bg: string; color: string; border: string }> = {
    PENDING: {
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.3)',
    },
    REVIEWED: {
      bg: 'rgba(99, 102, 241, 0.15)',
      color: '#818cf8',
      border: 'rgba(99, 102, 241, 0.3)',
    },
    INTERVIEWING: {
      bg: 'rgba(6, 182, 212, 0.15)',
      color: '#06b6d4',
      border: 'rgba(6, 182, 212, 0.3)',
    },
    ACCEPTED: {
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#10b981',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    REJECTED: {
      bg: 'rgba(244, 63, 94, 0.15)',
      color: '#f43f5e',
      border: 'rgba(244, 63, 94, 0.3)',
    },
  };

  const current = styles[status] || styles.PENDING;

  return (
    <span
      className="badge"
      style={{
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
      }}
    >
      {status}
    </span>
  );
};
