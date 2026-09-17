import React from 'react';
import { Search, MapPin, SlidersHorizontal, RotateCcw, Globe, Check, Radio } from 'lucide-react';

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
    { label: 'ALL PIPELINES', value: '' },
    { label: 'FULL TIME', value: 'FULL_TIME' },
    { label: 'CONTRACT / ADVISORY', value: 'CONTRACT' },
    { label: 'PART TIME', value: 'PART_TIME' },
    { label: 'INTERNSHIP & FELLOWSHIP', value: 'INTERNSHIP' },
  ];

  return (
    <aside className="glass-panel" style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>
          <SlidersHorizontal size={17} color="var(--cyan)" />
          <span>FILTER MATRIX</span>
        </div>
        <button
          onClick={onReset}
          className="btn btn-secondary"
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}
          title="Reset All Parameters"
        >
          <RotateCcw size={12} /> RESET
        </button>
      </div>

      {/* Results HUD */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 0.85rem',
        backgroundColor: 'rgba(0, 194, 255, 0.05)',
        border: '1px solid rgba(0, 194, 255, 0.2)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)',
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>MATCHED PIPELINES:</span>
        <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{totalResults}</span>
      </div>

      {/* Keyword Search */}
      <div>
        <label className="mono-tag" style={{ display: 'block', marginBottom: '0.5rem' }}>
          // 01. QUERY KEYWORDS
        </label>
        <div style={{ position: 'relative' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Kubernetes, Terraform, AWS, Go..."
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            style={{ paddingLeft: '2.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <label className="mono-tag" style={{ display: 'block', marginBottom: '0.5rem' }}>
          // 02. GEOGRAPHIC REGION
        </label>
        <div style={{ position: 'relative' }}>
          <MapPin size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="San Francisco, Austin, Remote..."
            value={filters.location}
            onChange={(e) => onChange({ location: e.target.value })}
            style={{ paddingLeft: '2.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Remote Toggle */}
      <div>
        <label className="mono-tag" style={{ display: 'block', marginBottom: '0.5rem' }}>
          // 03. WORKPLACE PROTOCOL
        </label>
        <div
          onClick={() => onChange({ is_remote: filters.is_remote ? undefined : true })}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: filters.is_remote ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${filters.is_remote ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={15} color={filters.is_remote ? '#34d399' : 'var(--text-muted)'} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: filters.is_remote ? '#34d399' : 'var(--text-primary)' }}>
              100% REMOTE ONLY
            </span>
          </div>
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            border: `1px solid ${filters.is_remote ? '#10b981' : 'var(--border-subtle)'}`,
            backgroundColor: filters.is_remote ? '#10b981' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {filters.is_remote && <Check size={12} color="#050505" strokeWidth={3} />}
          </div>
        </div>
      </div>

      {/* Job Type Radio List */}
      <div>
        <label className="mono-tag" style={{ display: 'block', marginBottom: '0.6rem' }}>
          // 04. ENGAGEMENT TYPE
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {jobTypes.map((t) => {
            const isSelected = filters.type === t.value;
            return (
              <div
                key={t.value}
                onClick={() => onChange({ type: t.value })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'rgba(0, 194, 255, 0.08)' : 'transparent',
                  border: `1px solid ${isSelected ? 'rgba(0, 194, 255, 0.3)' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: `1px solid ${isSelected ? 'var(--cyan)' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--cyan)' }} />}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 600 : 400,
                }}>
                  {t.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
