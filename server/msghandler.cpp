#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <cstring>
#include <sys/socket.h>
#include <unistd.h>
#include <nlohmann/json.hpp>
#include <fstream>

#include "db/database.h"
#include "alpha_vantage/datadownloader.h"
#include "msghandler.h"

using namespace msghandler;

MsgHandler::MsgHandler() : stocklist{"IBM", "MSFT", "AAPL", "NFLX", "GOOGL"}, codesfilepath{"/home/yoong93/stock/codes.json"}{
    std::ifstream i(codesfilepath);
    i >> codes;
}

int MsgHandler::handleMessage(char *msg){
    int result = 0;
    m_msg = msg;
    if(parseMessage() > 0){
        result = processMessage();
    }else {
        result = 90;
    }

    return result;
}

int MsgHandler::parseMessage(){
    int result = 0;
    int i = strcspn(m_msg, "\0");
    std::string str_msg(m_msg, i);
        
    try {
        m_jmsg = nlohmann::json::parse(str_msg);
        result = 1;
    } catch (nlohmann::json::parse_error& ex) {
        std::cout << "ERROR: error during parse: " << str_msg << " \nmsg: " << ex.what() << std::endl;
        result = -1;
    }
   return result;
}

int MsgHandler::processMessage(){
   	std::string type = m_jmsg["type"]; // "001"
    int result = 0;
    int code = atoi(type.c_str());
    std::string test = codes[type];
    msg_ptr = (codes[type].dump()).c_str();
    std::unique_ptr<AlphaVantage::DataDownloader> downloader;
    
    switch (code) {
        case 1:
            result = 51; // server connect success
            break;
        
        case 2:
            if(Database::PostgresConnect::check_userdup(m_jmsg["user"])){
                // duplicate exists
                result = 62;
            } else {
                if(Database::PostgresConnect::create_user(m_jmsg["user"], m_jmsg["password"])){
                result = 52; // user create success
            } else{
                result = 99;
            }
            
            
            break;

        case 3:
            int i;
            result = 053; // game create success, if fails, set codes later.
            downloader = std::make_unique<AlphaVantage::DataDownloader>();
            for(i = 0; i < m_jmsg["stock_num"];i++){
                const char* symbol = stocklist[i];
                downloader->setconfig(symbol);
                
                if(downloader->download() > 0){
                    if(Database::PostgresConnect::csv_to_db(downloader->get_fname()) > 0){
                        printf("DB CREATED");
                        downloader->delete_file();
                    } else{
                        std::cerr<< "POSTGRES ERROR: " << symbol <<std::endl;
                        result = 99;
                    }
                } else {
                    std::cerr<< "DOWNLOADER ERROR" << symbol << std::endl;
                    result = 99;
                }
            } // todo delete all partial successful games
            break;

        case 4:
            if(Database::PostgresConnect::check_user(m_jmsg["user"], m_jmsg["token"]) <= 0){
                result = 55; //invalid authentication
            } else{
                result = 54; // valid authentication
            }

            break;
        
        default:
            result = 91;
            break;

    }
    
    return result;
}
