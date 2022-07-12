---
# Stock Simulation

Web App for stock purchase simulation based on real data collected by stock API.(Currently using AlphaVantage daily)  
Players can see how much money they can make during given period and see how good they are in stock market  
before actively participating in actual market!  

<br/><br/>
## Basic Structure - Based on three microservices, and three entities in database

![Alt text](StockSimulator.jpg?raw=true "Title")

<br/><br/>
## Goal for each entities 

- Stock - dynamically collected each round, contains history of stock prices(high, low, close, volume) and earnings. Provide useful hints(news, category of business, **interest rate**) to players.
Each stock names should be masked.

- Game - More options to play(interval of data/round, # of rounds, diverse period i.e. great depression? hide part of chart, reveal each round. Determines winner based on money they have. Can accept calls from api, so that we can test trade algorithm. 

- Users - Simple authentication with tokens, no password needed since no private information is stored. 

Packaging with Docker. and run on instance


<br/><br/>

## Current Status (0.0.1)
- Stock - Get stocks (limited to 5) from Alphavatage daily, plot close price as line chart. 

- Game - Created with POST API call. 

- User - Login with username, password. (JWT Token authentication)

---

