"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
  { size: '10K', seq: 0.00157, conc: 0.00055, speedup: 2.84 },
  { size: '100K', seq: 0.01601, conc: 0.00446, speedup: 3.58 },
  { size: '1M', seq: 0.09153, conc: 0.01597, speedup: 5.73 },
  { size: '10M', seq: 0.95056, conc: 0.11222, speedup: 8.06 },
  { size: '50M', seq: 4.78210, conc: 0.71478, speedup: 6.69 },
];

export function BenchmarkChart() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <h3 className="mb-4 text-lg font-medium">Execution Time (Standard vs Fast)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="size" stroke="#71717a" />
              <YAxis scale="log" domain={['auto', 'auto']} stroke="#71717a" />
              <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a' }} />
              <Legend />
              <Line type="monotone" dataKey="seq" name="Sequential" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="conc" name="Multithreaded" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <h3 className="mb-4 text-lg font-medium">Calculated Speedup Factor</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="size" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip cursor={{fill: '#18181b'}} contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a' }} />
              <Bar dataKey="speedup" name="Speedup (x)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}