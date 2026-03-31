import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import glob

CSV_DIR = "benchmarking/results/csv"
PNG_DIR = "benchmarking/results/png"

def find_latest_benchmark_file(directory: str) -> str:
    """
    Locates the most recently modified CSV file in the specified directory.
    """
    list_of_files = glob.glob(f"{directory}/bench_*.csv")
    if not list_of_files:
        return None
    latest_file = max(list_of_files, key=os.path.getctime)
    return latest_file

def visualize_benchmark(csv_file: str):
    """
    Parses the benchmark dataset and generates comparative performance graphs.
    """
    os.makedirs(PNG_DIR, exist_ok=True)

    df = pd.read_csv(csv_file)
    sns.set_theme(style="whitegrid")

    fig, axes = plt.subplots(1, 3, figsize=(18, 6))
    
    file_basename = os.path.basename(csv_file)
    file_name_no_ext = os.path.splitext(file_basename)[0]
    
    fig.suptitle(f"Merge Sort Performance Benchmark Analysis\nSource: {file_basename}", fontsize=16)

    sns.lineplot(ax=axes[0], data=df, x="Threshold", y="Speedup", hue="Array_Size", marker="o", palette="viridis")
    axes[0].set_title("Computational Speedup vs. Threading Threshold")
    axes[0].set_xlabel("Threshold (Elements)")
    axes[0].set_ylabel("Speedup Factor (Ts / Tc)")
    axes[0].set_xscale("log")
    axes[0].axhline(1.0, color='red', linestyle='--', label='Baseline (Speedup = 1.0)')
    axes[0].legend(title="Array Size")

    sns.lineplot(ax=axes[1], data=df, x="Threshold", y="Improvement_Percent", hue="Array_Size", marker="s", palette="magma")
    axes[1].set_title("Relative Performance Improvement")
    axes[1].set_xlabel("Threshold (Elements)")
    axes[1].set_ylabel("Improvement (%)")
    axes[1].set_xscale("log")

    best_concurrent = df.loc[df.groupby("Array_Size")["Concurrent_Time_s"].idxmin()]
    
    comparison_df = pd.melt(
        best_concurrent, 
        id_vars=["Array_Size"], 
        value_vars=["Sequential_Time_s", "Concurrent_Time_s"],
        var_name="Execution_Type", 
        value_name="Time_Seconds"
    )
    
    comparison_df["Execution_Type"] = comparison_df["Execution_Type"].replace({
        "Sequential_Time_s": "Sequential",
        "Concurrent_Time_s": "Optimal Concurrent"
    })

    sns.barplot(ax=axes[2], data=comparison_df, x="Array_Size", y="Time_Seconds", hue="Execution_Type", palette="muted")
    axes[2].set_title("Absolute Execution Time")
    axes[2].set_xlabel("Array Size (Elements)")
    axes[2].set_ylabel("Execution Time (Seconds)")
    axes[2].set_yscale("log")

    plt.tight_layout()

    output_path = f"{PNG_DIR}/{file_name_no_ext}_graphs.png"
    plt.savefig(output_path, dpi=300)
    print(f"Graph saved to {output_path}")
    plt.show()

if __name__ == "__main__":
    latest_file = find_latest_benchmark_file(CSV_DIR)
    if latest_file:
        print(f"Visualizing data from: {latest_file}")
        visualize_benchmark(latest_file)
    else:
        print("Error: No CSV benchmark files found in the specified directory.")