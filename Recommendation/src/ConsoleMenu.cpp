#include "ConsoleMenu.h"
#include <iostream> 

string ConsoleMenu::nextCommand() {
    string line;
    if(!getline(cin, line)) {
        return("");
    }
    return(line);
}

void ConsoleMenu::response(string msg) {
    cout << msg;
}