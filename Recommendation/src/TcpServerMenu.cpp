#include "TcpServerMenu.h"
#include <sys/socket.h>
#include <unistd.h>
#include <algorithm>

TcpServerMenu::TcpServerMenu(int sock) : client_sock(sock) {}

std::string TcpServerMenu::nextCommand() {
    string line = "";
    char c;
    while (true) {
        ssize_t bytes_read = recv(client_sock, &c, 1, 0);
        if (bytes_read <= 0) {
            // Client disconnected or error occurred
            return "";
        }
        if (c == '\n') {
            break; // End of command
        }
        if (c != '\r') {
        line += c; // Append character to the command line
        }
    }
    return line;
}

void TcpServerMenu::response(std::string msg) {
    // Ensure the message ends with a newline for proper client display
    if (!msg.empty() && msg.back() != '\n') {
        msg += '\n';
    }

    ssize_t total_sent = 0;
    ssize_t msg_len = msg.size();

    while (total_sent < msg_len) {
        ssize_t bytes_sent = send(client_sock, msg.c_str() + total_sent, msg_len - total_sent, 0);
        if (bytes_sent <= 0) {
            // Handle error or disconnection
            break;
        }
        total_sent += bytes_sent;
    }
}