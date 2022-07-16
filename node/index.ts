import express from 'express';
import net from 'net';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PgConnector } from "./client.js";
import { stringify } from 'querystring';
import { networkInterfaces } from 'os';
import uuid_apikey from 'uuid-apikey';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv/config';

import codesJson from '../codes.json';
const client_port = 8080;
const web_port = process.env.PORT || 3001;
const api_key = "BXWE0TLJQVV39MST";
var alpha_url = "https://www.alphavantage.co/query?";


const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const pgConnector = new PgConnector();
let refreshTokens = []; 
// Broswer handler 

app.get('/game/stock/:symbol', (req, res) => {
    const authheader = req.headers["authorization"];
    const valid = checkToken(authheader);
    if(valid.length() == 0){
        res.status(401).send("INVALID AUTHENTICATION"); // use codes?
    }

    const socket = new net.Socket;
    const queryPromise = pgConnector.queryStock(req.params.symbol,"close");
    queryPromise.then(data => {
    const qresult = { rows : data["rows"] };
        res.status(200).json(qresult);
    }).catch(err => { // classify errors!
        res.status(400).write("INTERNAL ERROR");
        // TODO :: LOG ERROR?res.status(400).write(err);
    });
});

// User Login
app.post('/user', (req, res)=>{
    const user = req.body.name
    const password = bcrypt.hash(req.body.password, 10);
    const socket = new net.Socket;
    const user_createmsg = `{"type": "002", "user":"${user}", "password":"${password}"}`;
    socket.addListener('data', (data) =>{
        const result = JSON.parse(data.toString())["result"];
        const resultcode:string = "0".concat(result.toString()); // better code system for this...
        if (result < 60){
            res.status(202).send(codesJson[resultcode as keyof typeof codesJson]);
            const accessTk = generateAccessToken(req.body.name);
            const refreshTK = generateRefreshToken(req.body.name);
            res.status(202).json({"accessToken": accessTk, "refreshToken": refreshTK});
        }else {
            res.status(500).send(codesJson[resultcode as keyof typeof codesJson]);
        }
    });
    socket.addListener('error', (err)=>{
        res.status(400).write(err)
    })
    SendMsgtoServer(user_createmsg, socket);
});

app.post('/game/stocknum/:num/', (req, res) => {
    const authheader = req.headers["authorization"];
    const valid = checkToken(authheader);
    if(valid.length() == 0){
        res.status(401).send("INVALID AUTHENTICATION"); // use codes?
    }; // TODO :: Middleware validity check.

    const stock_num = req.params.num
    const create_game = `{"type": "003", "stock_num":${stock_num}}`;
    const socket = new net.Socket;
    
    // TODO : async using http polling?
    socket.addListener('data', (data) =>{
        const result = JSON.parse(data.toString())["result"];
        const resultcode:string = "0".concat(result.toString()); // better code system for this...
        
        if (result==53){
            res.status(202).send(codesJson[resultcode as keyof typeof codesJson]);
        }else {
            res.status(500).send(codesJson[resultcode as keyof typeof codesJson]);
        }
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


function SendMsgtoServer(msg: string, socket:net.Socket){
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


// Tokens
function generateAccessToken(username:string):string{ // TODO : HOW TO CONFIRM envfile
    return jwt.sign({username}, process.env.ACCESS_TOKEN_SECRET!, { expiresIn : "15m"});
}

function generateRefreshToken(username:string):string{
    const refreshTK = jwt.sign({username}, process.env.REFRESH_TOKEN_SECRET!, { expiresIn : "20m"});
    refreshTokens.push(refreshTK);
    return refreshTK;
}

// auth
function checkToken(token:string | undefined): string | jwt.JwtPayload{
    if(token === undefined){
        return "";
    }

    try{
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
        return decoded;    
    } catch (err) {
        return "";
    }
} 