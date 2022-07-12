#ifndef MSGHANDLER_H
#define MSGHANDLER_H

#include <iostream>
#include <nlohmann/json.hpp>


namespace msghandler
{
    class MsgHandler
    {
        public:
            MsgHandler();
            int handleMessage(char *msg);
            const char* msg_ptr;
        private:
            nlohmann::json codes;
            const char* stocklist[5];
            const char* codesfilepath;
            char* m_msg;
            nlohmann::json m_jmsg;
            std::string m_result_msg;
            int parseMessage();
            int processMessage();

            /////// msgformatter {"type": x , "BODY " }
            const char* serverconnect_msg = "Server Connected";
            const char* gamecreated_msg = "Game Created";
            const char* unknown_msg = "Unknown Msg";
            const char* usercreated_msg = "User Created";
            const char* validuser_msg = "Valid User";
            const char* invaliduser_msg = "Invalid User";
            
    };
}

#endif