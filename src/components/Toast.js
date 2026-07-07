import { useApp } from '../context/AppContext';

const STYLES = {
  success: { bg: '#e8f5e9', color: '#0F6E56', icon: '✓' },
  error:   { bg: '#fff5f0', color: '#D85A30', icon: '✕' },
  info:    { bg: '#eff6ff', color: '#2563eb', icon: 'ℹ' },
};

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  const s = STYLES[toast.type] || STYLES.success;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}44`,
      borderRadius: 8, padding: '10px 16px',
      fontSize: 13, fontWeight: 500, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <span>{s.icon}</span>
      {toast.msg}
    </div>
  );
}
