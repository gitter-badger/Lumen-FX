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
