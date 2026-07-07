import { useState } from 'react';
import { useApp, DIRECTORATES, ASSET_TYPES } from '../context/AppContext';
import AppShell from '../components/AppShell';

export default function Submit() {
  const { submissions, addSubmission } = useApp();
  const [form, setForm] = useState({ directorate: '', type: '', assets: '', note: '' });
  const [success, setSuccess] = useState(false);

  const mySubmissions = submissions.filter(s => s.user === 'Current User' || s.user === 'Alex Johnson');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.directorate || !form.type || !form.assets) return;
    addSubmission(form);
    setForm({ directorate: '', type: '', assets: '', note: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  const statusColors = {
    pending:  { bg: '#fef3c7', color: '#BA7517' },
    approved: { bg: '#e8f5e9', color: '#1D9E75' },
    rejected: { bg: '#fff5f0', color: '#D85A30' },
  };

  return (
    <AppShell title="Submit entry">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

        {/* Form */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>New asset entry</div>
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Directorate *', field: 'directorate', type: 'select', options: DIRECTORATES, placeholder: 'Select directorate' },
              { label: 'Asset type *',  field: 'type',        type: 'select', options: ASSET_TYPES,  placeholder: 'Select type' },
            ].map(({ label, field, options, placeholder }) => (
              <div key={field} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>{label}</label>
                <select
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff' }}
                >
                  <option value="">{placeholder}</option>
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>Asset count *</label>
              <input
                type="number" min="1" placeholder="e.g. 150"
                value={form.assets}
                onChange={e => setForm({ ...form, assets: e.target.value })}
                required
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block' }}>Notes (optional)</label>
              <input
                type="text" placeholder="Brief description of these assets"
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: 10, fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', cursor: 'pointer' }}
            >
              Submit for approval
            </button>
          </form>

          {success && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#e8f5e9', color: '#0F6E56', borderRadius: 8, fontSize: 13 }}>
              ✓ Entry submitted! A data owner will review it shortly.
            </div>
          )}

          <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef3c7', color: '#BA7517', borderRadius: 8, fontSize: 13 }}>
            ℹ Submissions require data owner approval before appearing on the dashboard.
          </div>
        </div>

        {/* History */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Your submission history</div>
          {mySubmissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: 14 }}>No submissions yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Directorate','Type','Count','Status','Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 500, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mySubmissions.map(s => (
                  <tr key={s.id}>
                    <td style={{ padding: '10px 12px' }}>{s.directorate}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, background: '#f3f4f6', color: '#6b7280' }}>{s.type}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{s.assets.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500, ...statusColors[s.status] }}>{s.status}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 12 }}>{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </AppShell>
  );
}
