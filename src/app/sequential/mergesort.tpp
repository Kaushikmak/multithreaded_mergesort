#include "mergesort.hpp"

template<typename T>
void SequentialMergeSorter<T>::sort(std::vector<T> &nums) {
    if(nums.empty() || nums.size() == 1) return;
    mergesort(nums, 0, nums.size() - 1);
}

template<typename T>
void SequentialMergeSorter<T>::merge(std::vector<T> &nums, int left, int right) {
    int mid = left + (right - left) / 2;
    std::vector<T> first(nums.begin() + left, nums.begin() + mid + 1);
    std::vector<T> second(nums.begin() + mid + 1, nums.begin() + right + 1);
    int i = 0, j = 0, k = left;
    while(i < first.size() && j < second.size()){
        if(first[i] <= second[j]){
            nums[k++] = first[i++];
        } else {
            nums[k++] = second[j++];
        }
    }
    while(i < first.size()) nums[k++] = first[i++];
    while(j < second.size()) nums[k++] = second[j++];
}

template<typename T>
void SequentialMergeSorter<T>::mergesort(std::vector<T> &nums, int left, int right) {
    if(right <= left) return;
    int mid = left + (right - left) / 2;
    mergesort(nums, left, mid);
    mergesort(nums, mid + 1, right);
    merge(nums, left, right);
}