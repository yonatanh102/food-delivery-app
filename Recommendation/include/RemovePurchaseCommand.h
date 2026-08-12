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
        /**
        * @brief Constructor injects the DataModel dependency.
        * @param model Pointer to the active DataModel instance.
        */
        RemovePurchaseCommand(IDataRepository* model) : m_model(model) {}

        /**
        * @brief Executes the command.
        * @param args A vector where args[0] is the userId, and the rest are productIds.
        * @return Status string (e.g., "204 No Content").
        */
        string execute(const vector<string>& args);
};

#endif