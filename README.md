# Full-Stack Food Delivery App & Recommendation Engine

## Overview
A microservices-based full-stack food delivery application. The system consists of a robust **Node.js/Express REST API** for handling core business logic, user management, and order processing, seamlessly integrated with a high-performance **TCP-based recommendation engine built in C++**. The recommendation system manages user interaction history and provides real-time product recommendations based on collaborative filtering algorithms.

## System Architecture & Tech Stack

### 1. Main Backend (REST API)
* **Core Stack:** Node.js, Express.js.
* **Database:** MongoDB with Mongoose ODM for structured data modeling and referential integrity.
* **Security:** JWT-based authentication with Role-Based Access Control (RBAC) separating `admin` and `client` privileges.
* **Features:** Full CRUD capabilities for Users, Restaurants, Products, and Orders with strict data validation.

### 2. Recommendation Engine (Microservice)
* **Core Language:** C++ (using STL).
* **Design Patterns:** Object-Oriented design implementing the **Command Pattern** for scalable and maintainable request handling.
* **Networking:** Custom synchronous TCP server built from scratch using POSIX sockets (`<sys/socket.h>`).
* **Storage:** File-based data persistence mapped to in-memory data structures for fast continuous execution.

### 3. DevOps & Testing
* **Testing Frameworks:** Jest & Supertest (Node.js), Unittest (Python), and native C++ assertions.
* **Deployment:** Fully containerized utilizing Docker Multi-stage builds and Docker Compose for seamless local orchestration.

---

## Recommendation Algorithm
The recommendation engine utilizes a memory-based **Collaborative Filtering** approach, focusing on item co-occurrence and user behavior similarity. 

When a `RECOMMEND` request is triggered for a specific user and a target item:
1. **Audience Matching:** The system scans the database to find all other users who have interacted with the requested target item.
2. **Item Extraction:** It aggregates all other items that these matched users have viewed or purchased.
3. **Filtering:** Items that the requesting user has already interacted with are filtered out to ensure only new, relevant suggestions are provided.
4. **Result:** The system returns the optimal recommended products based on this intersection of behaviors.

---

## Internal TCP Communication (C++ Server)
The C++ server processes text-based commands over TCP. Every command sent by the Node API client must end with a newline character (`\n`). All data modifications are strictly atomic (all-or-nothing).

| Command | Arguments | Description | Success Status |
|---|---|---|---|
| **`HELP`** | None | Returns a list of all available commands and their syntax. | `200 OK` |
| **`ADD_VIEW`** | `<user_id> <item_id> [item_id...]` | Records one or more viewed items for a specific user. | `201 Created` |
| **`ADD_PURCHASE`** | `<user_id> <item_id> [item_id...]` | Records one or more purchased items for a specific user. | `201 Created` |
| **`REMOVE_VIEW`** | `<user_id> <item_id> [item_id...]` | Atomically removes view records. Reverted if any item does not exist. | `204 No Content` |
| **`REMOVE_PURCHASE`** | `<user_id> <item_id> [item_id...]` | Atomically removes purchase records. Reverted if any item does not exist. | `204 No Content` |
| **`RECOMMEND`** | `<user_id> <item_id>` | Generates a list of recommended products based on the target item. | `200 OK` |

*(Note: Invalid commands, missing arguments, or failed atomic operations will return a `400 Bad Request` or `404 Not Found` status).*

---

## Automated Testing Suite
The project boasts a massive and comprehensive testing strategy ensuring total system reliability:

* **API Integration Tests (Node.js):** Over 140 automated tests using Jest and Supertest covering Authentication, Authorization spoofing blocks, CRUD operations, database validation, and mocked TCP integrations.
* **C++ Unit Tests:** Testing core logic and data models in an isolated environment.
* **E2E TCP Tests (Python):** Python Automated Integration Tests evaluating TCP socket validation and algorithmic correctness against the live C++ container.

---

## Build & Run Instructions

### 1. Run the Full Stack System (Recommended)
Spins up MongoDB, the Node.js API Server, and the C++ Recommendation Engine via Docker Compose.

docker-compose up -d

### 2. Run Node.js API Tests
With MongoDB running, execute the backend test suite sequentially using a dedicated test database:

cd web-server
npm install
npm run test

### 3. Run Standalone C++ Engine / Tests
* Run the TCP Recommendation Server standalone: Builds the optimized C++ server and exposes it on port 5000.

docker build -t recommendation-server .
docker run -it --rm -p 5000:5000 recommendation-server ./recommend_app 5000

* Run Internal C++ Unit Tests: Runs the application logic tests in an isolated Docker build environment (stopping before the final slim stage).

docker build --target builder -t recommendation-tester .
docker run -it --rm recommendation-tester ./build/run_tests

* Run Python E2E Integration Tests: Spins up both the C++ TCP Server and a Python test client on a shared Docker network. The client sends a series of network commands to validate protocol adherence and algorithmic correctness.

docker-compose up --build python-tests