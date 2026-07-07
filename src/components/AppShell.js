import Sidebar from './Sidebar';
import Toast from './Toast';

export default function AppShell({ title, subtitle, actions, children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f1f3f9' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Topbar */}
        <div style={{
          padding: '18px 28px',
          background: '#fff',
          borderBottom: '1px solid #e4e7ef',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(26,39,68,0.06)',
        }}>
          <div>
            <h1 style={{ fontSize: 19, fontWeight: 700, color: '#1a1f36', margin: 0, lineHeight: 1.2 }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 13, color: '#8890a8', margin: '3px 0 0' }}>{subtitle}</p>}
          </div>
          {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
        </div>
        {/* Content */}
        <div style={{ padding: '24px 28px', flex: 1 }}>
          {children}
        </div>
      </div>
      <Toast />
    </div>
  );
}
