import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, ASSET_TYPES, PALETTE } from '../context/AppContext';
import { StackedBarChart, DonutChart } from '../components/Charts';
import AppShell from '../components/AppShell';

const TYPE_COLORS = {};
ASSET_TYPES.forEach((t, i) => { TYPE_COLORS[t] = PALETTE[i % PALETTE.length]; });

function parseCSV(text, validDirectorates) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const dirCol    = headers.findIndex(h => h.toLowerCase().includes('directorate'));
  const assetsCol = headers.findIndex(h => h.toLowerCase().includes('asset'));
  if (dirCol === -1 || assetsCol === -1) throw new Error('CSV must have columns: Directorate, Assets');

  const rows = lines.slice(1).map(line => {
    const cols = line.split(',');
    return { directorate: cols[dirCol]?.trim(), assets: parseInt(cols[assetsCol]?.trim(), 10) };
  }).filter(r => r.directorate && !isNaN(r.assets) && r.assets > 0);

  // Filter to only known directorates
  const valid   = rows.filter(r => validDirectorates.includes(r.directorate));
  const skipped = rows.filter(r => !validDirectorates.includes(r.directorate));

  if (skipped.length > 0) {
    const names = [...new Set(skipped.map(r => r.directorate))].join(', ');
    console.warn(`Skipped unknown directorates: ${names}`);
  }

  return { valid, skipped };
}

