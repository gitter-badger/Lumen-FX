/**
<LumenFX: An FX system designed and built by thecitysecret>
    Copyright (C) 2015 thecitysecret

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var assert   = require('chai').assert,
	expect 	 = require('chai').expect,
	influx	 = require('influx'),
	request  = require('request'),
	dbConfig = require('../public/config/InfluxDBConfig'),
	availablePairs	= require('../public/config/currencySubscriptions'),
	CurrencyPair = require('../public/js/CurrencyPair'),
	oandaConfig	= require('../public/config/OANDAConfig'),
	dbInflux = influx(dbConfig),
	logger	 = require("../public/config/logger");
	Q		 = require('q'),
	seneca 	 = require('seneca')( { timeout:99999 } ),
	allPairs = availablePairs.pairs();

require("should")
seneca
    .use('../Price')

describe('Price', function() {

	describe('initPrice()', function() {
		it('should initialised price from InfluxDB', function(done) {
			seneca.act({role:'priceAPI', cmd:'initPrice'},function(args,cb){
				cb.results.forEach(function(result){
					expect(result).to.be.an.instanceof(CurrencyPair)
				})
				done();
			})
		})
	})
	
	describe('showPrice()', function() {
		it('should not show prices when it is not subscribed to API', function(done) {
			seneca.act({role:'priceAPI', cmd:'showPrice'},function(args,cb){
				cb.data.forEach(function(result){
					expect(result.status).to.equal("inactive");
				})
				done();
			})
		})
	})

	describe('getPrice() & showPrice()', function() {
		var counter = 0;

		it('should subscribe prices from multiple sources', function(done) {
			seneca.act({role:'priceAPI', cmd:'getPrice'},function(args,cb){
				setTimeout(function(){
				cb.data.forEach(function(result){
					if(result.status == "active"){
					expect(result.status).to.equal("active");
					counter++;
					}
				})
				if(counter != allPairs.length)
					logger.warn(counter + " currency pairs subscribed out of " + allPairs.length);
				done();
				},600)
			})
		})
		
		it('should show prices when it has subscribed to API', function(done) {
			seneca.act({role:'priceAPI', cmd:'showPrice'},function(args,cb){
			try{
				if(counter == allPairs.length)
					cb.data.forEach(function(result){
						expect(result.status).to.equal("active");
					})
					done();
			}catch(err){
				logger.warn(err);
				done(err);
			}
			})
		})
	})
/*
	describe('persistData()', function() {
		it('should persist price into InfluxDB', function(done) {
		seneca.act({role:'priceAPI', cmd:'persistData',
					data:[{name:"AAABBB",bid:1.1111,ask:1.2222,rate:1.1221,
					  		status:"active",id:"AAABBB",open:1.1211} ]},
								function(args,cb){
				assert.equal("success",cb.status)
				done();
			})
		})
	})
	*/

})