#include "TcpServer.h"
#include <iostream>
#include <sys/socket.h>
#include <cstdio>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <cstring>

using namespace std;

TcpServer::TcpServer(int port) : port(port), server_sock(-1) {}

TcpServer::~TcpServer() {
    if (server_sock >= 0) {
        close(server_sock);
    }
}

void TcpServer::initialize() {
    // Create a TCP socket
    server_sock = socket(AF_INET, SOCK_STREAM, 0);
    if (server_sock < 0) {
        throw runtime_error("Failed to create socket");
    }

    // Allow the socket to be reused immediately after the program exits
    int opt = 1;
    if (setsockopt(server_sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        throw runtime_error("Failed to set socket options");
    }

    // Bind the socket to the specified port
    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY; // Listen on all interfaces
    server_addr.sin_port = htons(port);

    if (bind(server_sock, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        throw runtime_error("Failed to bind socket to port " + to_string(port));
    }

    // Start listening for incoming connections
    if (listen(server_sock, SOMAXCONN) < 0) {
        throw runtime_error("Failed to listen on socket");
    }
}

int TcpServer::acceptClient() {
    struct sockaddr_in client_addr;
    socklen_t client_len = sizeof(client_addr);
    int client_sock = accept(server_sock, (struct sockaddr*)&client_addr, &client_len);
    if (client_sock < 0) {
        throw runtime_error("Failed to accept client connection");
    }
    return client_sock;
}