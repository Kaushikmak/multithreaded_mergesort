import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multithreaded Merge Sort — Performance Suite",
  description: "High-performance concurrent merge sort with hardware telemetry and automated visualization.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <nav>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)', textDecoration: 'none', letterSpacing: '0.05em' }}>
              ⚡ MERGESORT<span style={{ color: 'var(--muted)' }}>::MT</span>
            </Link>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { href: '/', label: 'Overview' },
                { href: '/benchmarks', label: 'Benchmarks' },
                { href: '/code', label: 'Code' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--muted)',
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  transition: 'color 0.15s',
                }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <div style={{ paddingTop: 56, flex: 1 }}>
          {children}
        </div>
        <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
            MergeSort bench · tastytaco 
          </p>
        </footer>
      </body>
    </html>
  );
}