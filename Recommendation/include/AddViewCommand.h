#ifndef ADDVIEWCOMMAND_H
#define ADDVIEWCOMMAND_H

#include "ICommand.h"
#include "DataModel.h"

/**
 * @class AddViewCommand
 * @brief Command to add products to a user's view history.
 * Implements the ICommand interface.
 */
class AddViewCommand : public ICommand{
    private:
        DataModel* m_model; // Dependency Injection: Pointer to the central database
    public:
        /**
        * @brief Constructor injects the DataModel dependency.
        * @param model Pointer to the active DataModel instance.
        */
        AddViewCommand(DataModel* model) : m_model(model) {}

        /**
        * @brief Executes the command.
        * @param args A vector where args[0] is the userId, and the rest are productIds.
        * @return Status string (e.g., "200 OK").
        */
        string execute(const vector<string>& args) override;
};


#endif