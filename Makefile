CXX = g++
CXXFLAGS = -std=c++17 -O3 -pthread -Wall -Wextra

PYTHON = python3

BUILD_DIR = build
BENCH_DIR = benchmarking
SRC_DIR = src/app

BENCH_TARGET = $(BUILD_DIR)/run_benchmark
MAIN_TARGET = $(BUILD_DIR)/run_main

BENCH_SRC = $(BENCH_DIR)/benchmarking.cpp
MAIN_SRC = $(SRC_DIR)/main.cpp
PLOT_SCRIPT = $(BENCH_DIR)/plot_bench.py

all: $(BUILD_DIR) $(BENCH_TARGET) $(MAIN_TARGET)

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(BENCH_TARGET): $(BENCH_SRC) | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -o $(BENCH_TARGET) $(BENCH_SRC)

$(MAIN_TARGET): $(MAIN_SRC) | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -o $(MAIN_TARGET) $(MAIN_SRC)

run-bench: $(BENCH_TARGET)
	./$(BENCH_TARGET)

plot:
	$(PYTHON) $(PLOT_SCRIPT)

analyze: run-bench plot

clean:
	rm -rf $(BUILD_DIR)

.PHONY: all clean run-bench plot analyze