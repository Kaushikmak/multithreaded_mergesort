import psutil
import subprocess
import time
import pandas as pd
import matplotlib.pyplot as plt
import os
import glob

def find_latest_csv(directory: str) -> str:
    """Locates the most recently modified CSV file."""
    files = glob.glob(f"{directory}/bench_*.csv")
    return max(files, key=os.path.getctime) if files else None

def monitor_and_plot():
    # Launch the C++ benchmark
    process = subprocess.Popen(['./build/run_benchmark'])
    pid = process.pid
    
    ps_process = psutil.Process(pid)
    telemetry = []
    start_time = time.time()

    try:
        # Polling loop: capture CPU utilization every 50ms
        while process.poll() is None:
            elapsed = time.time() - start_time
            cpu_usage = ps_process.cpu_percent(interval=0.05) 
            telemetry.append({'Time_s': elapsed, 'CPU_Percent': cpu_usage})
    except psutil.NoSuchProcess:
        pass

    # Dynamically resolve the correct output directory based on the CSV generated
    csv_file = find_latest_csv("benchmarking/results/csv")
    if csv_file:
        basename = os.path.splitext(os.path.basename(csv_file))[0]
        output_dir = f"benchmarking/results/png/{basename}"
        os.makedirs(output_dir, exist_ok=True)
        out_path = f"{output_dir}/CPU_Utilization.png"
    else:
        os.makedirs("benchmarking/results/png", exist_ok=True)
        out_path = "benchmarking/results/png/CPU_Utilization.png"

    # Generate Visualization
    df = pd.DataFrame(telemetry)
    plt.style.use('dark_background')
    plt.figure(figsize=(10, 6))
    plt.plot(df['Time_s'], df['CPU_Percent'], color='#ffb86c', linewidth=2)
    plt.fill_between(df['Time_s'], df['CPU_Percent'], color='#ffb86c', alpha=0.2)
    plt.title('CPU Utilization vs. Execution Time', weight='bold')
    plt.xlabel('Time (Seconds)')
    plt.ylabel('CPU Utilization (%)')
    plt.grid(color='#2a2a2a')
    plt.tight_layout()
    plt.savefig(out_path, dpi=300)
    print(f"[Telemetry] CPU Utilization graph saved to {out_path}")

if __name__ == "__main__":
    monitor_and_plot()