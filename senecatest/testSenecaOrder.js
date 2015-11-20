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
	nano	 = require('nano')('http://localhost:5984'),
	expect 	 = require('chai').expect,
  	logger	 = require("../public/config/logger"),
	request  = require('request'),
	orderDB	 = nano.db.use('orders'),
	PRIVATEKEY		= require('../public/config/commonVar').key,
	Q		 = require('q'),
	seneca 	 = require('seneca')({timeout:99999});
			   require("should");
seneca
    .use('../Order')

describe('Order Microservice', function () {

	describe('seneca.act({role:"orderAPI",cmd:"getMyOrders"})', function () {
		
		it('should correctly get my orders from database', function (done) {
			seneca.act({role:"orderAPI",cmd:"getMyOrders",username:"nicholas",privateKey:PRIVATEKEY},function(args,cb){
				try{
				expect(cb.data.length).to.not.equal(0);
				done();
				}catch(err){
					logger.error(err);
					done(err);
				}
				})
		})
		
		it('should not display any orders if trader was not found in system', function (done) {
			seneca.act({role:"orderAPI",cmd:"getMyOrders",username:"null",privateKey:PRIVATEKEY},function(args,cb){
				assert.equal(0,cb.data.length);
				done();
				})
			})
	  })

	describe('seneca.act({role:"orderAPI",cmd:"getMyExposures"})', function () {
		it('should correctly get my exposures from database', function (done) {
			seneca.act({role:"orderAPI",cmd:"getMyExposures",username:"nicholas",privateKey:PRIVATEKEY},function(args,cb){
				assert.notEqual({},cb);
				done();
				})
		})
	  })

	describe('seneca.act({role:"orderAPI",cmd:"getCustomOrders"})', function () {
		it('should get custom Order', function(done){
				seneca.act({role:"orderAPI",cmd:"getCustomOrders"},function(err, results){
					setTimeout(function(){
						results.customOrders.forEach(function(result){
							expect(result.type).to.not.equal("market");
						})
						done();
					})
				})
		})
	})

	describe('seneca.act({role:"orderAPI",cmd:"calculateProfitLoss"})', function () {
		it('should calculate profit and loss', function(done){
			seneca.act({role:"orderAPI",cmd:"calculateProfitLoss",username:"nicholas"}, function(err, results){
				setTimeout(function(){
					if(err) logger.error(err);
					results.profit.forEach(function(result){
						expect(result.amount).to.exist;
						expect(result.name).to.exist;
					})
					done();
				})
			})
		})
	})
	
})


