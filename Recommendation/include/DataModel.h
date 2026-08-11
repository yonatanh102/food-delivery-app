#ifndef DATAMODEL_H
#define DATAMODEL_H

#include "IDataRepository.h"
#include <unordered_map>

/**
 * @class DataModel implementation of IDataRepository interface.
 * @brief Acts as the central in-memory database for the application.
 * Manages the relationships between users and products for both views and purchases.
 */
class DataModel : public IDataRepository{
    private:
        std::unordered_map<std::string, std::unordered_set<std::string>> viewProductsHistory;
        std::unordered_map<std::string, std::unordered_set<std::string>> purchaseProductsHistory;
        std::unordered_map<std::string, std::unordered_set<std::string>> viewUsersHistory;
        std::unordered_map<std::string, std::unordered_set<std::string>> purchaseUsersHistory;

    public:
        // --- View History Management ---
        void AddView(const std::string& userId, const std::string& productId) override;
        void RemoveView(const std::string& userId, const std::string& productId) override;

        // --- Purchase History Management ---
        void AddPurchase(const std::string& userId, const std::string& productId) override;
        void RemovePurchase(const std::string& userId, const std::string& productId) override;

        // --- Getters ---
        // Note: Returning const references prevents expensive copies of the data in memory.
        const std::unordered_set<std::string>& getViewHistoryOfUser(const std::string& userId) override;
        const std::unordered_set<std::string>& getPurchaseHistoryOfUser(const std::string& userId) override;
        const std::unordered_set<std::string>& getViewHistoryOfProduct(const std::string& productId) override;
        const std::unordered_set<std::string>& getPurchaseHistoryOfProduct(const std::string& productId) override;

        /**
        * @brief Saves the current state of the database to a text file.
        * @param filename The path and name of the file to save to.
        */
        void saveToFile(const std::string& filename) const override;

        /**
        * @brief Loads the database state from a text file.
        * @param filename The path and name of the file to load from.
        */
        void loadFromFile(const std::string& filename) override;
};

#endif