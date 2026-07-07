import { useApp } from '../context/AppContext';
import AppShell from '../components/AppShell';

const STATUS_COLORS = {
  pending:  { bg: '#fef3c7', color: '#BA7517' },
  approved: { bg: '#e8f5e9', color: '#1D9E75' },
  rejected: { bg: '#fff5f0', color: '#D85A30' },
};

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('');
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: '#e6f1fb', color: '#1E2761',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function Approvals() {
  const { submissions, approveSubmission, rejectSubmission } = useApp();
  const pending  = submissions.filter(s => s.status === 'pending');
  const resolved = submissions.filter(s => s.status !== 'pending');

  const th = { textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 500, color: '#6b7280', borderBottom: '1px solid #e5e7eb' };
  const td = { padding: '10px 12px', verticalAlign: 'middle' };

  return (
    <AppShell title="Approvals">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Pending review', value: pending.length,                                         color: '#BA7517' },
          { label: 'Approved',       value: submissions.filter(s => s.status === 'approved').length, color: '#1D9E75' },
          { label: 'Rejected',       value: submissions.filter(s => s.status === 'rejected').length, color: '#D85A30' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#eceae3', borderRadius: 8, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Pending */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Pending review ({pending.length})</div>
        {pending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: '#9ca3af' }}>✓ All caught up — no pending submissions!</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{['Submitted by','Directorate','Type','Count','Note','Date','Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {pending.map(s => (
                <tr key={s.id}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={s.user} />
                      {s.user}
                    </div>
                  </td>
                  <td style={td}>{s.directorate}</td>
                  <td style={td}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, background: '#f3f4f6', color: '#6b7280' }}>{s.type}</span>
                  </td>
                  <td style={td}>{s.assets.toLocaleString()}</td>
                  <td style={{ ...td, color: '#6b7280', fontSize: 12 }}>{s.note || '—'}</td>
                  <td style={{ ...td, color: '#6b7280', fontSize: 12 }}>{s.date}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => approveSubmission(s.id)}
                        style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: 'none', background: '#1D9E75', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => rejectSubmission(s.id)}
                        style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: 'none', background: '#D85A30', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Resolved */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Resolved ({resolved.length})</div>
        {resolved.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: '#9ca3af' }}>Nothing resolved yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{['Submitted by','Directorate','Type','Count','Status','Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {resolved.map(s => (
                <tr key={s.id}>
                  <td style={td}>{s.user}</td>
                  <td style={td}>{s.directorate}</td>
                  <td style={td}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, background: '#f3f4f6', color: '#6b7280' }}>{s.type}</span>
                  </td>
                  <td style={td}>{s.assets.toLocaleString()}</td>
                  <td style={td}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500, ...STATUS_COLORS[s.status] }}>{s.status}</span>
                  </td>
                  <td style={{ ...td, color: '#6b7280', fontSize: 12 }}>{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </AppShell>
  );
}
