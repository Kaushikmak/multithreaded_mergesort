#include <iostream>
#include <chrono>
#include <vector>
#include <fstream>
#include <iomanip>
#include <filesystem>
#include <random>
#include <sstream>

#include "../src/app/parallel/mergesort.hpp"
#include "../src/app/sequential/mergesort.hpp"

namespace fs = std::filesystem;

int main() {
    // std::vector<int> sizes = {100000, 500000, 1000000, 5000000};
    // std::vector<int> thresholds = {1000, 5000, 10000, 50000, 100000};

    std::vector<int> sizes = {0, 1, 2,1000, 10000,65536, 1048576,100000, 500000, 1000000,10000000, 50000000 };

    std::vector<int> thresholds = {10, 100,1024, 8192, 16384,50000, 100000, 500000,5000000, 10000000};
    

    std::string results_dir = "benchmarking/results/csv";
    if (!fs::exists(results_dir)) {
        fs::create_directories(results_dir);
    }

    auto now = std::chrono::system_clock::now();
    std::time_t now_time = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&now_time), "%Y%m%d_%H%M%S");

    std::string filepath = results_dir + "/bench_" + ss.str() + ".csv";

    std::ofstream report_file(filepath);
    if (!report_file.is_open()) {
        std::cerr << "Error: Unable to open file for writing at " << filepath << std::endl;
        return 1;
    }

    report_file << std::fixed << std::setprecision(6);
    report_file << "Array_Size,Sequential_Time_s,Threshold,Concurrent_Time_s,Speedup,Improvement_Percent\n";

    std::mt19937 rng(42);
    std::uniform_int_distribution<int> dist(1, 100000);

    for (int SIZE : sizes) {
        std::cout << "Generating dataset of " << SIZE << " elements..." << std::endl;
        std::vector<int> original_nums(SIZE);
        for(int i = 0; i < SIZE; i++){
            original_nums[i] = dist(rng);
        }

        std::cout << "Running Sequential Sort for size " << SIZE << "..." << std::endl;
        std::vector<int> seq_nums = original_nums; 
        auto start_seq = std::chrono::high_resolution_clock::now();
        SequentialMergeSorter<int>::sort(seq_nums);
        auto end_seq = std::chrono::high_resolution_clock::now();
        std::chrono::duration<double> seqDuration = end_seq - start_seq;
        double t_seq = seqDuration.count();

        for (int thresh : thresholds) {
            if ((SIZE / thresh) > 10000) {
                std::cout << "Skipping Concurrent Sort (Threshold: " << thresh 
                          << ") for size " << SIZE << " -> Exceeds safe thread limit." << std::endl;
                continue; 
            }
            ConcurrentMergeSorter<int>::THRESHOLD = thresh;

            std::cout << "Running Concurrent Sort (Threshold: " << thresh << ")..." << std::endl;
            std::vector<int> conc_nums = original_nums; 
            auto start_conc = std::chrono::high_resolution_clock::now();
            ConcurrentMergeSorter<int>::sort(conc_nums);
            auto end_conc = std::chrono::high_resolution_clock::now();
            std::chrono::duration<double> concDuration = end_conc - start_conc;
            double t_conc = concDuration.count();

            double absolute_delta = t_seq - t_conc;
            double speedup = t_seq / t_conc;
            double percentage_improvement = (absolute_delta / t_seq) * 100.0;

            report_file << SIZE << ","
                        << t_seq << ","
                        << thresh << ","
                        << t_conc << ","
                        << speedup << ","
                        << percentage_improvement << "\n";
        }
    }

    report_file.close();
    std::cout << "Benchmarking complete. Results saved to " << filepath << std::endl;

    return 0;
}