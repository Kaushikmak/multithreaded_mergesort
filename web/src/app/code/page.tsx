"use client";
import { useState } from "react";

const sections = [
  {
    id: "hpp-concurrent",
    label: "01 / ConcurrentMergeSorter",
    file: "src/app/parallel/mergesort.hpp",
    lang: "cpp",
    title: "Class Declaration & THRESHOLD",
    summary:
      "The concurrent sorter is a templated class. The key design decision is THRESHOLD — an inline static variable that controls when the algorithm switches from spawning new threads to sorting sequentially. Being inline static means it can be changed at runtime per-benchmark without recompiling.",
    insightColor: "var(--accent)",
    insight:
      "inline static allows THRESHOLD to be mutated from benchmarking.cpp at runtime: ConcurrentMergeSorter<int>::THRESHOLD = thresh; — this is what drives the chunk-size tuning graphs.",
    lines: [
      { t: "macro",   v: "#ifndef CONCURRENT_MERGESORT_H" },
      { t: "macro",   v: "#define CONCURRENT_MERGESORT_H" },
      { t: "blank" },
      { t: "macro",   v: "#include <vector>" },
      { t: "macro",   v: "#include <thread>" },
      { t: "blank" },
      { t: "kw",      v: "template", s: "<typename T>" },
      { t: "plain",   v: "class ", hi: "ConcurrentMergeSorter", s: " {" },
      { t: "plain",   v: "public:" },
      { t: "blank" },
      { t: "comment", v: "    // Runtime-tunable — changed per benchmark run" },
      { t: "indent",  v: "    ", kw: "inline static ", hi: "THRESHOLD", s: " = 10000;" },
      { t: "blank" },
      { t: "indent",  v: "    ", kw: "static void ", hi: "sort", s: "(std::vector<T> &nums);" },
      { t: "blank" },
      { t: "plain",   v: "private:" },
      { t: "indent",  v: "    ", kw: "static void ", hi: "merge",     s: "(std::vector<T> &nums, int left, int right);" },
      { t: "indent",  v: "    ", kw: "static void ", hi: "mergesort", s: "(std::vector<T> &nums, int left, int right);" },
      { t: "plain",   v: "};" },
      { t: "blank" },
      { t: "macro",   v: '#include "mergesort.tpp"' },
      { t: "macro",   v: "#endif" },
    ],
  },
  {
    id: "tpp-mergesort",
    label: "02 / Recursive Thread Fork",
    file: "src/app/parallel/mergesort.tpp",
    lang: "cpp",
    title: "Concurrent mergesort() — Thread Spawning",
    summary:
      "This is the heart of the algorithm. When the sub-array is larger than THRESHOLD, two std::thread objects are spawned — one for each half. Thread creation is wrapped in try/catch: if the OS rejects a new thread (EAGAIN), the sort falls back to sequential recursion on that half. Both threads are joined before merging.",
    insightColor: "var(--accent2)",
    insight:
      "thread_local double local_merge_time accumulates per-thread merge timing without a mutex — each thread writes to its own copy of the variable, avoiding false sharing and lock contention entirely.",
    lines: [
      { t: "macro",   v: '#include "mergesort.hpp"' },
      { t: "blank" },
      { t: "comment", v: "// Per-thread merge timer — no mutex needed" },
      { t: "plain",   v: "thread_local double local_merge_time = 0.0;" },
      { t: "blank" },
      { t: "kw",      v: "template", s: "<typename T>" },
      { t: "plain",   v: "void ConcurrentMergeSorter<T>::", hi: "mergesort", s: "(std::vector<T> &nums, int left, int right) {" },
      { t: "indent",  v: "    auto start = std::chrono::high_resolution_clock::", hi: "now", s: "();" },
      { t: "indent",  v: "    if (right <= left) return;" },
      { t: "indent",  v: "    int mid = left + (right - left) / 2;" },
      { t: "blank" },
      { t: "comment", v: "    // Fork threads only when slice exceeds THRESHOLD" },
      { t: "indent",  v: "    if ((right - left) > ", hi: "THRESHOLD", s: ") {" },
      { t: "indent",  v: "        std::thread t1, t2;" },
      { t: "indent",  v: "        bool t1_started = false, t2_started = false;" },
      { t: "indent",  v: "        try {" },
      { t: "indent",  v: "            t1 = std::thread(ConcurrentMergeSorter<T>::", hi: "mergesort", s: "," },
      { t: "indent",  v: "                             std::ref(nums), left, mid);" },
      { t: "indent",  v: "            t1_started = true;" },
      { t: "indent",  v: "            t2 = std::thread(ConcurrentMergeSorter<T>::", hi: "mergesort", s: "," },
      { t: "indent",  v: "                             std::ref(nums), mid + 1, right);" },
      { t: "indent",  v: "            t2_started = true;" },
      { t: "indent",  v: "        } catch (const std::system_error& e) {}" },
      { t: "blank" },
      { t: "comment", v: "        // Fallback to sequential if thread spawn failed" },
      { t: "indent",  v: "        if (t1_started) t1.", hi: "join", s: "(); else ", hi2: "mergesort", s2: "(nums, left, mid);" },
      { t: "indent",  v: "        if (t2_started) t2.", hi: "join", s: "(); else ", hi2: "mergesort", s2: "(nums, mid+1, right);" },
      { t: "indent",  v: "    } else {" },
      { t: "comment", v: "        // Sequential recursion below threshold" },
      { t: "indent",  v: "        ", hi: "mergesort", s: "(nums, left, mid);" },
      { t: "indent",  v: "        ", hi: "mergesort", s: "(nums, mid + 1, right);" },
      { t: "indent",  v: "    }" },
      { t: "blank" },
      { t: "indent",  v: "    ", hi: "merge", s: "(nums, left, right);" },
      { t: "indent",  v: "    auto end = std::chrono::high_resolution_clock::", hi: "now", s: "();" },
      { t: "indent",  v: "    local_merge_time += std::chrono::duration<double>(end - start).", hi: "count", s: "();" },
      { t: "plain",   v: "}" },
    ],
  },
  {
    id: "tpp-merge",
    label: "03 / Merge Step",
    file: "src/app/parallel/mergesort.tpp",
    lang: "cpp",
    title: "The merge() Function",
    summary:
      "The merge uses two temporary vectors — one for each half — then walks both with index pointers, writing the smaller element back into the original array. The two remaining while-loops drain whichever half still has elements.",
    insightColor: "var(--accent3)",
    insight:
      "Splitting into two named vectors (first, second) rather than one buffer simplifies boundary arithmetic and avoids the off-by-one errors common with single-buffer mid-index tricks. The cost is two allocations per merge call.",
    lines: [
      { t: "kw",     v: "template", s: "<typename T>" },
      { t: "plain",  v: "void ConcurrentMergeSorter<T>::", hi: "merge", s: "(std::vector<T> &nums, int left, int right) {" },
      { t: "indent", v: "    int mid = left + (right - left) / 2;" },
      { t: "blank" },
      { t: "comment",v: "    // Copy each half into a named temporary buffer" },
      { t: "indent", v: "    std::vector<T> first(nums.", hi: "begin", s: "() + left,     nums.", hi2: "begin", s2: "() + mid + 1);" },
      { t: "indent", v: "    std::vector<T> second(nums.", hi: "begin", s: "() + mid + 1, nums.", hi2: "begin", s2: "() + right + 1);" },
      { t: "blank" },
      { t: "indent", v: "    size_t i = 0, j = 0;  int k = left;" },
      { t: "blank" },
      { t: "indent", v: "    while (i < first.", hi: "size", s: "() && j < second.", hi2: "size", s2: "()) {" },
      { t: "indent", v: "        if (first[i] <= second[j])" },
      { t: "indent", v: "            nums[k++] = first[i++];" },
      { t: "indent", v: "        else" },
      { t: "indent", v: "            nums[k++] = second[j++];" },
      { t: "indent", v: "    }" },
      { t: "blank" },
      { t: "comment",v: "    // Drain whichever half still has elements" },
      { t: "indent", v: "    while (i < first.", hi: "size", s: "())  nums[k++] = first[i++];" },
      { t: "indent", v: "    while (j < second.", hi: "size", s: "()) nums[k++] = second[j++];" },
      { t: "plain",  v: "}" },
    ],
  },
  {
    id: "benchmarking",
    label: "04 / Benchmarking Engine",
    file: "benchmarking/benchmarking.cpp",
    lang: "cpp",
    title: "Multi-Size × Multi-Threshold Grid",
    summary:
      "The benchmark sweeps every combination of array size × threshold, but guards against thread explosion: if SIZE / threshold > 10,000 the combination is skipped. A seeded mt19937 RNG ensures reproducible inputs across all runs. Sequential time is measured once per size; concurrent time is measured for each threshold.",
    insightColor: "var(--warn)",
    insight:
      "The thread-limit guard (SIZE / thresh > 10000) prevents the OS from being flooded with thousands of simultaneous threads — the real failure mode when threshold is far too small relative to array size.",
    lines: [
      { t: "comment", v: "// Sizes and thresholds to sweep" },
      { t: "plain",   v: "std::vector<int> sizes = {0, 1, 2, 1000, 10000, 65536," },
      { t: "plain",   v: "    1048576, 100000, 500000, 1000000, 10000000, 50000000};" },
      { t: "blank" },
      { t: "plain",   v: "std::vector<int> thresholds = {10, 100, 1024, 8192, 16384," },
      { t: "plain",   v: "    50000, 100000, 500000, 5000000, 10000000};" },
      { t: "blank" },
      { t: "comment", v: "// Seeded RNG — same data every run" },
      { t: "plain",   v: "std::mt19937 rng(42);" },
      { t: "plain",   v: "std::uniform_int_distribution<int> dist(1, 100000);" },
      { t: "blank" },
      { t: "plain",   v: "for (int SIZE : sizes) {" },
      { t: "indent",  v: "    // Sequential sort — timed once per size" },
      { t: "indent",  v: "    double t_seq = ", hi: "timeSortSequential", s: "(original_nums);" },
      { t: "blank" },
      { t: "indent",  v: "    for (int thresh : thresholds) {" },
      { t: "comment", v: "        // Guard: skip if too many threads would spawn" },
      { t: "indent",  v: "        if ((SIZE / thresh) > 10000) continue;" },
      { t: "blank" },
      { t: "indent",  v: "        ConcurrentMergeSorter<int>::", hi: "THRESHOLD", s: " = thresh;" },
      { t: "indent",  v: "        double t_conc = ", hi: "timeSortConcurrent", s: "(original_nums);" },
      { t: "blank" },
      { t: "indent",  v: "        double speedup     = t_seq / t_conc;" },
      { t: "indent",  v: "        double improvement = (t_seq - t_conc) / t_seq * 100.0;" },
      { t: "blank" },
      { t: "indent",  v: "        report_file << SIZE << \",\" << t_seq << \",\"" },
      { t: "indent",  v: "                    << thresh << \",\" << t_conc << \",\"" },
      { t: "indent",  v: "                    << speedup << \",\" << improvement << \"\\n\";" },
      { t: "indent",  v: "    }" },
      { t: "plain",   v: "}" },
    ],
  },
  {
    id: "monitor",
    label: "05 / CPU Monitor",
    file: "benchmarking/monitor_cpu.py",
    lang: "python",
    title: "Real-Time psutil Telemetry",
    summary:
      "monitor_cpu.py launches the C++ benchmark as a child process via subprocess.Popen, then polls psutil.cpu_percent() every 50ms while that process is alive. It resolves the output directory dynamically by finding the CSV that was just written, so the utilization graph lands in the correct timestamped run folder.",
    insightColor: "#c792ea",
    insight:
      "cpu_percent(interval=0.05) blocks for 50ms and measures actual CPU time in that window — far more accurate than the non-blocking form, which returns near-zero on the first call because there is no prior measurement to delta against.",
    lines: [
      { t: "plain",   v: "import psutil, subprocess, time, pandas, matplotlib, os, glob" },
      { t: "blank" },
      { t: "fn",     v: "def ", hi: "monitor_and_plot", s: "():" },
      { t: "comment", v: "    # Launch C++ benchmark as a child process" },
      { t: "indent", v: "    process = subprocess.", hi: "Popen", s: "(['./build/run_benchmark'])" },
      { t: "indent", v: "    ps_process = psutil.", hi: "Process", s: "(process.pid)" },
      { t: "indent", v: "    telemetry = [];  start_time = time.", hi: "time", s: "()" },
      { t: "blank" },
      { t: "comment", v: "    # Poll every 50ms while benchmark is running" },
      { t: "indent", v: "    while process.", hi: "poll", s: "() is None:" },
      { t: "indent", v: "        elapsed   = time.", hi: "time", s: "() - start_time" },
      { t: "indent", v: "        cpu_usage = ps_process.", hi: "cpu_percent", s: "(interval=0.05)" },
      { t: "indent", v: "        telemetry.", hi: "append", s: "({'Time_s': elapsed, 'CPU_Percent': cpu_usage})" },
      { t: "blank" },
      { t: "comment", v: "    # Resolve output path from the CSV just written" },
      { t: "indent", v: "    csv_file = ", hi: "find_latest_csv", s: "('benchmarking/results/csv')" },
      { t: "indent", v: "    out_path = f'benchmarking/results/png/{basename}/CPU_Utilization.png'" },
      { t: "blank" },
      { t: "indent", v: "    df = pd.", hi: "DataFrame", s: "(telemetry)" },
      { t: "indent", v: "    plt.", hi: "plot", s: "(df['Time_s'], df['CPU_Percent'], color='#ffb86c', linewidth=2)" },
      { t: "indent", v: "    plt.", hi: "fill_between", s: "(df['Time_s'], df['CPU_Percent'], alpha=0.2)" },
      { t: "indent", v: "    plt.", hi: "savefig", s: "(out_path, dpi=300)" },
    ],
  },
  {
    id: "plot",
    label: "06 / Plotting Pipeline",
    file: "benchmarking/plot_bench.py",
    lang: "python",
    title: "5-Chart matplotlib / seaborn Pipeline",
    summary:
      "plot_bench.py reads the latest timestamped CSV, applies a dark seaborn theme, and generates 5 charts. Each chart is saved via save_with_explanation() which injects an italic annotation below the figure before calling savefig with bbox_inches='tight'. Improvement_Percent is clipped at -100 before plotting to prevent astronomical negatives from tiny arrays.",
    insightColor: "var(--accent)",
    insight:
      "df['Improvement_Percent'].clip(lower=-100) is essential — without it, near-zero-size arrays (sizes 0, 1, 2) produce t_conc values close to 0, making the percentage formula blow up and destroying the Y-axis scale for all other data.",
    lines: [
      { t: "plain",   v: "import pandas, matplotlib, seaborn, os, glob, textwrap, shutil" },
      { t: "blank" },
      { t: "fn",     v: "def ", hi: "find_latest_benchmark_file", s: "(directory):" },
      { t: "indent", v: "    files = glob.", hi: "glob", s: "(f'{directory}/bench_*.csv')" },
      { t: "indent", v: "    return max(files, key=os.path.", hi: "getctime", s: ") if files else None" },
      { t: "blank" },
      { t: "fn",     v: "def ", hi: "save_with_explanation", s: "(fig, path, text):" },
      { t: "comment", v: "    # Inject italic caption below chart bounds, then save" },
      { t: "indent", v: "    wrapped = textwrap.", hi: "fill", s: "(text, width=110)" },
      { t: "indent", v: "    fig.", hi: "text", s: "(0.5, -0.05, wrapped, ha='center', style='italic')" },
      { t: "indent", v: "    plt.", hi: "savefig", s: "(path, dpi=300, bbox_inches='tight')" },
      { t: "blank" },
      { t: "fn",     v: "def ", hi: "visualize_benchmark", s: "(csv_file):" },
      { t: "indent", v: "    df = pd.", hi: "read_csv", s: "(csv_file)" },
      { t: "blank" },
      { t: "comment", v: "    # Clip extreme negatives to keep Y-axis sane" },
      { t: "indent", v: "    df['Improvement_Percent'] = df['Improvement_Percent'].", hi: "clip", s: "(lower=-100.0)" },
      { t: "blank" },
      { t: "comment", v: "    # Pick best concurrent run per array size" },
      { t: "indent", v: "    best = df.loc[df.", hi: "groupby", s: "('Array_Size')['Concurrent_Time_s'].", hi2: "idxmin", s2: "()]" },
      { t: "blank" },
      { t: "comment", v: "    # Chart 1 — log-log speed comparison" },
      { t: "indent", v: "    sns.", hi: "lineplot", s: "(data=best, x='Array_Size', y='Sequential_Time_s', ...)" },
      { t: "indent", v: "    sns.", hi: "lineplot", s: "(data=best, x='Array_Size', y='Concurrent_Time_s', ...)" },
      { t: "blank" },
      { t: "comment", v: "    # Charts 2–5: speedup, chunk tuning, % saved, bar" },
      { t: "indent", v: "    # ... (same pattern, different axes)" },
      { t: "blank" },
      { t: "comment", v: "    # Move perf cache stats into the run directory" },
      { t: "indent", v: "    shutil.", hi: "move", s: "(CACHE_FILE_PATH, output_dir)" },
    ],
  },
  {
    id: "makefile",
    label: "07 / Makefile",
    file: "Makefile",
    lang: "make",
    title: "Three-Target Build System",
    summary:
      "The Makefile exposes three user-facing targets. make run builds and runs main.cpp. make bench builds the benchmark binary, then chains monitor_cpu.py (which itself launches the binary as a subprocess) followed by plot_bench.py. make clean removes the build directory.",
    insightColor: "var(--accent2)",
    insight:
      "make bench chains monitor_cpu.py before plot_bench.py intentionally — the monitor launches the C++ binary as a subprocess, so the benchmark runs and writes its CSV, then plot_bench.py immediately picks up that file. Running them in the opposite order would plot stale data.",
    lines: [
      { t: "plain",   v: "CXX      = g++" },
      { t: "plain",   v: "CXXFLAGS = -std=c++17 -O3 -pthread -Wall -Wextra" },
      { t: "blank" },
      { t: "plain",   v: "BUILD_DIR = build" },
      { t: "plain",   v: "BENCH_DIR = benchmarking" },
      { t: "plain",   v: "SRC_DIR   = src/app" },
      { t: "blank" },
      { t: "comment", v: "# Benchmark binary — separate from main app" },
      { t: "plain",   v: "$(BENCH_TARGET): $(BENCH_SRC) | $(BUILD_DIR)" },
      { t: "plain",   v: "\t$(CXX) $(CXXFLAGS) -o $(BENCH_TARGET) $(BENCH_SRC)" },
      { t: "blank" },
      { t: "comment", v: "# Main app binary" },
      { t: "plain",   v: "$(MAIN_TARGET): $(MAIN_SRC) | $(BUILD_DIR)" },
      { t: "plain",   v: "\t$(CXX) $(CXXFLAGS) -o $(MAIN_TARGET) $(MAIN_SRC)" },
      { t: "blank" },
      { t: "hi2",     v: "run", s: ": $(MAIN_TARGET)" },
      { t: "plain",   v: "\t./$(MAIN_TARGET)" },
      { t: "blank" },
      { t: "comment", v: "# Full pipeline: build → monitor (runs C++) → plot" },
      { t: "hi2",     v: "bench", s: ": $(BENCH_TARGET)" },
      { t: "plain",   v: "\t$(PYTHON) $(MONITOR_SCRIPT)   # launches binary internally" },
      { t: "plain",   v: "\t$(PYTHON) $(PLOT_SCRIPT)      # reads CSV written above" },
      { t: "blank" },
      { t: "hi2",     v: "clean", s: ":" },
      { t: "plain",   v: "\trm -rf $(BUILD_DIR)" },
    ],
  },
];

