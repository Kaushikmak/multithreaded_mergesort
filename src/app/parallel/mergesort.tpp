#include "mergesort.hpp"

thread_local double local_merge_time = 0.0;

template<typename T>
void ConcurrentMergeSorter<T>::sort(std::vector<T> &nums) {
    if(nums.empty() || nums.size() == 1) return;
    mergesort(nums, 0, nums.size() - 1);
}

template<typename T>
void ConcurrentMergeSorter<T>::merge(std::vector<T> &nums, int left, int right) {
    int mid = left + (right - left) / 2;
    std::vector<T> first(nums.begin() + left, nums.begin() + mid + 1);
    std::vector<T> second(nums.begin() + mid + 1, nums.begin() + right + 1);
    size_t i = 0, j = 0;
    int k = left;
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
void ConcurrentMergeSorter<T>::mergesort(std::vector<T> &nums, int left, int right) {
    auto start = std::chrono::high_resolution_clock::now();
    if(right <= left) return;
    int mid = left + (right - left) / 2;
    
    if ((right - left) > THRESHOLD) {
        std::thread t1, t2;
        bool t1_started = false, t2_started = false;
        try {
            t1 = std::thread(ConcurrentMergeSorter<T>::mergesort, std::ref(nums), left, mid);
            t1_started = true;
            t2 = std::thread(ConcurrentMergeSorter<T>::mergesort, std::ref(nums), mid + 1, right);
            t2_started = true;
        } catch (const std::system_error& e) {
        }

        if (t1_started) {
            t1.join();
        } else {
            mergesort(nums, left, mid); 
        }
    
        if (t2_started) {
            t2.join();
        } else {
            mergesort(nums, mid + 1, right); 
        }
    } else {
        mergesort(nums, left, mid);
        mergesort(nums, mid + 1, right);
    }

    merge(nums, left, right);
    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> duration = end - start;
    local_merge_time += duration.count();
}