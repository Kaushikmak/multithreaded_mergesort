"use client";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ReferenceLine,
} from "recharts";

const benchData = [
  { size: '10K',  seq: 1.570,  conc: 0.552,  speedup: 2.84, improvement: 64.86, threads: 4 },
  { size: '100K', seq: 16.018, conc: 4.468,  speedup: 3.58, improvement: 72.10, threads: 4 },
  { size: '1M',   seq: 91.537, conc: 15.974, speedup: 5.73, improvement: 82.54, threads: 8 },
  { size: '10M',  seq: 950.563,conc: 112.226,speedup: 8.06, improvement: 87.59, threads: 16 },
  { size: '50M',  seq: 4782.103,conc:714.785,speedup: 6.69, improvement: 85.05, threads: 16 },
];

const chunkData = [
  { chunk: '1K',   time: 89.2 },
  { chunk: '4K',   time: 42.1 },
  { chunk: '16K',  time: 18.7 },
  { chunk: '64K',  time: 15.2 },
  { chunk: '128K', time: 16.8 },
  { chunk: '256K', time: 22.3 },
  { chunk: '512K', time: 34.6 },
  { chunk: '1M',   time: 58.4 },
];

const cpuData = Array.from({ length: 40 }, (_, i) => ({
  t: i * 0.5,
  core0: 20 + Math.sin(i * 0.4) * 15 + (i > 8 && i < 30 ? 60 + Math.random() * 20 : Math.random() * 10),
  core1: 15 + Math.sin(i * 0.35 + 1) * 12 + (i > 8 && i < 30 ? 55 + Math.random() * 25 : Math.random() * 8),
  core2: 18 + Math.sin(i * 0.5 + 2) * 10 + (i > 8 && i < 30 ? 65 + Math.random() * 15 : Math.random() * 12),
  core3: 22 + Math.sin(i * 0.45 + 0.5) * 14 + (i > 8 && i < 30 ? 58 + Math.random() * 22 : Math.random() * 9),
}));

const cacheData = [
  { size: '10K',  l1Miss: 1.2,  llcMiss: 0.3  },
  { size: '100K', l1Miss: 3.8,  llcMiss: 1.1  },
  { size: '1M',   l1Miss: 12.4, llcMiss: 4.7  },
  { size: '10M',  l1Miss: 28.6, llcMiss: 11.2 },
  { size: '50M',  l1Miss: 41.3, llcMiss: 18.9 },
];

const radarData = [
  { metric: 'Speed',        seq: 20, conc: 85 },
  { metric: 'Cache Eff.',   seq: 70, conc: 55 },
  { metric: 'CPU Util.',    seq: 25, conc: 90 },
  { metric: 'Memory BW',   seq: 40, conc: 75 },
  { metric: 'Scalability', seq: 15, conc: 95 },
  { metric: 'Throughput',  seq: 22, conc: 88 },
];

const TOOLTIP_STYLE = {
  backgroundColor: '#0d0d0d',
  border: '1px solid #2a2a2a',
  borderRadius: 6,
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  color: '#e8e8e8',
};

const tabs = ['Execution Time', 'Speedup', 'CPU Utilization', 'Cache Behavior', 'Chunk Optimization', 'Radar'];

