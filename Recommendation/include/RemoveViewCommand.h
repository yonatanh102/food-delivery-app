#ifndef REMOVEVIEWCOMMAND_H
#define REMOVEVIEWCOMMAND_H

#include "ICommand.h"
#include "IDataRepository.h"

/**
 * @class RemoveViewCommand
 * @brief Command to remove products from a user's view history.
 */
class RemoveViewCommand: public ICommand{
    private:
        IDataRepository* m_model;
    public:
        RemoveViewCommand(IDataRepository* model) : m_model(model) {}
        string execute(const vector<string>& args);
};

#endif