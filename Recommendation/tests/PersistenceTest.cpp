#include <gtest/gtest.h>
#include "DataModel.h"
#include <fstream>
#include <cstdio> // For remove()

using namespace std;

TEST(DataModelPersistenceTest, SaveAndLoadMaintainsData) {
    string testFilename = "test_data.txt";
    
    {
        DataModel model1;
        model1.AddView("user1", "apple");
        model1.AddPurchase("user1", "milk");
        model1.AddPurchase("user2", "bread");
        
        model1.saveToFile(testFilename);
    }
    
    {
        DataModel model2;
        model2.loadFromFile(testFilename);
        
        auto views = model2.getViewHistoryOfUser("user1");
        EXPECT_EQ(views.size(), 1);
        EXPECT_TRUE(views.find("apple") != views.end());
        
        auto purchases1 = model2.getPurchaseHistoryOfUser("user1");
        EXPECT_EQ(purchases1.size(), 1);
        EXPECT_TRUE(purchases1.find("milk") != purchases1.end());
        
        auto purchases2 = model2.getPurchaseHistoryOfUser("user2");
        EXPECT_EQ(purchases2.size(), 1);
        EXPECT_TRUE(purchases2.find("bread") != purchases2.end());
    }
    
    remove(testFilename.c_str());
}