#include "RemoveViewCommand.h"

string RemoveViewCommand::execute(const vector<string>& args){
    // Validate input to prevent out-of-bounds crashes
    if (args.empty()) return("400 Bad Request: Missing user ID\n");
    if (args.size() < 2) return("400 Bad Request: Missing product IDs\n");

    // Remove each specified product from the user's history
    string user = args.front(); // First argument is the user ID
    const auto& usersList = m_model->getViewHistoryOfUser(user);
    if(usersList.empty()) {
        return("404 Not Found: User does not exist\n");
    }
    // checking if all products exist in users history
    for (size_t i = 1; i < args.size(); ++i){
        if(usersList.find(args[i]) == usersList.end()){
            return("404 Not Found: One or more products do not exist\n");
        }
    }
    // removing each product from the users history
    for (size_t i = 1; i < args.size(); ++i){
        m_model->RemoveView(user, args[i]);
    }
    return("204 No Content\n");
}