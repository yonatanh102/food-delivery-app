#ifndef REMOVEPURCHASECOMMAND_H
#define REMOVEPURCHASECOMMAND_H

#include "ICommand.h"
#include "DataModel.h"

/**
 * @class RemovePurchaseCommand
 * @brief Command to remove products from a user's purchase history.
 */
class RemovePurchaseCommand: public ICommand{
    private:
        DataModel* m_model;
    public:
        RemovePurchaseCommand(DataModel* model) : m_model(model) {}
        string execute(const vector<string>& args);
};

#endif