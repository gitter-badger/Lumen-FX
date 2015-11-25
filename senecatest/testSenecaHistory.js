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

var assert 		= require('chai').assert,
	influx 		= require('influx'),
	dbConfig 	= require('../public/config/InfluxDBConfig'),
	dbInflux 	= influx(dbConfig),
	Q 			= require('q'),
	seneca 		= require('seneca')( { timeout:99999 } );
			      require("should")
seneca
    .use('../History')

describe('Historical', function () {
  
describe('getTrendData()', function () {

    it('should correctly get trend data from influx database', function (done) {
		seneca.act({role:'historyAPI', cmd:'getTrendData'},function(args,cb){
				assert.equal(11,cb.data.length)
			done();
		})
    })
})
	
describe('getOhlcData()', function () {
	it('should correctly get data for OHLC chart from influx database', function (done) {
		seneca.act({role:'historyAPI', cmd:'getOhlcData',name:"GBPJPY"},function(args,cb){
			var test = cb.ohlc;
				assert.equal("GBPJPY",test[0].name)
				done();
		})
	})	
})


})
