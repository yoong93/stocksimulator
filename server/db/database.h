#ifndef DATABASE_H
#define DATABASE_H

#include <iostream>
#include <pqxx/pqxx>

namespace Database
{
    class PostgresConnect
    {
        public:
            static int csv_to_db(std::string);
            static int create_user(std::string, std::string);
            static int check_user(std::string, std::string);
            static int check_userdup(std::string);
        private:
            static pqxx::result r;
            static int send_sql(std::string);
    };
}

#endif