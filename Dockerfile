
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    g++ \
    cmake \
    make \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN mkdir build && cd build && cmake .. && cmake --build .

CMD ["./build/recommend_app"]