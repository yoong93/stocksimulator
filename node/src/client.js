import net from 'net';
import pkg from 'pg';
const { Client: PgClient } = pkg;
const client_port = 8080;
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
    queryStock(symbol) {
        const query = {
            text: 'SELECT * FROM stock_price WHERE symbol=$1',
            values: [symbol]
        };
        this.pgClient.query(query, (err, res) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log("QUERY RESULT: ");
                console.log(res);
                console.log("end of query");
            }
        });
    }
}
export class StockClient {
    client;
    constructor() {
        this.client = new net.Socket();
    }
    connect_client() {
        console.log('connect client');
        this.client.connect(client_port, '127.0.0.1', () => {
            console.log('Connected');
            this.client.write('{"type": "CLIENT CONNECT"}');
        });
        this.client.on('error', (err) => {
            console.log("client error, exiting client connection");
            console.log(err);
        });
        this.client.on('data', (data) => {
            console.log('Client Received: ' + data);
        });
        this.client.on('close', (data) => {
            this.client.destroy();
            console.log('client socket closed');
        });
    }
    sendMsgtoServer(data) {
        if (this.client.write(data)) {
            console.log('Sending Message: ' + data);
        }
        else {
            console.log('ERROR Sending Message: ' + data);
        }
    }
}
// code for debugging
let clitest = new StockClient;
clitest.connect_client();
let pgtest = new PgConnector;
pgtest.queryStock("IBM");


