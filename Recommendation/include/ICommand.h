#ifndef ICOMMAND_H
#define ICOMMAND_H

#include <string>
#include <vector>

using namespace std;
// Interface for the Command pattern.
// Every specific action will inherit from this.

class ICommand{
    public:
    virtual ~ICommand() = default;
    virtual string execute(const vector<string>& args) = 0;
};

#endif