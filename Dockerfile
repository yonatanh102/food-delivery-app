
# Stage 1: Build (The "Heavy" Environment)
FROM ubuntu:22.04 AS builder

# Install build tools
RUN apt-get update && apt-get install -y     g++     cmake     make     git     && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the entire project source code
COPY . .

# Build the project
RUN mkdir build && cd build && cmake .. && cmake --build .

# Stage 2: Runtime (The "Lightweight" Environment)
FROM ubuntu:22.04

WORKDIR /app

# Copy ONLY the compiled binary from the builder stage
COPY --from=builder /app/build/recommend_app .

# IMPORTANT: Copy the data directory so the app can load/save data files
COPY --from=builder /app/data ./data

# Set the command to run the executable directly
CMD ["./recommend_app"]