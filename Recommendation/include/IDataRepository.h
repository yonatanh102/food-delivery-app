#ifndef IDATAREPOSITORY_H
#define IDATAREPOSITORY_H

#include <string>
#include <unordered_set>

/**
 * @class IDataRepository
 */
class IDataRepository{
    public:

        virtual ~IDataRepository() = default;

        // --- View History Management ---
        virtual void AddView(const std::string& userId, const std::string& productId) = 0;
        virtual void RemoveView(const std::string& userId, const std::string& productId) = 0;

        // --- Purchase History Management ---
        virtual void AddPurchase(const std::string& userId, const std::string& productId) = 0;
        virtual void RemovePurchase(const std::string& userId, const std::string& productId) = 0;

        // --- Getters ---
        virtual const std::unordered_set<std::string>& getViewHistoryOfUser(const std::string& userId) = 0;
        virtual const std::unordered_set<std::string>& getPurchaseHistoryOfUser(const std::string& userId) = 0;
        virtual const std::unordered_set<std::string>& getViewHistoryOfProduct(const std::string& productId) = 0;
        virtual const std::unordered_set<std::string>& getPurchaseHistoryOfProduct(const std::string& productId) = 0;

        /**
        * @brief Saves the current state of the database to a text file.
        * @param filename The path and name of the file to save to.
        */
        virtual void saveToFile(const std::string& filename) const = 0;

        /**
        * @brief Loads the database state from a text file.
        * @param filename The path and name of the file to load from.
        */
        virtual void loadFromFile(const std::string& filename) = 0;


};

#endif