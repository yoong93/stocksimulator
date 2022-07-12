"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgConnector = void 0;
// TODO:::::: ROUTER INSTEAD
const pg_1 = __importDefault(require("pg"));
const { Client: PgClient } = pg_1.default;
// pg
// need pool?
class PgConnector {
    constructor() {
        this.pgClient = new PgClient({
            user: 'yoong93',
            database: 'stock_history',
            password: '1522357'
        });
        this.pgClient.connect();
    }
    queryStock(symbol, target) {
        // can't use paramtized query for select(pg limitation)
        const query = `SELECT to_char(time::Date, 'YYYY-MM-DD HH24:MI:SS') AS time, ${target}, volume FROM stock_price WHERE symbol=\'${symbol}\';`;
        return this.pgClient.query(query); // return promise
    }
}
exports.PgConnector = PgConnector;
// code for debugging
//let pgtest = new PgConnector;
//pgtest.queryStock("IBM", "close");
