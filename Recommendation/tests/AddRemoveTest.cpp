#include <gtest/gtest.h>
#include "DataModel.h"
#include "AddViewCommand.h"
#include "AddPurchaseCommand.h"
#include "RemoveViewCommand.h"
#include "RemovePurchaseCommand.h"

using namespace std;
// 1. Valid addition of multiple views
TEST(AddCommandTest, ValidMultipleViewsAdded) {
    DataModel model;
    AddViewCommand cmd(&model);
    string result = cmd.execute({"user1", "prod1", "prod2"});
    
    // Check if the command returns a 201 Created status
    EXPECT_TRUE(result.find("201 Created") != string::npos);
    EXPECT_EQ(model.getViewHistoryOfUser("user1").size(), 2);
}

// 2. Valid addition of a purchase
TEST(AddCommandTest, ValidPurchaseAdded) {
    DataModel model;
    AddPurchaseCommand cmd(&model);
    string result = cmd.execute({"user1", "milk"});
    
    EXPECT_TRUE(result.find("201 Created") != string::npos);
    EXPECT_EQ(model.getPurchaseHistoryOfUser("user1").size(), 1);
}

// 3. Edge case: Missing arguments
TEST(AddCommandTest, MissingArgumentsReturns400) {
    DataModel model;
    AddViewCommand cmd(&model);
    
    // Empty arguments vector
    EXPECT_TRUE(cmd.execute({}).find("400") != string::npos); 
    // Missing products (only user provided)
    EXPECT_TRUE(cmd.execute({"user1"}).find("400") != string::npos); 
}

// 4. Valid removal of an existing purchase
TEST(RemoveCommandTest, RemoveExistingPurchase) {
    DataModel model;
    model.AddPurchase("user1", "milk");
    
    RemovePurchaseCommand cmd(&model);
    string result = cmd.execute({"user1", "milk"});
    
    // Check for 204 No Content on successful deletion[cite: 4]
    EXPECT_TRUE(result.find("204 No Content") != string::npos);
    EXPECT_TRUE(model.getPurchaseHistoryOfUser("user1").empty());
}

// 5. Edge case: Removing a non-existing product should return 404
TEST(RemoveCommandTest, RemoveNonExistingProductReturns404) {
    DataModel model;
    RemoveViewCommand cmd(&model);
    
    string result = cmd.execute({"ghost_user", "ghost_product"});
    
    // The system should return 404 Not Found[cite: 4]
    EXPECT_TRUE(result.find("404 Not Found") != string::npos);
}

// 6. Edge case: Atomicity - partial failure aborts the whole operation
TEST(RemoveCommandTest, AtomicRemovalPreventsPartialDeletion) {
    DataModel model;
    model.AddPurchase("user1", "milk");
    model.AddPurchase("user1", "bread");
    
    RemovePurchaseCommand cmd(&model);
    // Requesting to remove "milk" (exists) and "ghost_product" (doesn't exist)
    string result = cmd.execute({"user1", "milk", "ghost_product"});
    
    EXPECT_TRUE(result.find("404 Not Found") != string::npos);
    // Verify that "milk" was NOT deleted because the operation was aborted
    EXPECT_EQ(model.getPurchaseHistoryOfUser("user1").size(), 2);
}