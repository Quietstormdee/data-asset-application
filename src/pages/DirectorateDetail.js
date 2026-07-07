import { useParams, useNavigate } from 'react-router-dom';
import { useApp, ASSET_TYPES, PALETTE } from '../context/AppContext';
import { DonutChart } from '../components/Charts';
import AppShell from '../components/AppShell';

const TYPE_COLORS = {};
ASSET_TYPES.forEach((t, i) => { TYPE_COLORS[t] = PALETTE[i % PALETTE.length]; });

export default function DirectorateDetail() {
  const { directorate } = useParams();
  const { assetData } = useApp();
  const navigate = useNavigate();

  const row = assetData.find(d => d.directorate === directorate);
  if (!row) return (
    <AppShell title="Not found">
      <div style={{ textAlign: 'center', padding: 60, color: '#8890a8' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Directorate not found</div>
        <button onClick={() => navigate('/dashboard')} style={{ marginTop: 16, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#3b6fd4', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>← Back to dashboard</button>
      </div>
    </AppShell>
  );

  // Distribute total across asset types using seeded weights
  const typeValues = ASSET_TYPES.map((type, ti) => ({
    type,
    value: Math.round(row.assets * (0.08 + ((ti * 31 + directorate.length * 17) % 15) / 100)),
    color: TYPE_COLORS[type],
  }));
  const diff = row.assets - typeValues.reduce((s, v) => s + v.value, 0);
  typeValues[typeValues.length - 1].value += diff;
  const sorted = [...typeValues].sort((a, b) => b.value - a.value);

  return (
    <AppShell
      title={`${directorate} — Asset breakdown`}
      subtitle={`Full asset type breakdown for ${directorate}`}
      actions={
        <button onClick={() => navigate('/dashboard')} style={{ padding: '7px 14px', fontSize: 13, fontWeight: 600, borderRadius: 8, border: '1px solid #cdd1df', background: '#fff', color: '#4a5178', cursor: 'pointer' }}>
          ← Back to dashboard
        </button>
      }
    >
      {/* Summary card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { label: 'Total assets', value: row.assets.toLocaleString(), color: '#3b6fd4', icon: '📦' },
          { label: 'Asset types', value: ASSET_TYPES.length, color: '#7f5dd4', icon: '🗂️' },
          { label: 'Largest type', value: sorted[0].type, color: '#0f7b5a', icon: '🏆' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', boxShadow: '0 1px 4px rgba(26,39,68,0.07)', border: '1px solid #e4e7ef', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 11, color: '#8890a8', fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1f36', lineHeight: 1.2 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 18 }}>

        {/* Donut chart */}
        <div style={{ background: '#fff', border: '1px solid #e4e7ef', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 4px rgba(26,39,68,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1f36', marginBottom: 4 }}>Asset type distribution</div>
          <div style={{ fontSize: 12, color: '#8890a8', marginBottom: 16 }}>Breakdown across all 8 asset types</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DonutChart assetData={assetData} directorate={directorate} width={220} height={220} />
          </div>
        </div>

        {/* Full breakdown table */}
        <div style={{ background: '#fff', border: '1px solid #e4e7ef', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 4px rgba(26,39,68,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1f36', marginBottom: 4 }}>Full asset type breakdown</div>
          <div style={{ fontSize: 12, color: '#8890a8', marginBottom: 16 }}>All asset types sorted by count</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8f9fc' }}>
                {['Asset type', 'Count', 'Share', 'Distribution'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#8890a8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e4e7ef' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(({ type, value, color }, i) => {
                const pct = ((value / row.assets) * 100).toFixed(1);
                const barW = Math.round((value / sorted[0].value) * 100);
                return (
                  <tr key={type} style={{ borderBottom: '1px solid #f1f3f9' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: '#1a1f36' }}>{type}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1a1f36' }}>{value.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', color: '#8890a8', fontSize: 12 }}>{pct}%</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ width: '100%', height: 6, background: '#f1f3f9', borderRadius: 3 }}>
                        <div style={{ width: barW + '%', height: '100%', background: color, borderRadius: 3 }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f8f9fc', borderTop: '2px solid #e4e7ef' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1a1f36' }}>Total</td>
                <td style={{ padding: '10px 12px', fontWeight: 800, color: '#3b6fd4', fontSize: 14 }}>{row.assets.toLocaleString()}</td>
                <td style={{ padding: '10px 12px', color: '#8890a8' }}>100%</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </AppShell>
  );
}
