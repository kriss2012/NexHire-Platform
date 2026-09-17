import React from 'react';
import { Search, MapPin, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface FilterState {
  q: string;
  location: string;
  type: string;
  is_remote: boolean | undefined;
}

interface Props {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  totalResults: number;
}

export const FilterSidebar: React.FC<Props> = ({ filters, onChange, onReset, totalResults }) => {
  const jobTypes = [
    { label: 'All Types', value: '' },
    { label: 'Full Time', value: 'FULL_TIME' },
    { label: 'Contract', value: 'CONTRACT' },
    { label: 'Part Time', value: 'PART_TIME' },
    { label: 'Internship', value: 'INTERNSHIP' },
  ];

  return (
    <aside className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
          <SlidersHorizontal size={18} color="var(--primary)" />
          Filters
        </div>
        <button
          onClick={onReset}
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          title="Reset Filters"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* Keyword Search */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          Search Keywords
        </label>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Kubernetes, AWS, Go..."
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          Location
        </label>
        <div style={{ position: 'relative' }}>
          <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="e.g. San Francisco, Austin..."
            value={filters.location}
            onChange={(e) => onChange({ location: e.target.value })}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
      </div>

      {/* Remote Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Remote Only</span>
        <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
          <input
            type="checkbox"
            checked={!!filters.is_remote}
            onChange={(e) => onChange({ is_remote: e.target.checked ? true : undefined })}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: filters.is_remote ? 'var(--primary)' : 'var(--bg-surface-hover)',
            borderRadius: '22px',
            transition: 'var(--transition-fast)',
          }}>
            <span style={{
              position: 'absolute',
              height: '16px',
              width: '16px',
              left: filters.is_remote ? '21px' : '3px',
              bottom: '3px',
              backgroundColor: 'white',
              borderRadius: '50%',
              transition: 'var(--transition-fast)',
            }} />
          </span>
        </label>
      </div>

      {/* Employment Type Radios */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
          Employment Type
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {jobTypes.map((t) => (
            <label
              key={t.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: filters.type === t.value ? 'var(--bg-surface-hover)' : 'transparent',
                color: filters.type === t.value ? 'var(--primary)' : 'var(--text-secondary)',
              }}
            >
              <input
                type="radio"
                name="employmentType"
                checked={filters.type === t.value}
                onChange={() => onChange({ type: t.value })}
                style={{ accentColor: 'var(--primary)' }}
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {/* Count display */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
      }}>
        Showing <strong style={{ color: 'var(--text-primary)' }}>{totalResults}</strong> matching roles
      </div>
    </aside>
  );
};
