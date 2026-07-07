import { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ASSET_TYPES, PALETTE } from '../context/AppContext';

const TYPE_COLORS = {};
ASSET_TYPES.forEach((t, i) => { TYPE_COLORS[t] = PALETTE[i % PALETTE.length]; });

// ─── Shared Tooltip ───────────────────────────────────────────────────────────
function Tooltip({ tooltip }) {
  if (!tooltip) return null;
  return (
    <div style={{
      position: 'fixed',
      left: tooltip.x + 14,
      top: tooltip.y - 10,
      background: '#1a1f36',
      color: '#fff',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 12,
      pointerEvents: 'none',
      zIndex: 9999,
      boxShadow: '0 4px 20px rgba(26,39,68,0.25)',
      minWidth: 160,
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, paddingBottom: 7, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: tooltip.color, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{tooltip.title}</span>
      </div>
      {/* Rows */}
      {tooltip.rows.map(({ label, value }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{label}</span>
          <span style={{ fontWeight: 600, color: '#fff', fontSize: 11 }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stacked Bar Chart ────────────────────────────────────────────────────────
export function StackedBarChart({ assetData, selectedDirectorate, onSelect, width = 560, height = 220 }) {
  const ref = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const byDir = useMemo(() => {
    return assetData.map(row => {
      const r = { directorate: row.directorate };
      let remaining = row.assets;
      ASSET_TYPES.forEach((type, i) => {
        if (i === ASSET_TYPES.length - 1) {
          r[type] = Math.max(0, remaining);
        } else {
          const share = Math.round(row.assets * (0.08 + ((i * 37 + row.directorate.length * 13) % 15) / 100));
          r[type] = share;
          remaining -= share;
        }
      });
      r.total = row.assets;
      return r;
    }).sort((a, b) => b.total - a.total);
  }, [assetData]);

  useEffect(() => {
    if (!byDir.length) return;
    const margin = { top: 24, right: 16, bottom: 44, left: 64 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const series = d3.stack().keys(ASSET_TYPES)(byDir);
    const x = d3.scaleBand().domain(byDir.map(d => d.directorate)).range([0, innerW]).padding(0.28);
    const y = d3.scaleLinear().domain([0, d3.max(byDir, d => d.total)]).nice().range([innerH, 0]);
    const g = svg.attr('viewBox', `0 0 ${width} ${height}`)
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Gridlines
    g.append('g').selectAll('line').data(y.ticks(5)).join('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', '#000').attr('stroke-opacity', 0.06);

    // Bars
    g.selectAll('g.layer').data(series).join('g')
      .attr('class', 'layer').attr('fill', d => TYPE_COLORS[d.key])
      .each(function(layer) {
        d3.select(this).selectAll('rect')
          .data(layer.map(seg => ({ ...seg, type: layer.key })))
          .join('rect')
          .attr('x', d => x(d.data.directorate))
          .attr('y', d => y(d[1]))
          .attr('width', x.bandwidth())
          .attr('height', d => Math.max(0, y(d[0]) - y(d[1])))
          .attr('rx', 2)
          .attr('opacity', d => selectedDirectorate && selectedDirectorate !== d.data.directorate ? 0.25 : 1)
          .style('cursor', 'pointer')
          .on('mousemove', (event, d) => {
            const segVal = d[1] - d[0];
            const pct = ((segVal / d.data.total) * 100).toFixed(1);
            setTooltip({
              x: event.clientX,
              y: event.clientY,
              color: TYPE_COLORS[d.type],
              title: d.type,
              rows: [
                { label: 'Directorate', value: d.data.directorate },
                { label: 'Count',       value: segVal.toLocaleString() },
                { label: 'Share of dir',value: pct + '%' },
                { label: 'Dir total',   value: d.data.total.toLocaleString() },
              ],
            });
          })
          .on('mouseleave', () => setTooltip(null))
          .on('click', (_e, d) => onSelect(selectedDirectorate === d.data.directorate ? null : d.data.directorate));
      });

    // Value labels
    g.append('g').selectAll('text').data(byDir).join('text')
      .attr('x', d => x(d.directorate) + x.bandwidth() / 2)
      .attr('y', d => y(d.total) - 6)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-weight', 600).attr('fill', '#333')
      .attr('opacity', d => selectedDirectorate && selectedDirectorate !== d.directorate ? 0.25 : 1)
      .text(d => d3.format('~s')(d.total));

    // X axis
    g.append('g').attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call(g2 => g2.select('.domain').attr('stroke-opacity', 0.2))
      .selectAll('text')
      .attr('font-size', 12).attr('fill', '#333')
      .style('cursor', 'pointer')
      .style('font-weight', d => d === selectedDirectorate ? 700 : 400)
      .on('click', (_e, d) => onSelect(selectedDirectorate === d ? null : d));

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(0).tickFormat(d3.format('~s')))
      .call(g2 => g2.select('.domain').remove())
      .selectAll('text').attr('font-size', 11).attr('fill', '#888');

  }, [byDir, selectedDirectorate, onSelect, width, height]);

  return (
    <>
      <svg ref={ref} style={{ width: '100%' }} />
      <Tooltip tooltip={tooltip} />
    </>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
export function DonutChart({ assetData, directorate, width = 220, height = 220 }) {
  const ref = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const totals = useMemo(() => {
    const filtered = directorate
      ? assetData.filter(d => d.directorate === directorate)
      : assetData;
    const total = filtered.reduce((s, d) => s + d.assets, 0);
    return ASSET_TYPES.map((type, i) => ({
      type,
      total: Math.round(total * (0.08 + ((i * 31 + (directorate || 'all').length * 17) % 15) / 100)),
    })).filter(d => d.total > 0);
  }, [assetData, directorate]);

  const grandTotal = totals.reduce((s, d) => s + d.total, 0);

  useEffect(() => {
    if (!totals.length) return;
    const r = Math.min(width, height) / 2;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    const g = svg.attr('viewBox', `0 0 ${width} ${height}`)
      .append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value(d => d.total).sort(null).padAngle(0.02);
    const arc  = d3.arc().innerRadius(r * 0.58).outerRadius(r * 0.94);
    const arcH = d3.arc().innerRadius(r * 0.55).outerRadius(r * 1.0);
    const lArc = d3.arc().innerRadius(r * 0.76).outerRadius(r * 0.76);

    // Find top directorate per type (for overall view)
    function getTopDir(type, typeIdx) {
      if (directorate) return null;
      return [...assetData].sort((a, b) => {
        const aV = Math.round(a.assets * (0.08 + ((typeIdx * 31 + a.directorate.length * 17) % 15) / 100));
        const bV = Math.round(b.assets * (0.08 + ((typeIdx * 31 + b.directorate.length * 17) % 15) / 100));
        return bV - aV;
      })[0];
    }

    g.selectAll('path').data(pie(totals)).join('path')
      .attr('d', arc)
      .attr('fill', d => TYPE_COLORS[d.data.type])
      .style('cursor', 'pointer')
      .on('mousemove', (event, d) => {
        const typeIdx = ASSET_TYPES.indexOf(d.data.type);
        const pct = ((d.data.total / grandTotal) * 100).toFixed(1);
        const topDir = getTopDir(d.data.type, typeIdx);
        const topDirVal = topDir
          ? Math.round(topDir.assets * (0.08 + ((typeIdx * 31 + topDir.directorate.length * 17) % 15) / 100))
          : null;

        const rows = [
          { label: 'Count', value: d.data.total.toLocaleString() },
          { label: 'Share', value: pct + '%' },
        ];
        if (topDir) rows.push({ label: '🏆 Top PMO', value: `${topDir.directorate} (${topDirVal.toLocaleString()})` });

        setTooltip({
          x: event.clientX,
          y: event.clientY,
          color: TYPE_COLORS[d.data.type],
          title: d.data.type,
          rows,
        });
      })
      .on('mouseleave', () => setTooltip(null))
      .on('mouseenter', function() { d3.select(this).transition().duration(100).attr('d', arcH); })
      .on('mouseleave', function() {
        d3.select(this).transition().duration(100).attr('d', arc);
        setTooltip(null);
      });

    // Slice labels
    g.selectAll('text.lbl')
      .data(pie(totals).filter(d => d.endAngle - d.startAngle > 0.25))
      .join('text').attr('class', 'lbl')
      .attr('transform', d => `translate(${lArc.centroid(d)})`)
      .attr('text-anchor', 'middle').attr('dy', '0.35em')
      .attr('font-size', 10).attr('font-weight', 600).attr('fill', '#fff')
      .style('pointer-events', 'none')
      .text(d => d3.format('~s')(d.data.total));

    // Centre labels
    g.append('text').attr('text-anchor', 'middle').attr('dy', '-0.3em')
      .attr('font-size', 12).attr('fill', '#888')
      .text(directorate || 'All');
    g.append('text').attr('text-anchor', 'middle').attr('dy', '1.1em')
      .attr('font-size', 19).attr('font-weight', 700).attr('fill', '#1a1a1a')
      .text(d3.format('~s')(grandTotal));

  }, [totals, grandTotal, directorate, assetData, width, height]);

  return (
    <>
      <svg ref={ref} style={{ width: '100%', maxWidth: width }} />
      <Tooltip tooltip={tooltip} />
    </>
  );
}
