#include "DataModel.h"

#include <fstream>
#include <sstream>

using namespace std;

void DataModel::AddView(const string& userId, const string& productId){
    viewProductsHistory[userId].insert(productId);
    viewUsersHistory[productId].insert(userId);
}

void DataModel::RemoveView(const string& userId, const string& productId){
    viewProductsHistory[userId].erase(productId);
    viewUsersHistory[productId].erase(userId);
}

void DataModel::AddPurchase(const string& userId, const string& productId){
    purchaseProductsHistory[userId].insert(productId);
    purchaseUsersHistory[productId].insert(userId);
}

void DataModel::RemovePurchase(const string& userId, const string& productId){
    purchaseProductsHistory[userId].erase(productId);
    purchaseUsersHistory[productId].erase(userId);
}

const unordered_set<string>& DataModel::getViewHistoryOfUser(const string& userId){
    // Null Object Pattern: returning a static empty set if user is not found.
    static const unordered_set<string> emptySet;
    auto it = viewProductsHistory.find(userId);
    if(it != viewProductsHistory.end()){
        return it->second;
    }
    return emptySet;
}

const unordered_set<string>& DataModel::getViewHistoryOfProduct(const string& productId){
    // Null Object Pattern: returning a static empty set if user is not found.
    static const unordered_set<string> emptySet;
    auto it = viewUsersHistory.find(productId);
    if(it != viewUsersHistory.end()){
        return it->second;
    }
    return emptySet;
}

const unordered_set<string>& DataModel::getPurchaseHistoryOfUser(const string& userId){
    // Null Object Pattern: returning a static empty set if user is not found.
    static const unordered_set<string> emptySet;
    auto it = purchaseProductsHistory.find(userId);
    if(it != purchaseProductsHistory.end()){
        return it->second;
    }
    return emptySet;
}

const unordered_set<string>& DataModel::getPurchaseHistoryOfProduct(const string& productId){
    // Null Object Pattern: returning a static empty set if user is not found.
    static const unordered_set<string> emptySet;
    auto it = purchaseUsersHistory.find(productId);
    if(it != purchaseUsersHistory.end()){
        return it->second;
    }
    return emptySet;
}

void DataModel::saveToFile(const string& filename) const{
    ofstream file(filename);
    if (!file.is_open()) {
        return;
    }

    file << "[VIEWS]\n";
    for (const auto& pair : viewProductsHistory){
        if (pair.second.empty()) continue;
        
        file << pair.first; // user's id
        for (const string& product : pair.second){
            file << " " << product;
        }
        file << "\n";
    }

    file << "[PURCHASES]\n";
    for (const auto& pair : purchaseProductsHistory){
        if (pair.second.empty()) continue;

        file << pair.first; // user's id
        for (const string& product : pair.second){
            file << " " << product;
        }
        file << "\n";
    }

    file.close();
}

void DataModel::loadFromFile(const std::string& filename){
    ifstream file(filename);
    if (!file.is_open()){
        return;
    }

    string line;
    string currentSection = "";

    while (getline(file, line)){
        if(line.empty()) continue;

        if (line == "[VIEWS]"){
            currentSection = "VIEWS";
            continue;
        } else if (line == "[PURCHASES]"){
            currentSection = "PURCHASES";
            continue;
        }

        stringstream ss(line);
        string userId;
        ss >> userId;
        string product;
        
        while (ss >> product) {
            if (currentSection == "VIEWS"){
                AddView(userId, product);
            } else if (currentSection == "PURCHASES") {
                AddPurchase(userId, product);
            }
        }
    }
    file.close();
}