// ─── token renderer ────────────────────────────────────────────────────────

function Line({ l }: { l: Record<string, string | undefined> }) {
  const Kw  = ({ c }: { c: string }) => <span style={{ color: "#c792ea" }}>{c}</span>;
  const Hi  = ({ c }: { c: string }) => <span style={{ color: "#82aaff" }}>{c}</span>;
  const Hi2 = ({ c }: { c: string }) => <span style={{ color: "#00ff88" }}>{c}</span>;
  const Pl  = ({ c }: { c: string }) => <span style={{ color: "#e8e8e8" }}>{c}</span>;

  if (l.t === "blank")   return <div style={{ height: 8 }} />;
  if (l.t === "comment") return <div><span style={{ color: "#546e7a", fontStyle: "italic" }}>{l.v}</span></div>;
  if (l.t === "macro")   return <div><span style={{ color: "#ff6b35" }}>{l.v}</span></div>;

  if (l.t === "kw")  return <div><Kw c={l.v ?? ""} /><Pl c={l.s ?? ""} /></div>;
  if (l.t === "fn")  return <div><Kw c={l.v ?? ""} />{l.hi && <Hi2 c={l.hi} />}{l.s && <Pl c={l.s} />}</div>;
  if (l.t === "hi2") return <div><Hi2 c={l.v ?? ""} /><Pl c={l.s ?? ""} /></div>;

  // generic multi-token line
  return (
    <div>
      {l.v   && <Pl  c={l.v} />}
      {l.kw  && <Kw  c={l.kw} />}
      {l.hi  && <Hi  c={l.hi} />}
      {l.s   && <Pl  c={l.s} />}
      {l.hi2 && <Hi  c={l.hi2} />}
      {l.s2  && <Pl  c={l.s2} />}
      {l.hi3 && <Hi2 c={l.hi3} />}
      {l.s3  && <Pl  c={l.s3} />}
    </div>
  );
}

