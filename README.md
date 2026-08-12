# Food Delivery App - Recommendation System

## Overview
A high-performance TCP-based recommendation engine built in C++. The system manages user interaction history (product views and purchases) and provides real-time product recommendations based on user similarity algorithms.

## System Architecture
* **Core Language:** C++ (using STL)
* **Design Patterns:** Object-Oriented design implementing the **Command Pattern** for scalable and maintainable request handling.
* **Networking:** Custom synchronous TCP server built from scratch using POSIX sockets (`<sys/socket.h>`).
* **Storage:** File-based data persistence mapped to in-memory data structures for fast continuous execution.
* **Testing:** 
  * C++ Unit Tests (Testing core logic and models).
  * Python Automated Integration Tests (E2E TCP socket validation).
* **Deployment:** Fully containerized utilizing Docker Multi-stage builds and Docker Compose.

-----------------------------

## Build & Run Instructions

### 1. Run the TCP Recommendation Server:
Builds the optimized C++ server and exposes it on port 5000.

docker build -t recommendation-server .
docker run -it --rm -p 5000:5000 recommendation-server ./recommend_app 5000

### 2. Run Internal C++ Unit Tests:
Runs the application logic tests in an isolated Docker build environment (stopping before the final slim stage).

docker build --target builder -t recommendation-tester .
docker run -it --rm recommendation-tester ./build/run_tests

### 3. Run End-to-End Integration Tests:
Spins up both the C++ TCP Server and a Python test client on a shared Docker network. The client sends a series of network commands to validate protocol adherence and algorithmic correctness.

docker-compose up --build
docker-compose down