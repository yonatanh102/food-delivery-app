#ifndef TCPSERVER_H
#define TCPSERVER_H

class TcpServer {
    
    private:
        int server_sock;
        int port;

    public:
        /**
        * @brief Constructor that takes the port to listen on.
        * Note: The port is passed as an argument to the main function.
        */
        TcpServer(int port);

        /**
        * @brief Destructor to clean up resources.
        */
        ~TcpServer();

        /**
        * @brief Initializes the socket, binds it to the port, and starts listening.
        * Should throw an exception or handle errors if binding fails.
        */
        void initialize();

        /**
        * @brief Blocks and waits for a client to connect.
        * @return The file descriptor (socket) of the connected client.
        */
        int acceptClient();
};

#endif