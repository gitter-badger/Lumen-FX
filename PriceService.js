/**
 *	<LumenFX: An FX system designed and built by thecitysecret>
 *  Copyright (C) 2015 thecitysecret
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 * 
 */

module.exports  = function PriceService(database){
"use strict";
var	request 	= require('request'),
	influx		= require('influx'),
	Q 			= require('q'),
	bodyParser 	= require('body-parser'),
	dbConfig 	= require('./public/config/InfluxDBConfig'),
availablePairs	= require('./public/config/currencySubscriptions'),
	measurement = dbConfig.measurement,	
	dbInflux 	= influx(dbConfig),
	oandaConfig	= require('./public/config/OANDAConfig'),
	CurrencyPair= require('./public/js/CurrencyPair'),
	logger 		= require('./public/config/logger'),
	myPairs 	= [],
	currentPair = [],
	initialised	= false;
/**
 * Multiple Price Sourcing
 * OANDAPairs are prices which are subscribed from OANDA
 * YAHOOPairs are prices which are subscribed from YahooAPI
 */
var OANDAPairs = availablePairs.OANDAPairs,
	YAHOOPairs = availablePairs.YAHOOPairs;

	OANDAPairs.sort();
	YAHOOPairs.sort();

/**
* transform OANDAPairs into CCY1_CCY2 to be used at OANDA API
*/
	var instrument = "";
	for (var i=0;i<OANDAPairs.length;i++){
			//last pair
		if( i === OANDAPairs.length - 1 ){
				instrument += OANDAPairs[i].substr(0,3) + "_" + OANDAPairs[i].substr(3);
			}else{
				instrument += OANDAPairs[i].substr(0,3) + "_" + OANDAPairs[i].substr(3) + "%2C";
			}	
	}

/**
 * Subscribe to OANDA API
 * limits to only 2 connections per second
 * only able to subscribe to 6 currency
 * sometimes will display ETIMEDOUT error due to the above restrictions
 */
PriceService.prototype.subscribeOANDA = function(){
	var deferred = Q.defer();

// Replace the following variables with your personal ones
// Config file : OANDAConfig.js
	var domain		 = oandaConfig.domain,
		access_token = oandaConfig.access_token,
		account_id 	 = oandaConfig.account_id;
	
// Up to 10 instruments, separated by URL-encoded comma (%2C)
	var https,
		bodyChunk = [];

		if (domain.indexOf("stream-sandbox") > -1) {
			https = require('http');
		} else {
			https = require('https');
		}
	var options = {
	  host: domain,
	  path: '/v1/prices?' + 'instruments=' + instrument,
	  method: 'GET',
	  headers: {"Authorization" : "Bearer " + access_token},
	  pool: {maxSockets: Infinity},
	};

	var req = https.request(options, function(response){
		response.on("data", function(chunk){
			bodyChunk = chunk.toString();
			deferred.resolve(JSON.parse(bodyChunk));
		  	})

		response.on("end",function(chunk){
		 	deferred.resolve();
		})
	
	})

	 req.on('error', function (err) { logger.warn(err);})
	 req.end();
	

	return deferred.promise;

}
	
/**
 * Subscribe to YAHOO API
 * only has up to 4 decimal values
 * prices are less active
 * @param pairs - currency to be subscibed to
 */
PriceService.prototype.subscribeYAHOO = function (pairs){
	var deferred = Q.defer();
	var url = 'https://query.yahooapis.com/v1/public/yql' + 
				'?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22' +
				pairs + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
	var req = request(url, function (error, response, body) {
		if (error) {
			logger.error(error)
		   throw(error)
		}
		if(response !== undefined){
		  if (!error && response.statusCode == 200) {
			  	if(JSON.parse(body).query.count == 0){
						logger.warn("Please specify the currency pairs to be subscribed to.")
						//throw("Please Specify the currency pairs to be subscribed to.")
					}
					deferred.resolve(JSON.parse(body));
				}else{
					deferred.resolve(null);
					}
			}else{
				logger.error(error);
				deferred.resolve(null);
			}
			req.on('error',function(err){
		     	logger.warn("Error connecting to YAHOO HTTP Rates Server");
         		logger.warn("HTTP - " + response.statusCode);
			   })
		})
	req.end();
	return deferred.promise;
}
	
/**
 * API for Seneca Microservice
 * combines all of the sources into an array of myPairs to be populated into the API
 * can be accessed by /api/price/getPrice
 * @param args - undefined
 * @callback myPairss
 */
PriceService.prototype.getPrice = function (args,done){
	
	if(this.subscribeYAHOO != undefined){
		this.subscribeYAHOO(YAHOOPairs).then(function(data){
				if ( data.query != undefined && data.query.count > 0){
					var exoticPrices = data.query.results.rate;
					exoticPrices = transform(exoticPrices);
			}
		})
	}else{
			PriceService.prototype.subscribeYAHOO(YAHOOPairs).then(function(data){
				if ( data.query != undefined && data.query.count > 0){
					var exoticPrices = data.query.results.rate;
					exoticPrices = transform(exoticPrices);
				}
			})
		}
	if (this.subscribeOANDA != undefined){
		this.subscribeOANDA().then(function(data){
			if ( data.prices.length > 0 ){
				var prices = data.prices;
				prices = transform(prices);	
			}
		})
	}else{
		PriceService.prototype.subscribeOANDA().then(function(data){
			if ( data.prices.length > 0 ){
				var prices = data.prices;
				prices = transform(prices);	
			}
		})

	}
		done(null,{data:myPairs});
}
	
/**
 * API for Seneca Microservice
 * combines all of the sources into an array of myPairs to be populated into the API
 * can be accessed by /api/price/getPrice
 */
PriceService.prototype.showPrice = function (args,done){
	
	done(null,{data:myPairs})
}

/**
 * dump price ticks into time series database InfluxDB
 * saves the rate into open, rate, bid, ask
 * @callback  status
 */
PriceService.prototype.persistData = function (args,done){

	var allPairs	 = [],
		livePairs	 = args.data;
	
	for (var i=0;i<livePairs.length;i++)
	{
		// if the price is currently active and live
		if( livePairs[i].status == "active")
			allPairs[allPairs.length] = livePairs[i];		
	}

	var today	 = new Date(),
		points 	 = [];
	//if there is live rates
	//dump into database
	if(allPairs.length > 0){
		if( today.getDay() > 0 && today.getDay() < 6){
			for(var i=0;i<allPairs.length;i++){
	
			// to make sure the data is float type because influxdb can't store int type when the declared is float type
				// known bug
				//190.0000 + 1.90 = 190.00001.90 ( string concatination )
				if(isInteger(parseFloat(allPairs[i].rate)) && parseFloat(allPairs[i].rate) != 0 ){
					allPairs[i].rate = allPairs[i].rate + ("1");
				}	
				if(isInteger(parseFloat(allPairs[i].bid)) && parseFloat(allPairs[i].bid) != 0){
					allPairs[i].bid = allPairs[i].bid + ("1");
				}
				if(isInteger(parseFloat(allPairs[i].ask)) && parseFloat(allPairs[i].ask) != 0){
					allPairs[i].ask = allPairs[i].ask + ("1");
				}
				if(isInteger(parseFloat(allPairs[i].open)) && allPairs[i].open != 0){
					allPairs[i].open = allPairs[i].open + ("1");
				}

			var fields 	= { "bid":parseFloat(allPairs[i].bid),
							"ask":parseFloat(allPairs[i].ask),
							"open":parseFloat(allPairs[i].open),
							"rate":parseFloat(allPairs[i].rate) },
				tags	 	= { name:allPairs[i].id };
				points[i] 	= [fields,tags];
			}
				if(this.insertToDatabase != undefined){
					this.insertToDatabase(points,done);
				}else{
					PriceService.prototype.insertToDatabase(points,done);
					}
			}else{
				done(null,{status:"failed"})
			}
		}else{
			done(null,{status:"failed"})
		}
}

/**
 * Generic insert function for inserting into database
 * @callback  status
 */
PriceService.prototype.insertToDatabase = function(points,done){
			
		dbInflux.writePoints(measurement,points,function(err) {
			  if (err) {
				logger.error("Cannot write data", err);
				done(null,{status:"failed"})
			  }else{
				done(null,{status:"success"})
			}
		})
}

/**
 * Initialise day high and day low 10 from time series database InfluxDB
 * creates and instantiate CurrencyPairs Objects
 * @callback myPairs
 */
PriceService.prototype.initPrice = function (args,done){
	//this keyword for testing purposes
	//sinon stub method
	if(this.query != undefined){
		this.query().then(function(results){
			initialisePairs(results,done);
		})
	}else{
		PriceService.prototype.query().then(function(results){
			initialisePairs(results,done)
		})
	}
}
	
/**
 * Sets the pairs for advance order ( inter app )
 * @callback - undefined
 */
PriceService.prototype.setCurrentPair = function (args,done){
	
	if( args.data != null || args.data != undefined){
		currentPair = args.data;
		done(null,{data:currentPair})
	}else{
		done(null,{data:args.data})
	}
}
	
/**
 * Shows the pairs for advance order
 * accessed by api/price/showCurrentPair
 * @callback currentPair
 */
PriceService.prototype.showCurrentPair = function (args,done){
	done(null,{data:currentPair});
}

/**
 * CurrencyPair tranformation
 * calculates the latestPrice, spread
 * transform into a more detailed JSON object
 * @return myPairs
 */
function transform(allPairs){

	if(allPairs[0].instrument != undefined){
		for(var j=0;j<allPairs.length;j++){
			allPairs[j].instrument = allPairs[j].instrument.substr(0,3) + allPairs[j].instrument.substr(4,7);
		}
		for(var i=0;i<myPairs.length;i++){
			for(var j=0;j<allPairs.length;j++){
				if(	myPairs[i].id == allPairs[j].instrument ) {
					myPairs[i].transform(allPairs[j].instrument,allPairs[j].bid,allPairs[j].ask)
				}
			}	
		}
	}else{
		for(var i=0;i<myPairs.length;i++){
			for(var j=0;j<allPairs.length;j++){
				if (myPairs[i].id == allPairs[j].id){
					myPairs[i].transform(allPairs[j].id,allPairs[j].Bid,allPairs[j].Ask)
				}
			}
		}
	}
	return myPairs;
}
	
/**
 * check if a number is an integer
 * to be used by persistData method 
 * @param x
 * @return boolean 
 */
function isInteger (x) {
	return Math.floor(x) === x; 
}
	
function initialisePairs(results,done){
	var allSubscriptions = [];
	
	for (var i=0;i<OANDAPairs.length;i++){
		allSubscriptions[i] = OANDAPairs[i];
	}
	for(var i=0;i<YAHOOPairs.length;i++){
		allSubscriptions[allSubscriptions.length] = YAHOOPairs[i];
	}
	
	allSubscriptions.sort();
	
	if(results != undefined && results[0].length > 0 ){
		var allPairs = results[0];
			if( !initialised ) {
				for(var j=0;j<allSubscriptions.length;j++){
					for(var i=0;i<allPairs.length;i++){
				if(allSubscriptions[j] == allPairs[i].name){
		myPairs[j] = new CurrencyPair(allPairs[i].name,"",0,0,0,allPairs[i].min,allPairs[i].max,allPairs[i].first,0);
					break;
				}else{
					myPairs[j] = new CurrencyPair(allSubscriptions[j],"",0,0,0,999,0,0,0);
				}
			}

		}
			initialised = true;
			}else{

				for(var j=0;j<myPairs.length;j++){
					for(var i=0;i<allPairs.length;i++){
				if(myPairs[j].id == allPairs[i].name){
					myPairs[j].high = allPairs[i].max;
					myPairs[j].low = allPairs[i].min;
					myPairs[j].open = allPairs[i].first;
						}
					}
				}
			}
		}else{
			for(var j=0;j<allSubscriptions.length;j++){
				myPairs[j] = new CurrencyPair(allSubscriptions[j],"",0,0,0,999,0,0,0);
			}
		}
	
		done(null,{results:myPairs});
}



/**
 * Helper functions for testing purposes
 */
PriceService.prototype.getYahoo = function(){
	return database.getYahoo();
}

PriceService.prototype.getOanda = function(){
	return database.getOanda();
}

PriceService.prototype.getInit = function(){
	return database.getInit();
}

PriceService.prototype.query = function(){
	var deferred = Q.defer();
	
	var query ="select min(rate),max(rate),first(rate) from " + measurement + " where time > now() - 10h group by name";
	dbInflux.query(["mydb"], query, function(err, results){
		if(err) logger.error(err);
			deferred.resolve(results);
	})
	return deferred.promise;
}

}
