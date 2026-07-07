import { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import AppShell from '../components/AppShell';

function Avatar({ name, role }) {
  const r = ROLES[role] || {};
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: r.bg, color: r.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, flexShrink: 0,
    }}>
      {name.split(' ').map(n => n[0]).join('')}
    </div>
  );
}

export default function Admin() {
  const { users, changeUserRole } = useApp();
  const [invite, setInvite] = useState({ email: '', role: 'user' });

  const th = { textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 500, color: '#6b7280', borderBottom: '1px solid #e5e7eb' };
  const td = { padding: '10px 12px', verticalAlign: 'middle' };

  return (
    <AppShell title="User management">

      {/* Role counts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {Object.entries(ROLES).map(([key, r]) => (
          <div key={key} style={{ background: '#eceae3', borderRadius: 8, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{r.label}s</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: r.color }}>
              {users.filter(u => u.role === key).length}
            </div>
          </div>
        ))}
      </div>

      {/* User table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>All users</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>{['Name','Email','Current role','Joined','Change role'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar name={u.name} role={u.role} />
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ ...td, color: '#6b7280' }}>{u.email}</td>
                <td style={td}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                    fontSize: 11, fontWeight: 500,
                    background: ROLES[u.role]?.bg, color: ROLES[u.role]?.color,
                  }}>
                    {ROLES[u.role]?.label}
                  </span>
                </td>
                <td style={{ ...td, color: '#6b7280', fontSize: 12 }}>{u.joined}</td>
                <td style={td}>
                  <select
                    value={u.role}
                    onChange={e => changeUserRole(u.id, e.target.value)}
                    style={{ padding: '4px 8px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 6, width: 'auto' }}
                  >
                    {Object.entries(ROLES).map(([k, r]) => (
                      <option key={k} value={k}>{r.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Invite user</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>Email address</label>
            <input
              type="email" placeholder="name@agency.gov"
              value={invite.email}
              onChange={e => setInvite({ ...invite, email: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>Role</label>
            <select
              value={invite.role}
              onChange={e => setInvite({ ...invite, role: e.target.value })}
              style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, width: 'auto' }}
            >
              {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
            </select>
          </div>
          <button
            onClick={() => { if (!invite.email) return; setInvite({ email: '', role: 'user' }); alert('Invite sent! Connect an email service to send real invites.'); }}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', cursor: 'pointer' }}
          >
            Send invite
          </button>
        </div>
      </div>

      {/* Permissions table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Role permissions</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>{['Permission','End user','Data owner','Admin'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {[
              ['View dashboard',                true,  true,  true],
              ['Submit asset entries',          true,  true,  true],
              ['View submission history',       true,  true,  true],
              ['Upload CSV data',               false, true,  true],
              ['Approve / reject submissions',  false, true,  true],
              ['Export data',                   false, true,  true],
              ['Manage users and roles',        false, false, true],
              ['Invite new users',              false, false, true],
              ['System settings',               false, false, true],
            ].map(([perm, ...checks]) => (
              <tr key={perm}>
                <td style={td}>{perm}</td>
                {checks.map((c, i) => (
                  <td key={i} style={{ ...td, color: c ? '#1D9E75' : '#D85A30', fontWeight: 700, fontSize: 16 }}>
                    {c ? '✓' : '✕'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </AppShell>
  );
}
