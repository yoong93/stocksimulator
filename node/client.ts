

// TODO:::::: ROUTER INSTEAD
import pkg, { QueryResult } from 'pg';
const { Client: PgClient } = pkg;
// pg
// need pool?
export class PgConnector {
    pgClient;
    constructor() {
        this.pgClient = new PgClient({
            user: 'yoong93',
            database: 'stock_history',
            password: '1522357'
        });
        this.pgClient.connect();
    }
    queryStock(symbol:String, target: String) {
        // can't use paramtized query for select(pg limitation)
        const query = `SELECT to_char(time::Date, 'YYYY-MM-DD HH24:MI:SS') AS time, ${target}, volume FROM stock_price WHERE symbol=\'${symbol}\';`;
        return this.pgClient.query(query); // return promise
    }
}


// code for debugging
//let pgtest = new PgConnector;
//pgtest.queryStock("IBM", "close");


