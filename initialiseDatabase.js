/**
 *	<LumenFX: An FX system designed and built by thecitysecret>
 *  Copyright (C) 2015 thecitysecret
 *
 *	This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

module.exports = function(options) {
var seneca 		= this,
	nano 		= require('nano')('http://localhost:5984'),
	orderDB 	= nano.db.use('orders');
	
	this.add({role:'orderAPI', cmd:'initialiseDB'},initialiseDB)
/**
* Creates the design views for couchDB
* @callback status
*/
function initialiseDB(args,done){
	
	nano.db.create('orders', function() {
	 	orderDB = nano.db.use('orders');
			
	orderDB.insert(
		{ "views": 
		{ "viewMyOrders": 
		  { "map": function(doc) { emit(doc.trader, doc); } } 
		}
		}, '_design/myOrders', function (error, response) {
		console.log("_design/myOrders created");
		});
			
	orderDB.insert(
		{ "views": 
		{ "viewMyExposures": 
		  { "map": function(doc) { emit([doc.trader,doc.status], doc); } } 
		}
		}, '_design/myExposures', function (error, response) {
		console.log("_design/myExposures created");
		});
			
	orderDB.insert(
		{ "views": 
		{ "viewAllOrders": 
		  { "map": function(doc) { emit([doc.name,doc.dir], doc); } } 
		}
		}, '_design/allOrders', function (error, response) {
		console.log("_design/allOrders created");
		});
			
		
	orderDB.insert(
		{ "views": 
		{ "viewAllCustomOrders": 
		  { "map": function(doc) { emit(doc.status, doc); } } 
		}
		}, '_design/allCustomOrders', function (error, response) {
		console.log("_design/allCustomOrders created");
		});
			
	})
	
	nano.db.create('traderinfodb',function(){
		var traderInfoDB = nano.db.use('traderinfodb');
		
		traderInfoDB.insert(
			{ "views": 
			{ "viewAllTrader": 
				{ "map": function(doc) { emit(doc.username, doc); } }
			}
			}, '_design/allTrader',function(error, response) {
				console.log("_design/allTrader created");
			});
		
		traderInfoDB.insert(
			{ "views": 
			{ "viewTrader": 
				{ "map": function(doc) { emit(doc.username, {_id:doc._id,username:doc.username,
															 pairName:doc.pairName,
															 tradingLimits:doc.tradingLimits}); } }
			}
			}, '_design/getTrader',function(error, response) {
				console.log("_design/getTrader created");
			});
	
	done(null,{status:"database initialised"});
	})
	
}
	
}