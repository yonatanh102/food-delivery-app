#include "RecommendCommand.h"
#include <sstream>

using namespace std;

string RecommendCommand::execute(const vector<string>& args){
    // 1. Input Validation: Prevent out-of-bounds crashes
    if (args.empty()) return("400 Bad Request: Missing user ID\n");
    if (args.size() < 2) return("400 Bad Request: Missing product IDs\n");
    if (args.size() > 3) return("400 Bad Request: Too many arguments\n");

    string user1 = args.front(); // Target user
    string product = args.back(); // Target product

    // 2. Fetch all users who interacted with the target product
    unordered_set<string> users = m_model->getViewHistoryOfProduct(product);
    unordered_set<string> usersPurchase = m_model->getPurchaseHistoryOfProduct(product);

    // Combine viewers and purchasers into one unique set
    users.insert(usersPurchase.begin(), usersPurchase.end());

    // 3. Populate a Max-Heap (priority_queue) to sort users by similarity score
    priority_queue<pair<double, string>> topUsers;

    for (const string& user2 : users){
        if (user1 == user2) continue; // Skip comparing the user to themselves

        double score = calculateUserSimilarity(user1, user2);

        // Push pair {score, userId}. The queue automatically sorts by the highest score.
        if (score > 0) topUsers.push({score, user2});
    }

    // 4. Generate recommendations based on the top similar users
    return (RecommendedProducts(user1, topUsers));
}

double RecommendCommand::calculateUserSimilarity(const string& user1, const string& user2){
    // Calculate Jaccard similarity for views
    const auto& user1ViewProducts = m_model->getViewHistoryOfUser(user1);
    const auto& user2ViewProducts = m_model->getViewHistoryOfUser(user2);
    double viewSimilarity = calculateJaccard(user1ViewProducts, user2ViewProducts);

    // Calculate Jaccard similarity for purchases
    const auto& user1PurchaseProducts = m_model->getPurchaseHistoryOfUser(user1);
    const auto& user2PurchaseProducts = m_model->getPurchaseHistoryOfUser(user2);
    double purchaseSimilarity = calculateJaccard(user1PurchaseProducts, user2PurchaseProducts);

    // Give higher weight (70%) to purchase history over view history (30%)
    return (0.7 * purchaseSimilarity) + (0.3 * viewSimilarity);
}

double RecommendCommand::calculateJaccard(const unordered_set<string>& set1, const unordered_set<string>& set2){
   if (set1.empty() && set2.empty()) return 0.0;

    // Optimization: Always iterate over the smaller set to find intersections in O(N_small)
    const unordered_set<string>* smaller = &set1;
    const unordered_set<string>* larger = &set2;

    if (set2.size() < set1.size()) {
        smaller = &set2;
        larger = &set1;
    }

    int intersectionSize = 0;
    for (const string& item : *smaller) {
        if (larger->find(item) != larger->end()) {
            intersectionSize++;
        }
    }

    int unionSize = set1.size() + set2.size() - intersectionSize;
    if (unionSize == 0) return 0.0; // Prevent division by zero

    return static_cast<double>(intersectionSize) / unionSize;
}

string RecommendCommand::RecommendedProducts(const string& user1, priority_queue<pair<double, string>>& topUsers){
    // Create a set of all products user1 already knows (views + purchases)
    unordered_set<string> user1AllProducts = m_model->getViewHistoryOfUser(user1);
    const auto& user1PurchaseProducts = m_model->getPurchaseHistoryOfUser(user1);
    user1AllProducts.insert(user1PurchaseProducts.begin(), user1PurchaseProducts.end());

    // Define the maximum number of recommendations we want to return
    const int MAX_RECOMMENDATIONS = 5; 
    int currentRecommendationsCount = 0;
    string productsStr = "";

    // Iterate through the most similar users until we reach our recommendation limit
    while (!topUsers.empty() && currentRecommendationsCount < MAX_RECOMMENDATIONS) {
        string bestUser = topUsers.top().second; // Extract the user with the highest score
        topUsers.pop();

        // Combine the similar user's view and purchase history
        unordered_set<string> user2AllProducts = m_model->getViewHistoryOfUser(bestUser);
        const auto& user2PurchaseProducts = m_model->getPurchaseHistoryOfUser(bestUser);
        user2AllProducts.insert(user2PurchaseProducts.begin(), user2PurchaseProducts.end());

        // Find products that the similar user knows, but our target user doesn't
        for (const string& prod : user2AllProducts) {
            // Check if we hit the limit before adding another product
            if (currentRecommendationsCount >= MAX_RECOMMENDATIONS) break;

            if (user1AllProducts.find(prod) == user1AllProducts.end()) {
                productsStr += prod + " ";
                
                // Add the product to user1's local copy so we don't recommend it again
                // in case the next user in the heap also has this product
                user1AllProducts.insert(prod); 
                
                currentRecommendationsCount++;
            }
        }
    }

    // Return formatting based on whether we found any products
    if (currentRecommendationsCount > 0) {
        return "200 OK\nRecommended Products: " + productsStr + "\n";
    }

    return "404 Not Found: No recommendations available for this user.\n";
}