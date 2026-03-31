#ifndef SEQUENTIAL_MERGESORT_H
#define SEQUENTIAL_MERGESORT_H

#include <vector>

template<typename T>
class SequentialMergeSorter {
public:
    static void sort(std::vector<T> &nums);

private:
    static void merge(std::vector<T> &nums, int left, int right);
    static void mergesort(std::vector<T> &nums, int left, int right);
};

#include "mergesort.tpp"

#endif