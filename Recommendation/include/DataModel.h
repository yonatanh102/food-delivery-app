#ifndef DATAMODEL_H
#define DATAMODEL_H

#include <unordered_map>
#include <string>
#include <unordered_set>

using namespace std;

class DataModel{
    private:
        unordered_map<string, unordered_set<string>> viewProductsHistory;
        unordered_map<string, unordered_set<string>> purchaseProductsHistory;
        unordered_map<string, unordered_set<string>> viewUsersHistory;
        unordered_map<string, unordered_set<string>> purchaseUsersHistory;

    public:
        void AddView(const string& userId, const string& productId);
        void RemoveView(const string& userId, const string& productId);
        void AddPurchase(const string& userId, const string& productId);
        void RemovePurchase(const string& userId, const string& productId);
        const unordered_set<string>& getViewHistoryOfUser(const string& userId);
        const unordered_set<string>& getPurchaseHistoryOfUser(const string& userId);
        const unordered_set<string>& getViewHistoryOfProduct(const string& productId);
        const unordered_set<string>& getPurchaseHistoryOfProduct(const string& productId);
};



#endif