// ─── page ──────────────────────────────────────────────────────────────────

export default function CodePage() {
  const [active, setActive] = useState(0);
  const sec = sections[active];

  const langColor: Record<string, string> = {
    cpp:    "var(--accent3)",
    python: "#c792ea",
    make:   "var(--accent2)",
  };

  return (
    <div className="code-page-layout">

      {/* ── Sidebar ── */}
      <aside style={{
        borderRight: "1px solid var(--border)",
        padding: "48px 0",
        position: "sticky",
        top: 56,
        height: "calc(100vh - 56px)",
        overflowY: "auto",
      }}>
        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          <p className="section-label">source walkthrough</p>
        </div>
        {sections.map((s, i) => (
          <button key={s.id} onClick={() => setActive(i)} style={{
            width: "100%", textAlign: "left", padding: "12px 20px",
            background: active === i ? "rgba(0,255,136,0.06)" : "transparent",
            borderLeft: active === i ? "2px solid var(--accent)" : "2px solid transparent",
            border: "none", cursor: "pointer", transition: "all 0.15s",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: active === i ? "var(--accent)" : "var(--muted)", letterSpacing: "0.08em", marginBottom: 4 }}>
              {s.label.split(" / ")[0]}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: active === i ? "var(--text)" : "var(--muted)" }}>
              {s.label.split(" / ")[1]}
            </div>
          </button>
        ))}
      </aside>

      {/* ── Main ── */}
      <main style={{ padding: "48px 40px", maxWidth: 900 }}>
        <div key={sec.id}>

          {/* breadcrumb */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: langColor[sec.lang] ?? "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {sec.lang}
            </span>
            <span style={{ color: "var(--border-bright)" }}>·</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>{sec.file}</span>
          </div>

          <h1 className="font-display" style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>
            {sec.title}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.75, marginBottom: 32, maxWidth: 660 }}>
            {sec.summary}
          </p>

          {/* terminal code block */}
          <div className="terminal" style={{ marginBottom: 24 }}>
            <div className="terminal-bar">
              <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
              <span style={{ marginLeft: 12, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
                {sec.file.split("/").pop()}
              </span>
              <span style={{
                marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10,
                color: langColor[sec.lang],
                padding: "2px 8px",
                background: `${langColor[sec.lang]}11`,
                border: `1px solid ${langColor[sec.lang]}33`,
                borderRadius: 4,
              }}>
                {sec.lang.toUpperCase()}
              </span>
            </div>
            <div style={{ padding: "20px 24px", lineHeight: 1.85, fontFamily: "var(--font-mono)", fontSize: 13 }}>
              {sec.lines.map((l, i) => <Line key={i} l={l} />)}
            </div>
          </div>

          {/* insight */}
          <div style={{
            padding: "16px 20px", background: "var(--surface2)", borderRadius: 6,
            border: `1px solid ${sec.insightColor}22`, borderLeft: `3px solid ${sec.insightColor}`,
            marginBottom: 48,
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: sec.insightColor, letterSpacing: "0.08em" }}>
              💡 INSIGHT —{" "}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }}>
              {sec.insight}
            </span>
          </div>

          {/* prev / next */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 24, borderTop: "1px solid var(--border)" }}>
            <button onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0}
              style={{
                fontFamily: "var(--font-mono)", fontSize: 13,
                color: active === 0 ? "var(--border)" : "var(--muted)",
                background: "none", border: "1px solid var(--border)",
                padding: "8px 16px", borderRadius: 6, cursor: active === 0 ? "default" : "pointer",
              }}>
              ← PREV
            </button>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", alignSelf: "center" }}>
              {active + 1} / {sections.length}
            </span>
            <button onClick={() => setActive(Math.min(sections.length - 1, active + 1))} disabled={active === sections.length - 1}
              style={{
                fontFamily: "var(--font-mono)", fontSize: 13,
                color: active === sections.length - 1 ? "var(--border)" : "var(--accent)",
                background: "none",
                border: `1px solid ${active === sections.length - 1 ? "var(--border)" : "rgba(0,255,136,0.3)"}`,
                padding: "8px 16px", borderRadius: 6, cursor: active === sections.length - 1 ? "default" : "pointer",
              }}>
              NEXT →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}