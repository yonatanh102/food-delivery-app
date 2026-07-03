#ifndef IMENU_H
#define IMENU_H

#include <string>

using namespace std;

// Interface for the Menu system.
// Defines how the App gets input.

class IMenu{
    public:
        virtual ~IMenu() = default;

        // Returns the full line of input from the user.
        virtual string nextCommand() = 0;

        /**
        * Sends a response message back to the user or client.
        * @param msg The status string or payload data to be sent.
        */
        virtual void response(string msg) = 0; 
};

#endif