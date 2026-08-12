#include <gtest/gtest.h>
#include "DataModel.h"
#include "RecommendCommand.h"
#include "RemoveViewCommand.h" // Needed for test #10

using namespace std;

// 1. Edge case: Completely empty arguments
TEST(RecommendCommandTest, EmptyArguments) {
    DataModel model;
    RecommendCommand cmd(&model);
    EXPECT_TRUE(cmd.execute({}).find("400") != string::npos);
}

// 2. Edge case: Missing target product
TEST(RecommendCommandTest, MissingTargetProduct) {
    DataModel model;
    RecommendCommand cmd(&model);
    EXPECT_TRUE(cmd.execute({"user1"}).find("400") != string::npos);
}

// 3. Edge case: Target user does not exist in the system
TEST(RecommendCommandTest, UserHasNoHistory) {
    DataModel model;
    RecommendCommand cmd(&model);
    EXPECT_TRUE(cmd.execute({"ghost_user", "apple"}).find("404") != string::npos);
}

// 4. Edge case: No other users interacted with the target product
TEST(RecommendCommandTest, ProductHasNoOtherInteractions) {
    DataModel model;
    model.AddPurchase("user1", "apple");
    RecommendCommand cmd(&model);
    EXPECT_TRUE(cmd.execute({"user1", "apple"}).find("404") != string::npos);
}

// 5. Edge case: Similar user exists, but has no new products to recommend
TEST(RecommendCommandTest, SimilarUserHasNoNewProducts) {
    DataModel model;
    model.AddView("user1", "apple");
    model.AddView("user1", "banana");
    
    // user2 interacted with the exact same products, nothing new to offer
    model.AddView("user2", "apple");
    model.AddView("user2", "banana");
    
    RecommendCommand cmd(&model);
    EXPECT_TRUE(cmd.execute({"user1", "apple"}).find("404") != string::npos);
}

// 6. Valid: Basic recommendation from a single similar user
TEST(RecommendCommandTest, BasicSingleRecommendation) {
    DataModel model;
    model.AddView("user1", "apple");
    
    model.AddView("user2", "apple");
    model.AddPurchase("user2", "bread"); // New product to recommend
    
    RecommendCommand cmd(&model);
    string result = cmd.execute({"user1", "apple"});
    EXPECT_TRUE(result.find("200 OK") != string::npos);
    EXPECT_TRUE(result.find("bread") != string::npos);
}

// 7. Valid: System filters out products the target user already knows
TEST(RecommendCommandTest, FiltersOutAlreadyKnownProducts) {
    DataModel model;
    model.AddView("user1", "apple");
    model.AddView("user1", "banana");
    
    model.AddView("user2", "apple");
    model.AddView("user2", "banana");
    model.AddPurchase("user2", "milk"); // Only this product is new to user1
    
    RecommendCommand cmd(&model);
    string result = cmd.execute({"user1", "apple"});
    
    EXPECT_TRUE(result.find("milk") != string::npos);
    EXPECT_TRUE(result.find("banana") == string::npos); // Should NOT recommend banana
}

// 8. Valid (Weights): Purchase similarity is prioritized over view similarity
TEST(RecommendCommandTest, PriorityGivenToPurchaseSimilarity) {
    DataModel model;
    model.AddPurchase("user1", "apple"); 
    
    // user2 only viewed (weak similarity) and bought bread
    model.AddView("user2", "apple");
    model.AddPurchase("user2", "bread");
    
    // user3 purchased (strong similarity) and bought milk
    model.AddPurchase("user3", "apple");
    model.AddPurchase("user3", "milk");
    
    RecommendCommand cmd(&model);
    string result = cmd.execute({"user1", "apple"});
    
    // System should prefer user3 due to higher weight of purchase, thus recommending milk
    EXPECT_TRUE(result.find("milk") != string::npos);
    EXPECT_TRUE(result.find("bread") == string::npos);
}

// 9. Valid (Limit): System respects the maximum recommendations limit (e.g., Top 5)
TEST(RecommendCommandTest, RespectsMaxRecommendationsLimit) {
    DataModel model;
    model.AddView("user1", "apple");
    
    model.AddView("user2", "apple");
    // Add 6 new products to user2
    model.AddView("user2", "prod1");
    model.AddView("user2", "prod2");
    model.AddView("user2", "prod3");
    model.AddView("user2", "prod4");
    model.AddView("user2", "prod5");
    model.AddView("user2", "prod6");
    
    RecommendCommand cmd(&model);
    string result = cmd.execute({"user1", "apple"});
    
    // Check that NOT all 6 products are in the recommendation string
    bool hasAllSix = (result.find("prod1") != string::npos) && 
                     (result.find("prod2") != string::npos) &&
                     (result.find("prod3") != string::npos) &&
                     (result.find("prod4") != string::npos) &&
                     (result.find("prod5") != string::npos) &&
                     (result.find("prod6") != string::npos);
    
    EXPECT_FALSE(hasAllSix); 
}

// 10. Edge case (Dynamic State): Removing a product affects recommendations in real-time
TEST(RecommendCommandTest, RemovingProductChangesRecommendation) {
    DataModel model;
    model.AddView("user1", "apple");
    
    model.AddView("user2", "apple");
    model.AddView("user2", "milk");
    
    // Remove the apple from user2, breaking the similarity
    RemoveViewCommand rmCmd(&model);
    rmCmd.execute({"user2", "apple"});
    
    RecommendCommand recCmd(&model);
    string result = recCmd.execute({"user1", "apple"});
    
    // Due to the removal, user2 is no longer similar, hence no recommendation
    EXPECT_TRUE(result.find("404") != string::npos);
}