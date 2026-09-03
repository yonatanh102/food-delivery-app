# Full-Stack Food Delivery App & Recommendation Engine

## Overview
A complete, microservices-based full-stack food delivery application. The system consists of a dynamic **React Frontend**, a robust **Node.js/Express REST API** for core business logic, and a high-performance **TCP-based recommendation engine built in C++**. The recommendation system manages user interaction history and provides real-time product recommendations based on collaborative filtering algorithms.

## System Architecture & Tech Stack

### 1. Frontend (Client)
* **Core Stack:** React, Context API (Auth & Cart state management).
* **UI/UX:** Responsive design with Dark/Light mode toggle and interactive cart badges.
* **Features:** Real-time Geolocation distance calculation (Haversine formula) to sort restaurants by proximity, and seamless integration with the recommendation engine during the checkout process.

### 2. Main Backend (REST API)
* **Core Stack:** Node.js, Express.js
* **Database:** MongoDB with Mongoose ODM. Features an **Auto-Seeding** mechanism that intelligently populates the database with realistic restaurants, products, and a default admin user on the first run.
* **Security:** JWT-based authentication with Role-Based Access Control (RBAC) separating `admin` and `client` privileges.

### 3. Recommendation Engine (Microservice)
* **Core Language:** C++ (using STL)
* **Design Patterns:** Object-Oriented design implementing the **Command Pattern** for scalable and maintainable request handling
* **Networking:** Custom synchronous TCP server built from scratch using POSIX sockets (`<sys/socket.h>`).

### 4. DevOps & Testing
* **Deployment:** Fully containerized utilizing Docker Multi-stage builds (Nginx for the frontend) and Docker Compose for seamless local orchestration.
* **Testing Frameworks:** Jest & Supertest (Node.js), Unittest (Python), and native C++ assertions.

---

## Internal TCP Communication (C++ Server)
The C++ server processes text-based commands over TCP[cite: 28]. Every command sent by the Node API client must end with a newline character (`\n`). All data modifications are strictly atomic (all-or-nothing).

| Command | Arguments | Description | Success Status |
|---|---|---|---|
| **`HELP`** | None | Returns a list of all available commands and their syntax. | `200 OK` |
| **`ADD_VIEW`** | `<user_id> <item_id> [item_id...]` | Records one or more viewed items for a specific user. | `201 Created` |
| **`ADD_PURCHASE`** | `<user_id> <item_id> [item_id...]` | Records one or more purchased items for a specific user. | `201 Created` |
| **`REMOVE_VIEW`** | `<user_id> <item_id> [item_id...]` | Atomically removes view records. | `204 No Content` |
| **`REMOVE_PURCHASE`** | `<user_id> <item_id> [item_id...]` | Atomically removes purchase records. | `204 No Content` |
| **`RECOMMEND`** | `<user_id> <item_id>` | Generates a list of recommended products based on the target item. | `200 OK` |

---

## Automated Testing Suite
The project boasts a massive and comprehensive testing strategy ensuring total system reliability:

* **API Integration Tests (Node.js):** 158 automated tests using Jest and Supertest covering Authentication, Authorization spoofing blocks, CRUD operations, database validation, and robust fault-tolerance testing (handling TCP connection drops gracefully).
* **C++ Unit Tests:** Testing core logic and data models in an isolated environment.
* **E2E TCP Tests (Python):** Automated tests evaluating TCP socket validation and algorithmic correctness against the live C++ container.

---

## Build & Run Instructions

### 1. Run the Full Stack System (Recommended)
Spins up MongoDB, the Node.js API Server, the C++ Recommendation Engine, and the React Frontend (via Nginx) using Docker Compose.

docker compose up --build -d

### 2. Run Node.js API Tests
With MongoDB running, execute the backend test suite sequentially using a dedicated test database

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

### 4. Run Frontend Locally (Development Mode)
Since Docker serves a production build of the frontend, making UI changes with Hot-Reloading requires running the React development server locally outside of Docker:

cd client
npm install
npm run dev