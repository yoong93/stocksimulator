import express from 'express';
//import pkg, { QueryResult } from 'pg';
//const { Client: PgClient } = pkg;
const app = express();
import bodyParser from 'body-parser';
import cors from 'cors';
const api_key = "BXWE0TLJQVV39MST";
var alpha_url = "https://www.alphavantage.co/query?";
import { StockClient, PgConnector } from "./client.js";
const web_port = 8000;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
let stockClient = new StockClient();
stockClient.connect_client();
let pgConnector = new PgConnector();
// Broswer handler 
app.get('/', (req, res) => {
    res.send('Node connected to web');
});
app.get('/game/stock', (req, res) => {
    //const get_stock_hardcode = '{"type": "GET STOCK", "user": "yoong93", "symbol": "IBM"}';
    pgConnector.queryStock("IBM");
    res.status(202);
    res.send("loading data...");
});
app.post('/game', (req, res) => {
    const create_game_hardcode = '{"type": "CREATE GAME", "user":"yoong93"}';
    stockClient.sendMsgtoServer(create_game_hardcode);
    res.status(202);
    res.send("GAME CREATING...");
});
app.post('/game/shutdown', (req, res) => {
    stockClient.sendMsgtoServer('{"type": "SHUTDOWN", "body": "SHUTTING DOWN GAME"}');
    res.send("SHUTDDING DOWN");
});
app.listen(web_port, () => {
    console.log('Sample app trying');
});
/*
// pg
// need pool?
const pgClient = new PgClient({
    user: 'yoong93', // TODO : make readonly user,
    database: 'stock_history',
    password: '1522357'
});

await pgClient.connect();

function queryStock(symbol: string){
    const query = {
        text: 'SELECT * FROM stock_price WHERE symbol=$1',
        values: [symbol]
    }
    console.log("query: " + query);
    pgClient.query(query, (err: Error, res: QueryResult) => {
        if(err){
            console.log(err);
        } else{
            console.log(res);
        }
    });
}


// client connect
let client = new net.Socket();
connect_client();
function connect_client(){
    console.log('connect client');
    client.connect(client_port, '127.0.0.1', () => {
        console.log('Connected');
    });
    
    client.on('error', (err) => {
        console.log("client error, exiting client connection");
        console.log(err);
    });

    client.on('data', (data) => {
        console.log('Client Received: '  + data);
    });

    client.on('close', (data) => {
        client.destroy();
        console.log('client socket closed');
    });
}

function sendMsgtoServer(data: string){
    if(client.write(data)){
        console.log('Sending Message: ' + data);
    } else {
        console.log('ERROR Sending Message: ' + data);
    }
}

*/ 
