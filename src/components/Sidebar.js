import { useNavigate, useLocation } from 'react-router-dom';
import { useApp, ROLES } from '../context/AppContext';

const NAV = [
  { icon: '▦', label: 'Dashboard',    path: '/dashboard', roles: ['user','owner','admin'] },
  { icon: '＋', label: 'Submit entry', path: '/submit',    roles: ['user','owner','admin'] },
  { icon: '✦', label: 'Approvals',    path: '/approvals', roles: ['owner','admin'] },
  { icon: '◈', label: 'Admin',        path: '/admin',     roles: ['admin'] },
  { icon: '⚙', label: 'Settings',     path: '/settings',  roles: ['user','owner','admin'] },
];

export default function Sidebar() {
  const { role, setRole, submissions } = useApp();
  const navigate  = useNavigate();
  const location  = useLocation();
  const pending   = submissions.filter(s => s.status === 'pending').length;
  const roleInfo  = ROLES[role] || {};
  const visibleNav = NAV.filter(n => n.roles.includes(role));

  function handleLogout() { setRole(null); navigate('/'); }

  return (
    <aside style={{
      width: 230,
      background: 'linear-gradient(180deg, #1a2744 0%, #1e3060 100%)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', flexShrink: 0,
      boxShadow: '2px 0 20px rgba(26,39,68,0.18)',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #3b6fd4, #5b8fee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#fff', fontWeight: 700, flexShrink: 0,
            boxShadow: '0 2px 8px rgba(59,111,212,0.4)',
          }}>D</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Data Asset Application</div>
          </div>
        </div>
        <div style={{
          fontSize: 10, color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          paddingLeft: 44,
        }}>
          Data Estate Asset System
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 20px 12px' }} />

      {/* Nav */}
      <nav style={{ padding: '4px 10px', flex: 1 }}>
        {visibleNav.map(n => {
          const isActive  = location.pathname === n.path;
          const showBadge = n.path === '/approvals' && pending > 0;
          return (
            <button key={n.path} onClick={() => navigate(n.path)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 9,
              fontSize: 13.5, fontWeight: isActive ? 600 : 400,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              border: 'none', width: '100%', textAlign: 'left',
              marginBottom: 2, cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: isActive ? 'inset 0 0 0 1px rgba(255,255,255,0.12)' : 'none',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
            >
              <span style={{ fontSize: 15, width: 18, textAlign: 'center', opacity: isActive ? 1 : 0.7 }}>{n.icon}</span>
              {n.label}
              {showBadge && (
                <span style={{
                  marginLeft: 'auto', background: '#e85d4a', color: '#fff',
                  fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 7px',
                  boxShadow: '0 1px 4px rgba(232,93,74,0.4)',
                }}>{pending}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 20px 12px' }} />

      {/* User chip */}
      <div style={{ padding: '0 10px 20px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: `linear-gradient(135deg, ${roleInfo.color}, ${roleInfo.color}aa)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {roleInfo.label?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Current user</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{roleInfo.label}</div>
          </div>
          <button onClick={handleLogout} title="Sign out" style={{
            padding: '4px 8px', fontSize: 13, color: 'rgba(255,255,255,0.4)',
            background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >↩</button>
        </div>
      </div>
    </aside>
  );
}
