#ifndef REMOVEPURCHASECOMMAND_H
#define REMOVEPURCHASECOMMAND_H

#include "ICommand.h"
#include "IDataRepository.h"

/**
 * @class RemovePurchaseCommand
 * @brief Command to remove products from a user's purchase history.
 */
class RemovePurchaseCommand: public ICommand{
    private:
        IDataRepository* m_model;
    public:
        RemovePurchaseCommand(IDataRepository* model) : m_model(model) {}
        string execute(const vector<string>& args);
};

#endif