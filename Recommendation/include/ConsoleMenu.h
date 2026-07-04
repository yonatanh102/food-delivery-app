#ifndef CONSOLEMENU_H
#define CONSOLEMENU_H

#include "IMenu.h"

// ConsoleMenu implementation of IMenu interface.
// This class handles reading input strings from the terminal.
class ConsoleMenu : public IMenu{
    public:
        /**
        * Reads a full line of text from the console.
        * @return: The full string entered by the user.
        */
        string nextCommand() override;

        /**
        * Prints a response message or data directly to the standard console output (stdout).
        * @param msg The message string to be displayed on the terminal screen.
        */
        void response(string msg) override; 
};

#endif