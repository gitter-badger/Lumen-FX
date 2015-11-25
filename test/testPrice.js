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

var assert  	 	= require('chai').assert,
	expect  	 	= require('chai').expect,
	sinon		 	= require('sinon'),
	MockDatabase	= require('./MockDatabase'),
	//include the PriceService Class
	PriceService 	= require('../PriceService'),
	CurrencyPair  	=  require('../public/js/CurrencyPair'),
    request			= require('request'),
	Q 				= require('q'),
 	chai 			= require("chai"),
	logger			= require("../public/config/logger");
					require("should");

//use the Seneca's method
				
describe('A System with Price Service', function() {
var allSubscriptions 	= ["EURCHF","EURGBP","GBPJPY"];
	allSubscriptions.sort();
	
var d 					= new Date(),
	actualPairs = [{name:"EURCHF"},{name:"EURGBP"}],
	expectedDatabase 	= {init:[{name:"EURCHF",min:1.0555,max:1.1000,first:1.0650,time:d.toISOString()},
							{name:"EURGBP",min:0.7124,max:0.7180,first:0.7144,time:d.toISOString()},
						   	{name:"GBPJPY",min:186.490,max:186.890,first:186.650,time:d.toISOString()},
							{name:"USDHKD",min:7.7555,max:7.8180,first:7.7144,time:d.toISOString()}],
yahoo:{"query":{"count":5,"created":"2015-11-09T13:44:36Z","lang":"en-US","results":{"rate":
[
	{"id":"GBPEUR","Name":"GBP/EUR","Rate":"1.4041","Date":"11/9/2015","Time":"1:44pm","Ask":"1.4042","Bid":"1.4041"},
	{"id":"GBPMYR","Name":"GBP/MYR","Rate":"6.6628","Date":"11/9/2015","Time":"1:44pm","Ask":"6.6989","Bid":"6.6268"},
	{"id":"MYRCHF","Name":"MYR/CHF","Rate":"0.2276","Date":"11/9/2015","Time":"1:44pm","Ask":"0.2289","Bid":"0.2264"},
	{"id":"USDEUR","Name":"USD/EUR","Rate":"0.9307","Date":"11/9/2015","Time":"1:44pm","Ask":"0.9308","Bid":"0.9307"},
	{"id":"USDGBP","Name":"USD/GBP","Rate":"0.6629","Date":"11/9/2015","Time":"1:44pm","Ask":"0.6629","Bid":"0.6629"}
]}}},
oanda: { prices:[ { instrument: 'EUR_CHF',time: '2015-11-09T14:01:26.715643Z',bid: 1.0798,ask: 1.07997 },
				 { instrument: 'EUR_GBP',time: '2015-11-09T14:01:17.243713Z',bid: 0.71186,ask: 0.71201 },
				 { instrument: 'EUR_USD',time: '2015-11-09T14:01:29.700604Z',bid: 1.07415,ask: 1.07429 },
				 { instrument: 'GBP_JPY',time: '2015-11-09T14:01:32.774027Z',bid: 186.378,ask: 186.404 },
				 { instrument: 'USD_HKD',time: '2015-11-09T14:01:21.195629Z',bid: 7.75186,ask: 7.75225 },
				 { instrument: 'USD_JPY',time: '2015-11-09T14:01:30.684283Z',bid: 123.527,ask: 123.541 } ] }
						  },
	myPairs 			= [],
	initialised			= false,
	database  			= new MockDatabase(expectedDatabase),
   	priceService		= new PriceService(database);

  beforeEach(function(done){
	  
var queryStub = sinon.stub(priceService,"query",function(args,done){
	var deferred = Q.defer();
	var results = priceService.getInit();
		deferred.resolve([results]);
		return deferred.promise;
})

var yahooStub = sinon.stub(priceService,"subscribeYAHOO",function(args,callback){
	var deferred = Q.defer();
	var results = priceService.getYahoo();

	deferred.resolve(results);
	return deferred.promise;
})
	
var oandaStub = sinon.stub(priceService,"subscribeOANDA",function(args,callback){
	var deferred = Q.defer();
	var results = priceService.getOanda();

	deferred.resolve(results);
	return deferred.promise;
})

var persistStub = sinon.stub(priceService,"insertToDatabase",function(args,callback){
	
		callback(null,{data:args})
})

	done();

});
	
  afterEach(function(done){
    priceService.query.restore();
    priceService.subscribeYAHOO.restore();
    priceService.subscribeOANDA.restore();
    priceService.insertToDatabase.restore();  
    done();
  });

it('should prompt error when price has not been initialised', function(done){
    priceService.showPrice("", function(err, results){
		setTimeout(function(){
				logger.warn("results.length = " + results.data.length )
				expect(results.data).to.eql([]);
			done();
		})
    }); 
});

it('should initialise day high and day low from database', function(done){

	priceService.initPrice(actualPairs, function(err, results){
		setTimeout(function(){
			results = results.results;
			results.forEach(function(result){
				logger.info( result.id + " initialised" )
				expect(result).to.be.an.instanceof(CurrencyPair);
			})
			done();
		})
	})
});
	
it('prices have been initialised but not yet subscribed to live prices', function(done){
    priceService.showPrice("", function(err, results){
		setTimeout(function(){
			results.data.forEach(function(result){
			expect(result.status).to.equal("inactive");
			})
			done();
		})
    }); 
});

it('should retrieve price from external sources', function(done){
    priceService.getPrice(actualPairs, function(err, results){
		setTimeout(function(){
			results.data.forEach(function(result){
				if(result.status == "active"){
					expect(result).to.be.an.instanceof(CurrencyPair);
					expect(result.rate).not.equal(0);
					logger.info( result.name + " subscribed" )
				}else
					logger.warn ( result.id + " not subscribed")
			})
			done();
		})
	}); 
});

it('should show the live prices from all sources', function(done){
    priceService.showPrice("", function(err, results){
		setTimeout(function(){
			myPairs = results.data;
			results.data.forEach(function(result){
				if(result.status == "active")
				expect(result.status).to.equal("active");
				else
				logger.warn ( result.id + " inactive")
			})
			done();
		})
    }); 
});

it('should persist active prices into database', function(done){
	var livePairsCounter = 0;
		priceService.persistData({data:myPairs},function(err,results){
			myPairs.forEach(function(result){
				if(result.status == "active")
					livePairsCounter++;
			})
			expect(livePairsCounter).to.equal(results.data.length)
			done();
		})
});
	
it('should set current pair for interApp window', function(done){
	var currentPair = myPairs[0];
		priceService.setCurrentPair({data:currentPair},function(err,result){
			expect(result.data).to.eql(currentPair)
			done();
		})
});
	
it('should prompt error if current pair for interApp window is null ', function(done){
	var currentPair = null;
		priceService.setCurrentPair({data:currentPair},function(err,result){
			expect(result.data).to.eql(currentPair)
			done();
		})
});
	
it('should prompt error if current pair for interApp window is  undefined', function(done){
	var currentPair = undefined;
		priceService.setCurrentPair({data:currentPair},function(err,result){
			expect(result.data).to.eql(currentPair)
			done();
		})
});
	
it('should get the current pair for interApp window', function(done){
	var currentPair = myPairs[0];
		priceService.showCurrentPair({},function(err,result){
			expect(result.data).to.eql(currentPair)
			done();
		})
});

	
})