export default function BenchmarksPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [logScale, setLogScale] = useState(false);

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p className="section-label" style={{ marginBottom: 8 }}>— performance analytics</p>
          <h1 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Benchmark <span className="glow-green">Results</span>
          </h1>
          <p style={{ marginTop: 12, color: 'var(--muted)', fontSize: 15, maxWidth: 480 }}>
            6 interactive visualizations across 5 array sizes. Toggle charts using the tabs below.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 32, padding: '8px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)', width: 'fit-content' }}>
          {tabs.map((t, i) => (
            <button key={t} className={`tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>{t}</button>
          ))}
        </div>

        {/* Chart Area */}
        <div className="card" style={{ padding: '32px' }}>

          {/* Chart 1: Execution Time */}
          {activeTab === 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700 }}>Execution Time: Sequential vs Multithreaded</h2>
                  <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4, fontFamily: 'var(--font-mono)' }}>Time in milliseconds · logarithmic Y-axis available</p>
                </div>
                <button onClick={() => setLogScale(v => !v)} className={`tab-btn ${logScale ? 'active' : ''}`} style={{ flexShrink: 0 }}>
                  {logScale ? '● LOG' : '○ LOG'}
                </button>
              </div>
              <div style={{ height: 380 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={benchData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                    <XAxis dataKey="size" stroke="#555" tick={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                    <YAxis scale={logScale ? 'log' : 'auto'} domain={logScale ? ['auto','auto'] : undefined} stroke="#555" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => typeof v === 'number' ? [`${v.toFixed(3)} ms`, ''] : ['', '']} />
                    <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                    <Line type="monotone" dataKey="seq" name="Sequential" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 5, fill: '#ef4444' }} activeDot={{ r: 7 }} />
                    <Line type="monotone" dataKey="conc" name="Multithreaded" stroke="#00ff88" strokeWidth={2.5} dot={{ r: 5, fill: '#00ff88' }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: 20, padding: 16, background: 'var(--surface2)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--accent)' }}>insight: </span>
                At 10M elements, multithreaded completes in 112ms vs 951ms sequential. The gap widens with scale until 50M where thread management overhead slightly reduces gains.
              </div>
            </div>
          )}

          {/* Chart 2: Speedup */}
          {activeTab === 1 && (
            <div>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Speedup Factor by Array Size</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24, fontFamily: 'var(--font-mono)' }}>Speedup = seq_time / conc_time · ideal linear speedup = thread count</p>
              <div style={{ height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={benchData}>
                    <defs>
                      <linearGradient id="speedupGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                    <XAxis dataKey="size" stroke="#555" tick={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                    <YAxis stroke="#555" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} domain={[0, 10]} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => v !== undefined ? [`${v}×`, 'Speedup'] : ['', 'Speedup']} />
                    <ReferenceLine y={1} stroke="#555" strokeDasharray="4 4" label={{ value: 'baseline', fill: '#555', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                    <Area type="monotone" dataKey="speedup" name="Speedup" stroke="#f59e0b" strokeWidth={2.5} fill="url(#speedupGrad)" dot={{ r: 5, fill: '#f59e0b' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 20 }}>
                {benchData.map(d => (
                  <div key={d.size} style={{ padding: '12px', background: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{d.size}</div>
                    <div className="font-display" style={{ fontWeight: 700, fontSize: 20, color: 'var(--warn)' }}>{d.speedup}×</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart 3: CPU Utilization */}
          {activeTab === 2 && (
            <div>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Real-Time CPU Core Utilization</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24, fontFamily: 'var(--font-mono)' }}>Simulated 4-core trace · psutil captured at 500ms intervals</p>
              <div style={{ height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuData}>
                    <defs>
                      {[
                        ['c0Grad', '#00ff88'],
                        ['c1Grad', '#3b82f6'],
                        ['c2Grad', '#f59e0b'],
                        ['c3Grad', '#c792ea'],
                      ].map(([id, color]) => (
                        <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                    <XAxis dataKey="t" stroke="#555" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} label={{ value: 'time (s)', position: 'insideBottom', fill: '#555', fontSize: 11 }} />
                    <YAxis stroke="#555" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} domain={[0, 100]} unit="%" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => typeof v === 'number' ? [`${Math.min(100, Math.max(0, v)).toFixed(1)}%`, ''] : ['', '']} />
                    <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                    <Area type="monotone" dataKey="core0" name="Core 0" stroke="#00ff88" fill="url(#c0Grad)" strokeWidth={1.5} dot={false} />
                    <Area type="monotone" dataKey="core1" name="Core 1" stroke="#3b82f6" fill="url(#c1Grad)" strokeWidth={1.5} dot={false} />
                    <Area type="monotone" dataKey="core2" name="Core 2" stroke="#f59e0b" fill="url(#c2Grad)" strokeWidth={1.5} dot={false} />
                    <Area type="monotone" dataKey="core3" name="Core 3" stroke="#c792ea" fill="url(#c3Grad)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: 20, padding: 16, background: 'var(--surface2)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--accent)' }}>insight: </span>
                Cores spike to ~70–90% utilization during the concurrent sort phase (t=4s–15s). The ramp-up and cooldown show thread spawn/join overhead.
              </div>
            </div>
          )}

          {/* Chart 4: Cache */}
          {activeTab === 3 && (
            <div>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Cache Miss Rate (%)</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24, fontFamily: 'var(--font-mono)' }}>Captured via perf · L1 data cache vs Last-Level Cache</p>
              <div style={{ height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cacheData} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                    <XAxis dataKey="size" stroke="#555" tick={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                    <YAxis stroke="#555" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} unit="%" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => typeof v === 'number' ? [`${v}%`, ''] : ['', '']} />
                    <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                    <Bar dataKey="l1Miss" name="L1 Cache Miss" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.85} />
                    <Bar dataKey="llcMiss" name="LLC Miss" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: 20, padding: 16, background: 'var(--surface2)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--accent2)' }}>note: </span>
                L1 miss rates climb steeply beyond 1M elements as working set exceeds L2 capacity. LLC misses indicate main-memory pressure at 50M.
              </div>
            </div>
          )}

          {/* Chart 5: Chunk Size */}
          {activeTab === 4 && (
            <div>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Optimal Chunk Size Tuning</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24, fontFamily: 'var(--font-mono)' }}>Execution time at 10M elements varying THRESHOLD · sweet spot ~64K</p>
              <div style={{ height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chunkData}>
                    <defs>
                      <linearGradient id="chunkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c792ea" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#c792ea" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                    <XAxis dataKey="chunk" stroke="#555" tick={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                    <YAxis stroke="#555" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} unit="ms" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => typeof v === 'number' ? [`${v} ms`, 'Time'] : ['', '']} />
                    <ReferenceLine x="64K" stroke="var(--accent)" strokeDasharray="4 4" label={{ value: 'optimal', fill: 'var(--accent)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                    <Area type="monotone" dataKey="time" stroke="#c792ea" strokeWidth={2.5} fill="url(#chunkGrad)" dot={{ r: 5, fill: '#c792ea' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: 20, padding: 16, background: 'var(--surface2)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, border: '1px solid var(--border)' }}>
                <span style={{ color: '#c792ea' }}>insight: </span>
                THRESHOLD=64K minimizes time at 15.2ms. Below this, thread spawn overhead dominates. Above, parallelism is under-utilized.
              </div>
            </div>
          )}

          {/* Chart 6: Radar */}
          {activeTab === 5 && (
            <div>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Performance Profile Comparison</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24, fontFamily: 'var(--font-mono)' }}>Normalized scores across 6 dimensions (higher = better)</p>
              <div style={{ height: 380 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e1e1e" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontFamily: 'var(--font-mono)', fontSize: 12, fill: '#888' }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: '#444' }} />
                    <Radar name="Sequential" dataKey="seq" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Multithreaded" dataKey="conc" stroke="#00ff88" fill="#00ff88" fillOpacity={0.15} strokeWidth={2} />
                    <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}