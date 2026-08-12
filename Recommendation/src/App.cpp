#include "App.h"
#include <sstream>
#include <cctype>
#include <algorithm>
#include <iostream>

void App::run() {
    while (true) { 
        // get line from menu
        string line = menu->nextCommand();
        if(line.empty() || line == "quit") break;

        stringstream st(line);
        string task;
        st >> task;

        //Change all commands to uppercase.
        transform(task.begin(), task.end(), task.begin(), [](unsigned char c){
            return toupper(c);
        });

        //Split the rest into vector.
        vector<string> args;
        string temp;
        while(st >> temp){
            args.push_back(temp);
        }

        string msg = "";
        try{
            //Check if task exists and pass it to execute.
            if(commands.count(task)) {
                msg = commands[task]->execute(args);
            }else{
                msg = "400 Bad Request\n";
            }
        } catch(const std::exception& e) {
            cerr << "Exception caught: " << e.what() << '\n';
            msg = "400 Bad Request\n";
        } catch(...) {
            std::cerr << "Unknown exception caught!\n";
            msg = "400 Bad Request\n";
        }
        menu->response(msg);
    }
    
}