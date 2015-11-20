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

var assert 			= require('chai').assert,
	expect 	 		= require('chai').expect,
	Q 				= require('q'),
	nano 			= require("nano")("http://localhost:5984"),
	traderinfodb 	= nano.db.use("traderinfodb"),
	PRIVATEKEY		= require('../public/config/commonVar').key,
	CryptoJS		= require('crypto-js'),
	logger	 		= require("../public/config/logger"),
	seneca 			= require('seneca')( { timeout:99999 } );
					  require("should");
	seneca
		.use('../Login')

var existingUser = {	"_id": "8642c68e25b4cf20a459d19186281be1",
					    "_rev": "538-af264a802c85f2aad0677e7d8792bc97",
					    "firstname": "nicholas",
					    "lastname": "chan",
					    "email": "nicholas@me.com",
					    "username": "nicholas",
					    "pairName": [
						   "EURCHF",
						   "EURGBP",
						   "EURUSD",
						   "GBPJPY",
						   "GBPMYR",
						   "MYRCHF",
						   "USDEUR",
						   "USDGBP",
						   "USDHKD",
						   "USDJPY"
	],
					    "tradingLimits": [
								   {
									   "name": "GBP",
									   "limit": 32322303
								   },
								   {
									   "name": "USD",
									   "limit": 22400000
								   },
								   {
									   "name": "EUR",
									   "limit": 9119999
								   },
								   {
									   "name": "MYR",
									   "limit": 5523235
								   }
								]
					},
encryptedPassword = CryptoJS.AES.encrypt("password", "TCS"),
newUser			 = { username:"demo1",password:encryptedPassword.toString(),
					email:"demo1@me.com",firstname:"demo",lastname:"demo" },
traderID 		 = "demo",
tradingLimits	 = [	{name:"GBP",limit:2000000},
						{name:"USD",limit:3000000},
						{name:"EUR",limit:4000000},
					{name:"MYR",limit:1000000}		],
pairs 			 = [{id:"EURGBP",show:true},
					{id:"MYRCHF",show:true},
					{id:"USDEUR",show:false}];

describe('Login', function () {
 
describe('registerTrader()', function () {
    it('should correctly register a new trader into database', function (done) {
		seneca.act({role:'accountAPI', cmd:'registerTrader',
					data:newUser},function(args,cb){
			try{
				assert.equal("A new user has been inserted into the system.",cb.status)
			done()
			}catch(err){
				logger.warn("Username existed, Please try using other usernames.")
				done(err);
				
			}
		})
    })
	
	it('should display error as username has been taken', function (done) {
		seneca.act({role:'accountAPI', cmd:'registerTrader',
					data:existingUser},function(args,cb){
				assert.equal("username existed,Please try using other usernames.",cb.status)
				done()
		})
    })
  })

describe('getCurrentTrader() & setTradingLimits()', function () {
	var currentUser;
    it('should correctly get trader profile whom is currently logged in', function (done) {
		seneca.act({role:'accountAPI', cmd:'getCurrentTrader',
					username:traderID,privateKey:PRIVATEKEY},function(args,cb){
				assert.equal(traderID,cb.data.username)
				currentUser = cb.data;
				done()
		})
    })

	it('should correctly set trader limits', function (done) {
		seneca.act({role:'accountAPI', cmd:'setTradingLimits',
					limits:tradingLimits,trader:currentUser},function(args,cb){
			expect(tradingLimits).to.eql(cb.data.tradingLimits)
				done()
		})
    })

})

setTimeout(function(){
describe('setLocalPairs()', function () {
	
	var currentUser;
    it('should correctly set trader\'s saved currency pairs to display', function (done) {
		seneca.act({role:'accountAPI', cmd:'getCurrentTrader',
					username:traderID,privateKey:PRIVATEKEY},function(args,cb){
					currentUser = cb.data;
			
		seneca.act({role:'accountAPI', cmd:'setLocalPairs',
					data:pairs,trader:currentUser},function(args,cb){
			
				var showPairs = [];
				pairs.forEach(function(doc){
					if(doc.show != false)
						showPairs.push(doc.id);
				})

				assert.equal(showPairs.length,cb.data.pairName.length)
				done()
			})
    	})
			
    })
	
})
},200)

})