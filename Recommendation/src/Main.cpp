#include "App.h"
#include "DataModel.h"
#include "HelpCommand.h"
#include "AddPurchaseCommand.h"
#include "AddViewCommand.h"
#include "RemovePurchaseCommand.h"
#include "RemoveViewCommand.h"
#include "RecommendCommand.h"
#include "ConsoleMenu.h"

#include <map>
#include <string>
#include <iostream>

using namespace std;

/**
 * @brief The entry point of the recommendation system application.
 * Acts as the Composition Root where all dependencies are wired together.
 */
int main(int argc, char* argv[]){
    // 1. Initialize core system components on the stack (automatic memory management)
    DataModel model;
    ConsoleMenu menu;
    model.loadFromFile("data/data.txt");

    // 2. Command Registration (Command Pattern implementation)
    map<string, ICommand*> commands;

    commands["HELP"] = new HelpCommand();
    commands["RECOMMEND"] = new RecommendCommand(&model);
    commands["ADD_VIEW"] = new AddViewCommand(&model);
    commands["ADD_PURCHASE"] = new AddPurchaseCommand(&model);
    commands["REMOVE_VIEW"] = new RemoveViewCommand(&model);
    commands["REMOVE_PURCHASE"] = new RemovePurchaseCommand(&model);

    // 3. Assemble and launch the application
    App myApp(&menu, commands);

    cout << "System initialized successfully." << endl;
    cout << "Type 'help' for available commands or 'quit' to exit." << endl;
    cout << "> ";

    myApp.run();

    // 4. saving all data to the data file
    model.saveToFile("data/data.txt");

    // 5. Graceful Shutdown & Memory Cleanup
    for (auto& pair : commands) {
        delete pair.second;
    }

    cout << "System shut down gracefully." << endl;
    return 0;
}