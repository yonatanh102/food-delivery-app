#ifndef TCPSERVERMENU_H
#define TCPSERVERMENU_H

#include "IMenu.h"
#include <string>

/**
 * @class TcpServerMenu
 * @brief Implementation of the IMenu interface for TCP network communication.
 * This class handles reading input commands from a connected TCP client
 * and sending string responses back over the socket using low-level POSIX calls.
 */
class TcpServerMenu : public IMenu {
    private:
        int client_sock;
    public:
        /**
         * @brief Constructs a TcpServerMenu with an active client connection.
         * @param sock The file descriptor of the accepted client socket.
         */
        TcpServerMenu(int sock);

        /**
         * @brief Reads the next command from the TCP client.
         * Reads from the socket buffer until a newline character ('\n') is encountered.
         * @return The full command string sent by the client.
         */
        string nextCommand() override;

        /**
         * @brief Sends a response message back to the TCP client.
         * @param msg The message string to be sent over the socket.
         */
        void response(string msg) override; 
};

#endif