#ifndef RECOMMANDCOMMAND_H
#define RECOMMENDCOMMAND_H

#include "ICommand.h"
#include "IDataRepository.h"
#include <queue>
#include <string>
#include <vector>
#include <utility> // For std::pair

/**
 * @class RecommendCommand
 * @brief Handles product recommendations based on user collaborative filtering.
 * * This command calculates the similarity between users based on their view
 * and purchase histories using the Jaccard index. It then utilizes a Max-Heap
 * to extract the most similar users and recommend products they interacted with.
 */
class RecommendCommand : public ICommand{
    private:
        IDataRepository* m_model; ///< Pointer to the central database model.

        /**
        * @brief Calculates the weighted similarity score between two users.
        * @param user1 The target user ID.
         * @param user2 The user ID to compare against.
        * @return A double representing the similarity score (0.0 to 1.0).
        */
        double calculateUserSimilarity(const std::string& user1, const std::string& user2);

        /**
        * @brief Calculates the Jaccard similarity (Intersection over Union) between two sets.
        * @param set1 The first set of product IDs.
        * @param set2 The second set of product IDs.
        * @return The Jaccard index (0.0 to 1.0).
        */
        double calculateJaccard(const std::unordered_set<std::string>& set1, const std::unordered_set<std::string>& set2);
        /**
        * @brief Extracts a limited list of recommended products from the most similar users.
        * @param user1 The target user ID.
        * @param topUsers A priority queue (Max-Heap) of users sorted by similarity score.
        * @return A formatted response string containing the recommended product IDs.
        */    
        std::string RecommendedProducts(const std::string& user1, std::priority_queue<std::pair<double, std::string>>& topUsers);
    public:
        /**
        * @brief Constructor injects the DataModel dependency.
        */
        RecommendCommand(IDataRepository* model) : m_model(model) {}

        /**
        * @brief Executes the recommendation algorithm.
        * Expected arguments: [userid] [productid]
        * @param args The vector of string arguments passed from the client.
        * @return A status code and the recommended products, or an error message.
        */
        std::string execute(const std::vector<std::string>& args) override;
};

#endif