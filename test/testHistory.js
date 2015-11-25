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
	//include the HistoryService Class
	HistoryService 	= require('../HistoryService'),
 	chai 			= require("chai"),
	logger			= require("../public/config/logger");
					require("should");

//use the Seneca's method
				
describe('A System with Historical Service', function() {

var expectedDatabase 	= require('./expectedHistoryData.js'),
	expectedDatabase 	= expectedDatabase,
	database  			= new MockDatabase(expectedDatabase),
   	historyService		= new HistoryService(database),
	allTrendData 		= [],
	allOhlcData 		= [];
	
	
beforeEach(function(done){
	  
var queryStub = sinon.stub(historyService,"query",function(args,done){
	//query for OHLC data
	if(args.length>100){
	var results = historyService.getExpectedOhlcData();
		allOhlcData = results;
		done(null,{data:results,query:args})
		return results;
	}else{
	//query for trend data
	var results = historyService.getExpectedTrendData();
		allTrendData = results;
		done(null,{data:results,query:args})
		return results;
		}
	})

	done();
});

	
afterEach(function(done){
    historyService.query.restore();
    done();
});


/*
it('should not display trends as it has not been initialised', function(done){

	historyService.showTrendData("", function(err, results){
		setTimeout(function(){
				expect(results.data).to.eql([]);
				expect(results.data).to.eql(allTrendData);
				done();
		})
	})
});
*/

it('should get trend data from database', function(done){
		var today = new Date(),
		starHour = today.getHours() - 8,
		startMin = (starHour * 60) + today.getMinutes();
		var query = "select first(rate) from prices where time > now() - " + startMin +"m group by time(3m),name"

    historyService.getTrendData("", function(err, results){
		setTimeout(function(){
				expect(results.query).to.eql(query);
				done();
		})
    })
})

it('should show the trend retrieved from database', function(done){

	historyService.showTrendData("", function(err, results){
		setTimeout(function(){
				expect(results.data).to.not.equal([]);
				expect(results.data).to.eql(allTrendData);
				done();
		})
	})
});
	
it('should get OHLC from database', function(done){
    historyService.getOhlcData("", function(err, results){
		setTimeout(function(){
			expect(results.data).to.equal(allOhlcData);
			done();
		})
    })
});
	
it('should show OHLC from database', function(done){
    historyService.showOhlcData("", function(err, results){
		setTimeout(function(){
			expect(results.data).to.equal(allOhlcData);
			done();
		})
    })
});
	
	
})