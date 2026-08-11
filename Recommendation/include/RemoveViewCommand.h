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
        /**
        * @brief Constructor injects the DataModel dependency.
        * @param model Pointer to the active DataModel instance.
        */
        RemoveViewCommand(IDataRepository* model) : m_model(model) {}

        /**
        * @brief Executes the command.
        * @param args A vector where args[0] is the userId, and the rest are productIds.
        * @return Status string (e.g., "204 No Content").
        */
        string execute(const vector<string>& args);
};

#endif