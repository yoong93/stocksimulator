#include <stdio.h>
#include <iostream>
#include <pqxx/pqxx>

#include "database.h"

using namespace std;
using namespace pqxx;

pqxx::result Database::PostgresConnect::r = pqxx::result();

int Database::PostgresConnect::csv_to_db(std::string filepath){
    std::string sql = "COPY stock_price(time, open, high, low, close, volume, symbol, interval_type, interval) FROM '" + filepath +"' DELIMITER ',' CSV HEADER;";
    return send_sql(sql);   
}

int Database::PostgresConnect::check_user(std::string username, std::string password){
    std::string sql = "SELECT * FROM players WHERE name=\'" + username +"\' and password=\'" + password + "\';";
    int result = send_sql(sql);
    if(result < 0){
        return -1; 
    } else {
        return r.size(); // 0 if not found > 1 if found
    }
}

int Database::PostgresConnect::check_userdup(std::string username){
    std::string sql = "SELECT COUNT(name) FROM players WHERE name=\'" + username + "\';";
    int result = send_sql(sql);
    return result > 0;
}

int Database::PostgresConnect::send_sql(std::string sql){
    try{
        pqxx::connection c{
            "user=yoong93 "
            "dbname=stock_history" 
        };

        pqxx::work txn{c};
        r = txn.exec(sql);
        txn.commit();
        c.disconnect();

    }catch (const std::exception &e){
        cerr << e.what() << std::endl;
        //r = pqxx::result(); // TODO :: define behavior...?
        return -1;
    }
    return 1;
}
int Database::PostgresConnect::create_user(std::string user, std::string password){
    std::string sql = "INSERT INTO players (name, password, money) VALUES (\'" + user + "\', \'" + password + "\', 0);";
    return send_sql(sql);   
}
