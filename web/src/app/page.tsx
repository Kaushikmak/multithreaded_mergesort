"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BarChart3, Code2 } from "lucide-react";

const stats = [
  { value: "8.06×", label: "Peak Speedup", sub: "at 10M elements", color: "var(--accent)" },
  { value: "87.6%", label: "Time Saved", sub: "at 10M elements", color: "var(--accent2)" },
  { value: "5", label: "Array Sizes", sub: "benchmarked", color: "var(--accent3)" },
  { value: "C++17", label: "Standard", sub: "std::thread + STL", color: "var(--warn)" },
];

const timeline = [
  { step: "01", title: "Input Array", desc: "Random integer array generated in memory", color: "var(--accent3)" },
  { step: "02", title: "Threshold Check", desc: "If size > CHUNK_SIZE, fork new std::thread", color: "var(--accent)" },
  { step: "03", title: "Recursive Split", desc: "Array halved, each half sorted concurrently", color: "var(--warn)" },
  { step: "04", title: "Parallel Merge", desc: "Sorted halves merged with cache-aware passes", color: "var(--accent2)" },
  { step: "05", title: "perf Telemetry", desc: "L1/LLC cache misses + CPU cycles captured", color: "#c792ea" },
  { step: "06", title: "Python Pipeline", desc: "psutil monitors CPU, matplotlib renders charts", color: "var(--accent)" },
];

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const start = Date.now();
      const dur = 1200;
      const tick = () => {
        const p = Math.min((Date.now() - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(ease * target * 10) / 10);
        if (p < 1) requestAnimationFrame(tick);
      };
      tick();
      observer.disconnect();
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <section className="grid-bg" style={{ padding: '80px 24px 100px', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="animate-fade-up" style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-green">● SYSTEM READY</span>
            <span className="badge badge-orange">C++17</span>
            <span className="badge badge-blue">pthreads</span>
          </div>

          <h1 className="font-display animate-fade-up-2" style={{ fontSize: 'clamp(42px, 7vw, 90px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--text)' }}>
            Concurrent<br />
            <span className="glow-green">Merge Sort</span>
          </h1>

          <p className="animate-fade-up-3" style={{ marginTop: 24, maxWidth: 560, fontSize: 17, lineHeight: 1.7, color: 'var(--muted)', fontWeight: 300 }}>
            A high-performance multithreaded sorting engine built in C++17.
            Benchmarked across 5 data scales with full hardware telemetry — cache hits, CPU utilization, and automated chart generation.
          </p>

          <div className="animate-fade-up-3" style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/benchmarks"  style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--accent)', color: '#000',
              padding: '12px 24px', borderRadius: 6,
              fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', letterSpacing: '0.05em',
            }}>
              VIEW BENCHMARKS →
            </Link>
            <Link href="https://github.com/Kaushikmak/multithreaded_mergesort/tree/main?tab=readme-ov-file#4-cpu-utilization/*  */" target="_blank" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: 'var(--text)',
              padding: '12px 24px', borderRadius: 6,
              border: '1px solid var(--border-bright)',
              fontFamily: 'var(--font-mono)', fontSize: 13,
              textDecoration: 'none', letterSpacing: '0.05em',
            }}>
              GITHUB
            </Link>

            <Link href="/code" target="_blank" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: 'var(--text)',
              padding: '12px 24px', borderRadius: 6,
              border: '1px solid var(--border-bright)',
              fontFamily: 'var(--font-mono)', fontSize: 13,
              textDecoration: 'none', letterSpacing: '0.05em',
            }}>
              READ CODE
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '64px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p className="section-label" style={{ marginBottom: 32 }}>— benchmark results</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {stats.map(({ value, label, sub, color }) => {
              const num = parseFloat(value);
              const suffix = value.replace(String(num), '');
              return (
                <div key={label} className="card" style={{ padding: '28px 24px' }}>
                  <div className="stat-num" style={{ color, marginBottom: 8 }}>
                    {isNaN(num) ? value : <AnimatedCounter target={num} suffix={suffix} />}
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Performance Table */}
      <section style={{ padding: '64px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p className="section-label" style={{ marginBottom: 8 }}>— raw numbers</p>
          <h2 className="font-display" style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Performance Data</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-bright)' }}>
                  {['Array Size', 'Sequential (s)', 'Concurrent (s)', 'Speedup', 'Improvement'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)', fontWeight: 400, letterSpacing: '0.08em', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['10,000',     '0.001570', '0.000552', '2.84×', '64.86%'],
                  ['100,000',    '0.016018', '0.004468', '3.58×', '72.10%'],
                  ['1,000,000',  '0.091537', '0.015974', '5.73×', '82.54%'],
                  ['10,000,000', '0.950563', '0.112226', '8.06×', '87.59%'],
                  ['50,000,000', '4.782103', '0.714785', '6.69×', '85.05%'],
                ].map(([size, seq, conc, speedup, imp], i) => (
                  <tr key={size} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 16px', color: 'var(--text)', fontWeight: 500 }}>{size}</td>
                    <td style={{ padding: '14px 16px', color: '#ef4444' }}>{seq}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--accent)' }}>{conc}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: 'var(--warn)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{speedup}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: imp, background: 'linear-gradient(90deg, var(--accent2), var(--accent))', borderRadius: 2 }} />
                        </div>
                        <span style={{ color: 'var(--accent2)', minWidth: 48 }}>{imp}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>Source: bench_20260401_044334.csv</p>
        </div>
      </section>

      {/* Pipeline */}
      <section style={{ padding: '64px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p className="section-label" style={{ marginBottom: 8 }}>— how it works</p>
          <h2 className="font-display" style={{ fontSize: 32, fontWeight: 700, marginBottom: 40 }}>Execution Pipeline</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {timeline.map(({ step, title, desc, color }) => (
              <div key={step} className="card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: color, borderRadius: '3px 0 0 3px' }} />
                <div style={{ paddingLeft: 16 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: color, letterSpacing: '0.1em' }}>STEP {step}</span>
                  <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, margin: '8px 0 8px', color: 'var(--text)' }}>{title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Link href="/benchmarks" style={{ textDecoration: 'none' }}>
            <div className="card-accent" style={{ padding: '36px 32px', cursor: 'pointer', transition: 'transform 0.2s', borderRadius: 8 }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
              <div style={{ fontSize: 32, marginBottom: 16 }}><BarChart3 size={32} strokeWidth={1.5} /></div>
              <h3 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>Interactive Charts</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>Explore 6 interactive visualizations — speedup curves, cache behavior, CPU utilization, and chunk-size optimization.</p>
            </div>
          </Link>
          <Link href="/code" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '36px 32px', cursor: 'pointer', transition: 'transform 0.2s', borderRadius: 8 }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
              <div style={{ fontSize: 32, marginBottom: 16 }}><Code2 size={32} strokeWidth={1.5} /></div>
              <h3 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent2)', marginBottom: 8 }}>Code Walkthrough</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>Annotated C++ source code explaining the concurrency model, threshold tuning, cache optimization, and telemetry integration.</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}