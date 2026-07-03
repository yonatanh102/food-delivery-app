#ifndef DATAMODEL_H
#define DATAMODEL_H

#include <unordered_map>
#include <string>
#include <unordered_set>

/**
 * @class DataModel
 * @brief Acts as the central in-memory database for the application.
 * Manages the relationships between users and products for both views and purchases.
 */
class DataModel{
    private:
        std::unordered_map<std::string, std::unordered_set<std::string>> viewProductsHistory;
        std::unordered_map<std::string, std::unordered_set<std::string>> purchaseProductsHistory;
        std::unordered_map<std::string, std::unordered_set<std::string>> viewUsersHistory;
        std::unordered_map<std::string, std::unordered_set<std::string>> purchaseUsersHistory;

    public:
        // --- View History Management ---
        void AddView(const std::string& userId, const std::string& productId);
        void RemoveView(const std::string& userId, const std::string& productId);

        // --- Purchase History Management ---
        void AddPurchase(const std::string& userId, const std::string& productId);
        void RemovePurchase(const std::string& userId, const std::string& productId);

        // --- Getters ---
        // Note: Returning const references prevents expensive copies of the data in memory.
        const std::unordered_set<std::string>& getViewHistoryOfUser(const std::string& userId);
        const std::unordered_set<std::string>& getPurchaseHistoryOfUser(const std::string& userId);
        const std::unordered_set<std::string>& getViewHistoryOfProduct(const std::string& productId);
        const std::unordered_set<std::string>& getPurchaseHistoryOfProduct(const std::string& productId);
};

#endif