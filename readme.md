#**LumenFX**

##Introduction

LumenFX is an interactive platform that supports real-time financial data visualization, as well as historical data lookup for sparklines and OHLC charts. It executes simple trading rules in real time with an automated trade engine which also executes limit and stop orders. This application was written with Node.JS, SenecaJS and AngularJS.

This application retrieves live rates from Yahoo and OANDA, it can subscribe to multiple source depending on which currency pairs are available from the sources. This applications receives the data from other sources and publish it into its' own API with SenecaJS to be used by other services. 

LumenFX is released as Open Source Software under the [GPL3 licence](http://www.gnu.org/licenses/gpl-3.0.en.html)


##SenecaJS Microservices

###Price Service
* Initialises the currency pairs with day high and day low
* Retrieves prices from multiple sources
* Persists data into InfluxDB
* An automated execution engine that match open orders
* An automated execution engine that triggers stop or limit orders and executes them

###Order Service
* Inserts order into CouchDB
* Retrieves the trader's saved currency pairs to show upon starting the app

###Historical Service
* Retrieves data from InfluxDB to show a live trend of the day chart
* Retrieves data from InfluxDB to populate OHLC charts.

###Login Service
* Creates new trader and insert into CouchDB
* Authenticates users
* Saves the trader's trading limits

###Initialisedb Service
* Creates the tables for CouchDB database
* Creates the views for quering purposes

###FixMessage Service
* Builds fix messages to and from orders
* Parses fix messages to and from orders


###Dependencies:
* [Influx Database](https://influxdb.com/download/index.html#)
* [Couch Database](http://couchdb.apache.org/)

###Configuration:
* OANDA API Access Token `/public/config/OANDAConfig.js` 
* Influx Database Configurations `/public/config/influxDBConfig.js`
* Currency Subscriptions `/public/config/currencySubscriptions.js`
* Host `/public/config/host.js`


#Getting started
####Install [NodeJS](https://github.com/nodejs/node)
####Install [CouchDB](http://couchdb.apache.org/)
####Install [InfluxDB](https://influxdb.com/download/index.html#)
####Install application dependencies
```
npm install
```

####Edit Configuration files
* Include [OANDA](https://fxtrade.oanda.com/your_account/fxtrade/register/gate?utm_source=oandaapi&utm_medium=link&utm_campaign=devportaldocs_demo) Authentication 
* Influx Database Configurations
* Currency Subscriptions
* Host 

###Initialise CouchDB with tables and design views
```
node initialisedb-service.js
```

###Start the application with [PM2](https://github.com/Unitech/pm2)
```
pm2 start ecosystem.json
```
####Or
###Run Standalone Services 
```
node order-service.js
node price-service.js
node historical-service.js
node login-service.js
node app-all.js
```
####The Application will start automatically.

####Login with demo account or Register a new account 
* username : demo
* password : password


##Test
The tests will fail if the application cannot start in test mode on the default port, so make sure no other instances are running on the same port before running the tests.
```
npm test
```
##Team
LumenFX is built and maintained by [thecitysecret](http://www.thecitysecret.com/)([@thecitysecretltd](https://github.com/thecitysecretltd))
![thecitysecretltd](http://s23.postimg.org/r9800h063/tcs.jpg?raw=true "thecitysecretltd")

##License
LumenFX is released as Open Source Software under the [GPL3 licence](http://www.gnu.org/licenses/gpl-3.0.en.html)

