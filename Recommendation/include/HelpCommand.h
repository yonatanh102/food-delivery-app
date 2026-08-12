#ifndef HELPCOMMAND_H
#define HELPCOMMAND_H
#include "ICommand.h"

using namespace std;

class HelpCommand : public ICommand{
    public:
        string execute(const vector<string>& args) override;
};

#endif