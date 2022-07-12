import express from 'express';
import net from 'net';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PgConnector } from "./client.js";
import { NextFunction } from 'connect';
import { stringify } from 'querystring';
import { Socket } from 'dgram';
import { networkInterfaces } from 'os';
import uuid_apikey from 'uuid-apikey';
import jwt from 'jsonwebtoken';
import fs from 'fs';

import codesJson from '../codes.json';
const client_port = 8080;
const web_port = process.env.PORT || 3001;
const api_key = "BXWE0TLJQVV39MST";
var alpha_url = "https://www.alphavantage.co/query?";


const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
let pgConnector = new PgConnector();
// Broswer handler 

app.get('/', (req, res) => {
    res.json({message: "Hello from server!" });
});

app.get('/game/stock/:symbol', (req, res) => {
    const user_chkmsg = `{"type": "004", "user":"${req.body.user}", "token":"${req.body.token}"}`;
    const socket = new net.Socket;
    socket.addListener('data', (data) =>{
        const result = JSON.parse(data.toString())["result"];
        const resultcode:string = "0".concat(result.toString()); // better code system for this...
        
        if (result == 54){
            const queryPromise = pgConnector.queryStock(req.params.symbol,"close");
            queryPromise.then(data => {
            const qresult = { rows : data["rows"] };
            res.status(200).json(qresult);
        }).catch(err => { // classify errors!
            res.status(400).write("INTERNAL ERROR");
            // TODO :: LOG EROR?res.status(400).write(err);
        });
        } else {
            res.status(401).send(codesJson[resultcode as keyof typeof codesJson]);
        } 
    });
    
    socket.addListener('error', (err)=>{
        res.status(400).write(err);
    })
    SendMsgtoServer(user_chkmsg, socket);
    
});

app.post('/user', (req, res) => {
    const user = req.body.name
    const apikey = uuid_apikey.create().apiKey;
    const socket = new net.Socket;
    const user_createmsg = `{"type": "002", "user":"${user}", "token":"${apikey}"}`;
    socket.addListener('data', (data) =>{
        const result = JSON.parse(data.toString())["result"];
        const resultcode:string = "0".concat(result.toString()); // better code system for this...
        
        if (result==52){
            res.status(202).send(codesJson[resultcode as keyof typeof codesJson].concat(`, token:${apikey}`));
        }else {
            res.status(500).send(codesJson[resultcode as keyof typeof codesJson]);
        }
    })
    socket.addListener('error', (err)=>{
        res.status(400).write(err)
    })
    SendMsgtoServer(user_createmsg, socket);
})

app.post('/game/stocknum/:num/', (req, res) => {
    const stock_num = req.params.num
    const create_game = `{"type": "003", "stock_num":${stock_num}}`;
    const socket = new net.Socket;
    
    // TODO : only send request to create game, return response earlier?
    socket.addListener('data', (data) =>{
        res.status(202).send(data);
    })
    socket.addListener('error', (err)=>{
        res.status(400).write(err)
    })
    SendMsgtoServer(create_game, socket);

});

app.post('/game/shutdown', (req, res) => {
    //stockClient.sendMsgtoServer('{"type": "SHUTDOWN", "body": "SHUTTING DOWN GAME"}');
    res.send("SHUTDDING DOWN");
});

app.listen(web_port, () => {
    console.log('Sample app trying');
});


export function SendMsgtoServer(msg: string, socket:net.Socket){
    socket.connect(client_port, '127.0.0.1', () => {
        console.log('Connected');
        socket.write(msg);
    });
    socket.on('error', (err) => {
        console.log("Socket-Client Error");
        console.log(err);
    });
    socket.on('data', (data) => {
        console.log('Client Received: ' + data);
    });
    socket.on('close', () => {
        socket.destroy();
        console.log('client socket closed');
    });
}
