#include "RemovePurchaseCommand.h"

string RemovePurchaseCommand::execute(const vector<string>& args){
    // Validate input to prevent out-of-bounds crashes
    if (args.empty()) return("400 Bad Request: Missing user ID\n");
    if (args.size() < 2) return("400 Bad Request: Missing product IDs\n");

    // Remove each specified product from the user's history
    string user = args.front(); // First argument is the user ID
    for (size_t i = 1; i < args.size(); ++i){
        m_model->RemovePurchase(user, args[i]);
    }
    return("200 OK\n");
}