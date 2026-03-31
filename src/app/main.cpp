#include <iostream>
#include <chrono>
#include <vector>
#include <fstream>
#include "parallel/mergesort.hpp"
#include "sequential/mergesort.hpp"

int main(int argc, char* argv[]) {
    const int SIZE = 1000000;
    std::vector<int> original_nums(SIZE);
    

    for(int i = 0; i < SIZE; i++){
        original_nums[i] = rand() % 10000;
    }


    std::vector<int> seq_nums = original_nums; 
    auto start_seq = std::chrono::high_resolution_clock::now();
    SequentialMergeSorter<int>::sort(seq_nums);
    auto end_seq = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> seqDuration = end_seq - start_seq;
    
    std::ofstream seq_file("sequential_benchmark.txt");
    if (seq_file.is_open()) {
        seq_file << "Elements sorted: " << SIZE << "\n";
        seq_file << "Sequential time: " << seqDuration.count() << " seconds\n";
        seq_file.close();
    }


    std::vector<int> conc_nums = original_nums; 
    auto start_conc = std::chrono::high_resolution_clock::now();
    ConcurrentMergeSorter<int>::sort(conc_nums);
    auto end_conc = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> concDuration = end_conc - start_conc;

    std::ofstream conc_file("concurrent_benchmark.txt");
    if (conc_file.is_open()) {
        conc_file << "Elements sorted: " << SIZE << "\n";
        conc_file << "Concurrent time: " << concDuration.count() << " seconds\n";
        conc_file.close();
    }

    std::cout << "Benchmarking complete. Results saved to local files." << std::endl;
    
    return 0;
}