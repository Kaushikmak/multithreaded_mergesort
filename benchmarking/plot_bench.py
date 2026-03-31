import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import glob
import textwrap
import shutil

CSV_DIR = "benchmarking/results/csv"
PNG_DIR = "benchmarking/results/png"
CACHE_FILE_PATH = "benchmarking/results/cache_stats.txt"

def find_latest_benchmark_file(directory: str) -> str:
    list_of_files = glob.glob(f"{directory}/bench_*.csv")
    if not list_of_files:
        return None
    return max(list_of_files, key=os.path.getctime)

def apply_dark_theme():
    plt.style.use('dark_background')
    sns.set_theme(style="darkgrid", rc={
        "axes.facecolor": "#121212",
        "figure.facecolor": "#121212",
        "grid.color": "#2a2a2a",
        "text.color": "#e0e0e0",
        "axes.labelcolor": "#e0e0e0",
        "xtick.color": "#e0e0e0",
        "ytick.color": "#e0e0e0",
        "lines.linewidth": 2.5,
    })

def save_with_explanation(fig, output_path, text):
    """Injects explanation below the chart and saves with tight bounding box."""
    wrapped_text = textwrap.fill(text, width=110)
    fig.text(0.5, -0.05, wrapped_text, ha='center', va='top', fontsize=11, 
             color='#a0a0a0', style='italic', bbox=dict(facecolor='#1a1a1a', edgecolor='none', pad=10.0))
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

