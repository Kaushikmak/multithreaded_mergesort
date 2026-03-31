#ifndef CONCURRENT_MERGESORT_H
#define CONCURRENT_MERGESORT_H

#include <vector>
#include <thread>

template<typename T>
class ConcurrentMergeSorter {
public:

    inline static int THRESHOLD = 10000;

    static void sort(std::vector<T> &nums);

private:
    static void merge(std::vector<T> &nums, int left, int right);
    static void mergesort(std::vector<T> &nums, int left, int right);
};

#include "mergesort.tpp"

#endif