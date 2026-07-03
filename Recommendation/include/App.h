#ifndef APP_H
#define APP_H

#include "ICommand.h"
#include "IMenu.h"
#include <map>
#include <string>

using namespace std;

// The App class connects the user input (IMenu) to the specific actions (ICommand).
class App{
    private: 
        IMenu* menu;
        map<string, ICommand*> commands;
    public:
        App(IMenu* menu, map<string, ICommand*> commands) : menu(menu), commands(commands) {}
        void run();
};

#endif