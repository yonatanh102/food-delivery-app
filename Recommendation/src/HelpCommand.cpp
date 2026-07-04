#include "HelpCommand.h"
#include <ostream>

using namespace std;
string HelpCommand::execute(const vector<string>& args){

    string helpMenu = "200 Ok\n";
    helpMenu += "1. add product to view history: : [userid] [productid1] [productid2] ...\n";
    helpMenu += "2. add product to parchase history: : [userid] [productid1] [productid2] ...\n";
    helpMenu += "3. delete product from view history: [userid] [productid1] [productid2] ...\n";
    helpMenu += "4. delete product from parchase history: [userid] [productid1] [productid2] ...\n";
    helpMenu += "5. get recommendation: [userid] [productid]\n";

    return helpMenu;
}