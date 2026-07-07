import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, ROLES } from '../context/AppContext';

const ICONS = { user: '👤', owner: '🗄️', admin: '🛡️' };

export default function Login() {
  const [selected, setSelected] = useState(null);
  const { setRole } = useApp();
  const navigate = useNavigate();

  function handleLogin() {
    if (!selected) return;
    setRole(selected);
    navigate('/dashboard');
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #1a2744 0%, #1e3060 50%, #243875 100%)',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px',
        color: '#fff',
      }}>
        <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 12, lineHeight: 1.15 }}>
          Data Asset<br />Application
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', maxWidth: 340, lineHeight: 1.7, marginBottom: 40 }}>
          A centralized platform for managing, submitting, and approving data assets across all directorates.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '📊', text: 'Real-time asset dashboard with various charts' },
            { icon: '✅', text: 'Submission and approval workflow' },
            { icon: '🔐', text: 'Role-based access control' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{icon}</div>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: 460, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f1f3f9', padding: '40px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1f36', marginBottom: 6 }}>Sign in</h2>
          <p style={{ fontSize: 14, color: '#8890a8', marginBottom: 28 }}>Select your role to continue to the application</p>

          {Object.entries(ROLES).map(([key, r]) => (
            <div key={key} onClick={() => setSelected(key)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px',
              border: `1.5px solid ${selected === key ? '#3b6fd4' : '#e4e7ef'}`,
              borderRadius: 12, marginBottom: 10, cursor: 'pointer',
              background: selected === key ? '#eef3fd' : '#fff',
              transition: 'all 0.15s',
              boxShadow: selected === key ? '0 0 0 3px rgba(59,111,212,0.12)' : '0 1px 3px rgba(26,39,68,0.06)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: r.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>{ICONS[key]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>{r.label}</div>
                <div style={{ fontSize: 12, color: '#8890a8', marginTop: 1 }}>{r.desc}</div>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: `2px solid ${selected === key ? '#3b6fd4' : '#cdd1df'}`,
                background: selected === key ? '#3b6fd4' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s',
              }}>
                {selected === key && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
              </div>
            </div>
          ))}

          <button onClick={handleLogin} disabled={!selected} style={{
            width: '100%', padding: '13px', marginTop: 8,
            fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 10,
            background: selected ? 'linear-gradient(135deg, #3b6fd4, #2d5bb5)' : '#e4e7ef',
            color: selected ? '#fff' : '#a0a8c0',
            cursor: selected ? 'pointer' : 'not-allowed',
            boxShadow: selected ? '0 4px 14px rgba(59,111,212,0.35)' : 'none',
            transition: 'all 0.15s',
          }}>
            Sign in to application
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#b0b8d0', marginTop: 16 }}>
            If you are unable to access with your token, please register your account.
          </p>
        </div>
      </div>
    </div>
  );
}
