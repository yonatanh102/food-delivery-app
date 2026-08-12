#include "App.h"
#include "DataModel.h"
#include "HelpCommand.h"
#include "AddPurchaseCommand.h"
#include "AddViewCommand.h"
#include "RemovePurchaseCommand.h"
#include "RemoveViewCommand.h"
#include "RecommendCommand.h"
#include "TcpServerMenu.h"
#include "TcpServer.h"
#include <unistd.h>

#include <map>
#include <string>
#include <iostream>

using namespace std;

/**
 * @brief The entry point of the recommendation system application.
 * Acts as the Composition Root where all dependencies are wired together.
 */
int main(int argc, char* argv[]){
    // 1. Validate arguments - the port must be passed as an argument
    if (argc < 2) {
        cerr << "Usage: " << argv[0] << " <port>" << endl;
        return 1;
    }

    // 2. Initialize core system components on the stack (automatic memory management)
    DataModel model;
    model.loadFromFile("data/data.txt");
    int port = stoi(argv[1]); // Get port number from command line arguments
    TcpServer server(port);

    // 3. Command Registration (Command Pattern implementation)
    // Commands are allocated on the Heap and must be explicitly deleted before exit
    map<string, ICommand*> commands;

    commands["HELP"] = new HelpCommand();
    commands["RECOMMEND"] = new RecommendCommand(&model);
    commands["ADD_VIEW"] = new AddViewCommand(&model);
    commands["ADD_PURCHASE"] = new AddPurchaseCommand(&model);
    commands["REMOVE_VIEW"] = new RemoveViewCommand(&model);
    commands["REMOVE_PURCHASE"] = new RemovePurchaseCommand(&model);

    // 4. Assemble and launch the server
    try {
        server.initialize();
        cout << "Server listening on port " << port << endl;

        while(true) {
            int client_sock = server.acceptClient();
            cout << "Client connected." << endl;
            TcpServerMenu tcpMenu(client_sock);
            App myApp(&tcpMenu, commands);
            myApp.run();
            
            model.saveToFile("data/data.txt"); // saving all data to the data file

            cout << "Client disconnected." << endl;
            close(client_sock);
        }
    } catch (const std::exception& e) {
        cerr << "Error initializing server: " << e.what() << endl;
        return 1;
    }

    // 5. Graceful Shutdown & Memory Cleanup
    // This will run if the while loop is broken or an exception is caught
    for (auto& pair : commands) {
        delete pair.second;
    }

    cout << "System shut down gracefully." << endl;
    return 0;
}