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
    
    // Check if the command returns a success message
    EXPECT_TRUE(result.find("200 OK") != string::npos);
    // Verify the data was actually saved in the DataModel
    EXPECT_EQ(model.getViewHistoryOfUser("user1").size(), 2);
}

// 2. Valid addition of a purchase
TEST(AddCommandTest, ValidPurchaseAdded) {
    DataModel model;
    AddPurchaseCommand cmd(&model);
    string result = cmd.execute({"user1", "milk"});
    
    EXPECT_TRUE(result.find("200 OK") != string::npos);
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
    
    EXPECT_TRUE(result.find("200 OK") != string::npos);
    // Verify the list is now empty
    EXPECT_TRUE(model.getPurchaseHistoryOfUser("user1").empty());
}

// 5. Edge case: Removing a non-existing product should not crash the system
TEST(RemoveCommandTest, RemoveNonExistingProductDoesNotCrash) {
    DataModel model;
    RemoveViewCommand cmd(&model);
    
    // Attempting to remove from a ghost user and a ghost product
    string result = cmd.execute({"ghost_user", "ghost_product"});
    
    // The system should handle this gracefully without crashing
    EXPECT_TRUE(result.find("200 OK") != string::npos);
}