def visualize_benchmark(csv_file: str):
    df = pd.read_csv(csv_file)
    
    file_basename = os.path.basename(csv_file)
    file_name_no_ext = os.path.splitext(file_basename)[0]
    output_dir = os.path.join(PNG_DIR, file_name_no_ext)
    os.makedirs(output_dir, exist_ok=True)
    
    apply_dark_theme()

    df['Improvement_Percent'] = df['Improvement_Percent'].clip(lower=-100.0)

    fig = plt.figure(figsize=(10, 6))
    best_conc = df.loc[df.groupby('Array_Size')['Concurrent_Time_s'].idxmin()]
    sns.lineplot(data=best_conc, x='Array_Size', y='Sequential_Time_s', label='Standard Sort (Sequential)', marker='o', color='#ff6b6b')
    sns.lineplot(data=best_conc, x='Array_Size', y='Concurrent_Time_s', label='Fast Sort (Multithreaded)', marker='s', color='#4ecdc4')
    plt.xscale('log')
    plt.yscale('log')
    plt.title('1. Performance Comparison: Standard vs. Multithreaded', fontsize=14, weight='bold')
    plt.xlabel('Amount of Data (Number of Elements)')
    plt.ylabel('Time Taken (Seconds)')
    plt.legend(bbox_to_anchor=(1.02, 1), loc='upper left')
    
    explanation_1 = "LOWER IS BETTER. This graph shows the absolute time required to sort data. As dataset sizes scale up exponentially (moving right), the sequential method execution time diverges significantly from the optimized multithreaded method."
    save_with_explanation(fig, f"{output_dir}/01_Speed_Comparison.png", explanation_1)

    fig = plt.figure(figsize=(10, 6))
    sns.lineplot(data=best_conc, x='Array_Size', y='Speedup', marker='o', color='#feca57')
    plt.xscale('log')
    plt.axhline(1.0, color='#ff4757', linestyle='--', label='No Improvement (1x)')
    plt.title('2. The Speedup Multiplier: Processing Efficiency', fontsize=14, weight='bold')
    plt.xlabel('Amount of Data (Number of Elements)')
    plt.ylabel('Speedup Multiplier (Ts / Tc)')
    plt.legend(bbox_to_anchor=(1.02, 1), loc='upper left')
    
    explanation_2 = "HIGHER IS BETTER. Represents the mathematical speedup factor. A value of '4' indicates the multithreaded algorithm processed the array 4 times faster than the sequential baseline. Concurrency yields zero or negative benefits on small arrays due to thread spawning overhead."
    save_with_explanation(fig, f"{output_dir}/02_Speedup_Multiplier.png", explanation_2)


    fig = plt.figure(figsize=(10, 6))
    large_data = df[df['Array_Size'] >= 100000]
    sns.lineplot(data=large_data, x='Threshold', y='Speedup', hue='Array_Size', marker='D', palette='cool')
    plt.xscale('log')
    plt.axhline(1.0, color='#ff4757', linestyle='--')
    plt.title('3. Finding the Sweet Spot: Tuning Chunk Size', fontsize=14, weight='bold')
    plt.xlabel('Chunk Size Setting (Threshold Elements)')
    plt.ylabel('Speedup Multiplier')
    plt.legend(title="Data Size", bbox_to_anchor=(1.02, 1), loc='upper left')
    
    explanation_3 = "HIGHER IS BETTER. Maps the performance impact of the 'Threshold' variable. Low thresholds (left) induce thread thrashing (OS scheduler overload). High thresholds (right) cause premature sequential fallback. The optimal concurrency state is located at the peak of the respective curves."
    save_with_explanation(fig, f"{output_dir}/03_Optimal_Chunk_Size.png", explanation_3)


    fig = plt.figure(figsize=(10, 6))
    meaningful_data = df[df['Array_Size'] >= 1000]
    sns.lineplot(data=meaningful_data, x='Array_Size', y='Improvement_Percent', hue='Threshold', marker='o', palette='viridis')
    plt.xscale('log')
    plt.axhline(0.0, color='#ff4757', linestyle='--')
    plt.title('4. Time Saved (%) vs. Amount of Data', fontsize=14, weight='bold')
    plt.xlabel('Amount of Data (Number of Elements)')
    plt.ylabel('Time Saved (%)')
    plt.legend(title="Threshold", bbox_to_anchor=(1.02, 1), loc='upper left')
    
    explanation_4 = "HIGHER IS BETTER. Displays the percentage reduction in execution time. Negative values (capped at -100% for readability) indicate the multithreaded approach was slower than the sequential baseline due to architectural overhead."
    save_with_explanation(fig, f"{output_dir}/04_Time_Saved_Percent.png", explanation_4)

    fig = plt.figure(figsize=(10, 6))
    heavy_data = best_conc[best_conc['Array_Size'] >= 100000]
    
    melted_df = pd.melt(heavy_data, id_vars=['Array_Size'], 
                        value_vars=['Sequential_Time_s', 'Concurrent_Time_s'],
                        var_name='Mode', value_name='Seconds')
    melted_df['Mode'] = melted_df['Mode'].replace({'Sequential_Time_s': 'Sequential', 'Concurrent_Time_s': 'Optimal Concurrent'})

    sns.barplot(data=melted_df, x='Array_Size', y='Seconds', hue='Mode', palette='muted')
    plt.yscale('log')
    plt.title('5. Heavy Workload Execution Time Comparison', fontsize=14, weight='bold')
    plt.xlabel('Amount of Data (Number of Elements)')
    plt.ylabel('Execution Time (Seconds) - Log Scale')
    plt.legend(title="Execution Mode", bbox_to_anchor=(1.02, 1), loc='upper left')

    explanation_5 = "LOWER IS BETTER. A direct visual comparison of final execution times for large datasets. Using a logarithmic Y-axis prevents the 50,000,000 element benchmark from dwarfing the visual scale of the smaller arrays."
    save_with_explanation(fig, f"{output_dir}/05_Bar_Chart_Heavy_Workloads.png", explanation_5)

    if os.path.exists(CACHE_FILE_PATH):
        target_path = os.path.join(output_dir, "cache_stats.txt")
        shutil.move(CACHE_FILE_PATH, target_path)
        print(f"[{file_basename}] Moved cache_stats.txt into run directory.")

    print(f"[{file_basename}] Analysis complete. 5 updated graphs saved to {output_dir}/")

if __name__ == "__main__":
    latest_file = find_latest_benchmark_file(CSV_DIR)
    if latest_file:
        visualize_benchmark(latest_file)
    else:
        print("Error: No CSV benchmark files found.")