export default function Dashboard() {
  const { role, submissions, assetData, mergeCSVData, uploadHistory, validDirectorates } = useApp();
  const navigate  = useNavigate();
  const fileInput = useRef(null);
  const [selectedDir, setSelectedDir] = useState(null);
  const pending    = submissions.filter(s => s.status === 'pending').length;
  const grandTotal = assetData.reduce((s, d) => s + d.assets, 0);
  const maxAssets  = Math.max(...assetData.map(d => d.assets));

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const { valid, skipped } = parseCSV(evt.target.result, validDirectorates);
        if (!valid.length) throw new Error('No rows matched the known directorates (PMO-1 to PMO-8)');
        mergeCSVData(valid, file.name);
        if (skipped.length > 0) {
          const names = [...new Set(skipped.map(r => r.directorate))].join(', ');
          alert(`✓ ${valid.length} rows merged.\n\n⚠ ${skipped.length} rows skipped — unknown directorates: ${names}\n\nOnly PMO-1 through PMO-8 are accepted.`);
        }
      } catch (err) {
        alert(`Could not parse CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleExport() {
    const csv = `Directorate,Assets\n${assetData.map(d => `${d.directorate},${d.assets}`).join('\n')}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `asset-data-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  const selectedDirData = assetData.find(d => d.directorate === selectedDir);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Real-time overview of data assets across all directorates"
      actions={
        (role === 'owner' || role === 'admin') && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input ref={fileInput} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
            <button onClick={() => fileInput.current.click()} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: '1px solid #cdd1df', background: '#fff', color: '#4a5178', cursor: 'pointer' }}>📤 Upload CSV</button>
            <button onClick={handleExport} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: '1px solid #cdd1df', background: '#fff', color: '#4a5178', cursor: 'pointer' }}>📥 Export</button>
            {pending > 0 && (
              <button onClick={() => navigate('/approvals')} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#3b6fd4,#2d5bb5)', color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,111,212,0.3)' }}>
                📋 {pending} pending
              </button>
            )}
          </div>
        )
      }
    >

      {/* Metric cards — compact */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        {[
          { label: 'Total assets',      value: grandTotal.toLocaleString(), color: '#3b6fd4', icon: '📦' },
          { label: 'Directorates',      value: assetData.length,            color: '#0f7b5a', icon: '🏢' },
          { label: 'Asset types',       value: '8',                         color: '#7f5dd4', icon: '🗂️' },
          { label: 'Pending approvals', value: pending,                     color: '#b45309', icon: '⏳' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', boxShadow: '0 1px 4px rgba(26,39,68,0.07)', border: '1px solid #e4e7ef', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 11, color: '#8890a8', fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1f36', lineHeight: 1.2 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content — two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Left — stacked bar chart */}
        <div style={{ background: '#fff', border: '1px solid #e4e7ef', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(26,39,68,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1f36' }}>Assets by directorate</div>
              <div style={{ fontSize: 11, color: '#8890a8', marginTop: 1 }}>Click a bar to explore breakdown</div>
            </div>
            {selectedDir && (
              <button onClick={() => setSelectedDir(null)} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: '1px solid #cdd1df', background: '#fff', color: '#4a5178', cursor: 'pointer' }}>✕ Clear</button>
            )}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {ASSET_TYPES.map(type => (
              <span key={type} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8890a8' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: TYPE_COLORS[type], display: 'inline-block' }} />
                {type}
              </span>
            ))}
          </div>
          <StackedBarChart assetData={assetData} selectedDirectorate={selectedDir} onSelect={setSelectedDir} width={560} height={220} />
        </div>

        {/* Right — donut only */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', border: '1px solid #e4e7ef', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(26,39,68,0.06)', flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1f36', marginBottom: 2 }}>
              {selectedDir ? `${selectedDir} breakdown` : 'Overall mix'}
            </div>
            <div style={{ fontSize: 11, color: '#8890a8', marginBottom: 10 }}>
              {selectedDir ? 'Asset types for selected directorate' : 'Hover over a slice for details'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <DonutChart assetData={assetData} directorate={selectedDir} width={200} height={200} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom — compact summary table with see more links */}
      <div style={{ background: '#fff', border: '1px solid #e4e7ef', borderRadius: 14, padding: '14px 18px', boxShadow: '0 1px 4px rgba(26,39,68,0.06)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1f36', marginBottom: 12 }}>Directorate summary</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#f8f9fc' }}>
                {['Directorate','Total assets','Share',''].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '7px 12px', fontSize: 11, fontWeight: 600, color: '#8890a8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e4e7ef' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...assetData].sort((a, b) => b.assets - a.assets).map((row, i) => {
                const pct  = ((row.assets / grandTotal) * 100).toFixed(1);
                const barW = Math.round((row.assets / maxAssets) * 100);
                const isSel = selectedDir === row.directorate;
                return (
                  <tr key={row.directorate}
                    onClick={() => setSelectedDir(isSel ? null : row.directorate)}
                    style={{ cursor: 'pointer', background: isSel ? '#eef3fd' : 'transparent', opacity: selectedDir && !isSel ? 0.45 : 1, transition: 'all 0.12s' }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#f8f9fc'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isSel ? '#eef3fd' : 'transparent'; }}
                  >
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: isSel ? '#3b6fd4' : '#1a1f36', borderBottom: '1px solid #f1f3f9', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: PALETTE[i % 8], flexShrink: 0 }} />
                        {row.directorate}
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1a1f36', borderBottom: '1px solid #f1f3f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {row.assets.toLocaleString()}
                        <span
                          onClick={e => { e.stopPropagation(); navigate(`/directorate/${row.directorate}`); }}
                          style={{ fontSize: 11, color: '#3b6fd4', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}
                        >
                          See more info →
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f3f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 90, height: 5, background: '#f1f3f9', borderRadius: 3 }}>
                          <div style={{ width: barW + '%', height: '100%', background: PALETTE[i % 8], borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#8890a8' }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f3f9' }}>
                      {isSel && <span style={{ fontSize: 10, color: '#3b6fd4', fontWeight: 700, background: '#eef3fd', padding: '2px 7px', borderRadius: 5 }}>● selected</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User CTA */}
      {role === 'user' && (
        <div style={{ background: 'linear-gradient(135deg,#eef3fd,#e8f0fc)', border: '1px solid #c5d5f5', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2744', marginBottom: 2 }}>Have new asset data to report?</div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Submit entries for your directorate — they go into a review queue first.</p>
          </div>
          <button onClick={() => navigate('/submit')} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 9, background: 'linear-gradient(135deg,#3b6fd4,#2d5bb5)', color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 3px 10px rgba(59,111,212,0.35)' }}>
            Submit entry →
          </button>
        </div>
      )}

    </AppShell>
  );
}
