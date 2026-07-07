import { useState } from 'react';
import { useApp, ROLES, DIRECTORATES } from '../context/AppContext';
import AppShell from '../components/AppShell';

export default function Settings() {
  const { role } = useApp();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppShell title="Settings">

      {/* Profile — all roles */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            { label: 'Full name', value: 'Current User', type: 'text' },
            { label: 'Email',     value: 'user@agency.gov', type: 'email' },
          ].map(({ label, value, type }) => (
            <div key={label}>
              <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>{label}</label>
              <input defaultValue={value} type={type} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>Directorate</label>
            <select style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}>
              <option value="">Select directorate</option>
              {DIRECTORATES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>Role</label>
            <input
              value={ROLES[role]?.label || ''}
              readOnly
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#f9f9f8', color: '#6b7280' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleSave}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', cursor: 'pointer' }}
          >
            Save profile
          </button>
          {saved && <span style={{ color: '#1D9E75', fontSize: 13 }}>✓ Saved</span>}
        </div>
      </div>

      {/* Notifications — all roles */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Notifications</div>
        {[
          { label: 'Email me when my submission is approved or rejected', defaultChecked: true },
          { label: 'Email me when new submissions are pending review',    defaultChecked: role !== 'user' },
          { label: 'Weekly summary digest',                               defaultChecked: false },
        ].map(({ label, defaultChecked }) => (
          <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" defaultChecked={defaultChecked} style={{ width: 'auto' }} />
            {label}
          </label>
        ))}
      </div>

      {/* Data settings — owner and admin only */}
      {(role === 'owner' || role === 'admin') && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Data settings</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>Default CSV delimiter</label>
              <select style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}>
                <option>Comma (,)</option>
                <option>Semicolon (;)</option>
                <option>Tab</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>Auto-approve threshold</label>
              <input type="number" defaultValue={0} placeholder="0 = require manual approval" style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
            </div>
          </div>
          <button onClick={handleSave} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
            Save data settings
          </button>
        </div>
      )}

      {/* System settings — admin only */}
      {role === 'admin' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>System settings</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>Organisation name</label>
              <input defaultValue="Agency PMO" style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>SSO provider</label>
              <select style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}>
                <option>None (role picker)</option>
                <option>Microsoft Azure AD</option>
                <option>Google Workspace</option>
                <option>Okta</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>Default new user role</label>
              <select style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}>
                {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>Session timeout (minutes)</label>
              <input type="number" defaultValue={60} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
            </div>
          </div>
          <button onClick={handleSave} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
            Save system settings
          </button>
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef3c7', color: '#BA7517', borderRadius: 8, fontSize: 13 }}>
            ⚠ System settings affect all users. Changes take effect immediately.
          </div>
        </div>
      )}

    </AppShell>
  );
}
