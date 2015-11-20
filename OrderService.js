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
"use strict";
module.exports = function OrderService(database) {
var	request 	= require('request'),
	Q 			= require('q'),
	_			= require('lodash'),
	nano 		= require('nano')('http://localhost:5984'),
	url			= 'http://localhost:3000/triggerUpdate',
	availablePairs	= require('./public/config/currencySubscriptions'),
	orderDB 	= nano.db.use('orders'),
	logger 		= require('./public/config/logger'),
	common 		= require('./public/config/commonVar'),
	PRIVATEKEY	= common.key,
	dir 		= common.dir,
	type 		= common.type,
	status 		= common.status,
	currentPair ;
	
	
/**
* get all orders from a perticular trader
* to be displayed on the table and order chart
*/
OrderService.prototype.getMyOrders = function(args,done){
	var username = args.username,
		privateKey = args.privateKey,
		myOrders = [];
	
	if( this.retrieveFromDatabase != undefined){
		this.retrieveFromDatabase('myOrders','viewMyOrders',username).then(function(results){
					if ( results.rows.length > 0 ){
						results.rows.forEach(function(doc){
							myOrders.push(doc.value);
						})
					}
					done(null,{data:myOrders})
			}).catch(function(err){
				logger.warn(err);
				done(err);
			})
	}		
	else{
	if(privateKey == PRIVATEKEY){
		OrderService.prototype.retrieveFromDatabase('myOrders','viewMyOrders',username)
				.then(function(results){
					if ( results.rows.length > 0 ){
							results.rows.forEach(function(doc){
								myOrders.push(doc.value);
							})
						}
						done(null,{data:myOrders})
				})
		}else{
			done(null,{"data":"you are not allowed to view this page."})
		}
	}
}

/**
* Retrieves the existing orders from couchDB
* @param args - orderObj
* @return promise
*/
OrderService.prototype.retrieveOppositeOrders = function(args){
	var deferred = Q.defer(),
		allOrders = [],
		orderObj = args,
		side;
	if(orderObj !== undefined){
		if(orderObj.dir == dir[1]){
			side = dir[0];
		}else{
			side = dir[1];
		}
	OrderService.prototype.retrieveFromDatabase('allOrders','viewAllOrders',[orderObj.name,side])
							.then(function(results){
							deferred.resolve(results.rows);
						}).catch(function(err){
							console.log(err);
					})
				return deferred.promise;
		
	}
}

/**
* Inserts a new order into database
* @param args - order Object
* @callback promise
*/
OrderService.prototype.insertOrder = function(args,done){
	var orderObj = args.data;
	try{
		orderDB.insert(orderObj,function(err,res){
				orderDB.get(res.id, function (err, res) {
						OrderService.prototype.matchOrders(res);
					})
		})
	}catch(err){
		logger.error(err);
	}
	done()
}

/**
* Retrieves the latest order with latest ._revision from couchDB
* @param currentOrder -  current order object
* @return promise
*/
OrderService.prototype.getLatestOrder = function(currentOrder){
	var deferred = Q.defer();
	try{
		orderDB.get(currentOrder, function (err, existing) {
			if(!err){
				deferred.resolve(existing);
			}else{
				logger.warn(err);
				}
		})
	}catch(err){
		logger.error(err);
	}finally {
       return deferred.promise;
    }
}

/**
* Triggers custom orders when the prices hits the stop or limit rate.
* @param args -  curreny currency pair  & existing custom orders
* @callback status
*/
OrderService.prototype.executeCustomOrders = function(args,done){
	var currentPrice 	= args.data[0],
		pendingOrders	= args.data[1],
		customOrder	 	= [];
	
	pendingOrders.forEach(function(doc){
		customOrder.push(doc);
	})
	 
	for(var j=0;j<customOrder.length;j++){
		for(var i=0;i<currentPrice.length;i++){
			if (customOrder[j].name == currentPrice[i].id && customOrder[j].type == type[1]){
					if(customOrder[j].dir == dir[0] &&  currentPrice[i].ask <= customOrder[j].rate ){
						customOrder[j].status = status[0];
						OrderService.prototype.insertCustomOrder(customOrder[j]);
					}
					else if(customOrder[j].dir == dir[1] && currentPrice[i].bid >= customOrder[j].rate ){
						customOrder[j].status = status[0];
							OrderService.prototype.insertCustomOrder(customOrder[j]);
			}
		}else{
			if (customOrder[j].name == currentPrice[i].id  && customOrder[j].type == type[2]){
					if(customOrder[j].dir == dir[0] &&  currentPrice[i].ask >= customOrder[j].rate ){
						customOrder[j].status = status[0];
							OrderService.prototype.insertCustomOrder(customOrder[j]);
					}
						else if(customOrder[j].dir == dir[1] && currentPrice[i].bid <= customOrder[j].rate ){
							customOrder[j].status = status[0];
							OrderService.prototype.insertCustomOrder(customOrder[j]);
					}
				}
			}
		}
	}
	done()
}

/**
* insertCustomerOrder into Database
* helper function
*/
OrderService.prototype.insertCustomOrder = function(customOrder,done){
	try{
		orderDB.insert(customOrder,customOrder._id,function(err,res){
				if(!err){
					orderDB.get(res.id, function (err, res) {
						OrderService.prototype.matchOrders(res);
					})
				}
			if(done != undefined)
				done(res);
		})
	}catch(err){
		logger.error(err);
	}
}

/**
* Match existing orders with current order
* Executes the orders and updates to the database
* @param customObj 
*/
OrderService.prototype.matchOrders = function(customObj){
 var  orderObj ;

   OrderService.prototype.getLatestOrder(customObj._id).then(function(results){
	   orderObj = results;

	   if(orderObj.executions == undefined)
	   		orderObj.executions = [];
	   		OrderService.prototype.matchingAlgorithm(orderObj);
	  })
}
	
/**
* Order matching for a currency pair
*/
OrderService.prototype.matchingAlgorithm = function(orderObj){
var tradeObj ;
	
 OrderService.prototype.retrieveOppositeOrders(orderObj).then(function(existingOrders){
		  for(var i=0;i<existingOrders.length;i++){
			  existingOrders[i] = existingOrders[i].value;
		   if(existingOrders[i].executions == undefined)
	   		  existingOrders[i].executions = [];
			  }
for(var i=0;i<existingOrders.length;i++){
if(orderObj.remaining >= 0 && existingOrders[i].status == status[0] && 
   orderObj.status == status[0] && orderObj.dir != existingOrders[i].dir && orderObj.name == existingOrders[i].name){
		tradeObj = {};
	
				//latest - oldest
				var remaining = orderObj.remaining - existingOrders[i].remaining;

				if( remaining > 0 ){
					tradeObj.quantityFilled = existingOrders[i].remaining;
					orderObj.remaining = Math.abs(remaining);
					
					existingOrders[i].remaining = 0;
					existingOrders[i].status = status[1]; 
				}
				else if (remaining < 0 ){
					tradeObj.quantityFilled = orderObj.remaining;
					existingOrders[i].remaining = Math.abs(remaining);	
					
					orderObj.remaining = 0;
					orderObj.status = status[1];				
				}
				else{
					tradeObj.quantityFilled = orderObj.amount;
					existingOrders[i].remaining = remaining;
					existingOrders[i].status = status[1];
					
					orderObj.remaining = remaining;
					orderObj.status = status[1];
				}
	
				tradeObj.executionTime = new Date();
				tradeObj.executedPrice = parseFloat(orderObj.rate);
				tradeObj.tradedFrom = existingOrders[i].trader;
				tradeObj.tradedWith  = orderObj.trader;
	
				orderObj.executions.push(tradeObj);
				existingOrders[i].executions.push(tradeObj);
	
			orderDB.insert(existingOrders[i],existingOrders[i]._id,function(err,res){
				if(!err){
					if(tradeObj.tradedFrom != tradeObj.tradedWith)
						var req = request.post(url,{form:{data:tradeObj}});
				}
			})
			
			}
		}
	  if(orderObj.executions.length != 0){
		  try{
			orderDB.insert(orderObj,orderObj._id,function(err,res){
				if(err){
					logger.warn(err);
					}
			})
		  }catch(err){
			  logger.error(err);
		  		}
			}

 })
}
	
/**
* calculate trader's profit and loss based on executions from the beginning of time
* returns the p&l value to API 
*/
OrderService.prototype.calculateProfitLoss = function(args,done){
	
	var username	= args.username;

	if(this.retrieveFromDatabase != undefined){
		this.retrieveFromDatabase('myOrders','viewMyOrders',username).then(function(res){
			profitLossAlgorithm(res,done);
		}).catch(function(err){
			logger.error(err);
			done(err);
		})
	}else{
		OrderService.prototype.retrieveFromDatabase('myOrders','viewMyOrders',username).then(function(res){
			profitLossAlgorithm(res,done);
		}).catch(function(err){
			logger.error(err);
			done(err);
		})
	}
}

function profitLossAlgorithm(res,done){
var		myProfit 			= [],
		sellProfit 			= [],
		buyProfit 			= [],
		allBuyExecutions	= [],
		allSellExecutions	= [],
		sellExecuted		= [],
		buyExecuted 		= [];

		res.rows.forEach(function(doc){
			if(doc.value.executions != undefined){
				if(doc.value.dir == dir[0]){
					allBuyExecutions.push(doc.value);
				}else{
					allSellExecutions.push(doc.value);
				}
			}
		})
				
	 for(var i=0;i<allSellExecutions.length;i++){
		for(var j=0;j<allSellExecutions[i].executions.length;j++){
		var profits = {};
		profits.name = allSellExecutions[i].name;
		profits.dir = allSellExecutions[i].dir;
		profits.status = "";
		sellExecuted[j] = allSellExecutions[i].executions[j];
		profits.rate = parseFloat(sellExecuted[j].executedPrice) ;
		profits.quantity = parseFloat(sellExecuted[j].quantityFilled);
		profits.fees = profits.rate * profits.quantity * 0.02;
			sellProfit.push(profits);
		}
	}
		
	 for(var i=0;i<allBuyExecutions.length;i++){
		for(var j=0;j<allBuyExecutions[i].executions.length;j++){	
		var profits = {};	
		profits.name = allBuyExecutions[i].name;
		profits.dir = allBuyExecutions[i].dir;
		profits.status = "";
		buyExecuted[j] = allBuyExecutions[i].executions[j];
		profits.rate = parseFloat(buyExecuted[j].executedPrice) ;
		profits.quantity = parseFloat(buyExecuted[j].quantityFilled);
		profits.fees = profits.rate * profits.quantity * 0.02;
			buyProfit.push(profits);
		}
	}				
					
	for(var i=0;i<buyProfit.length;i++){
		for(var j=0;j<sellProfit.length;j++){
			if( buyProfit[i].name == sellProfit[j].name )
				if(buyProfit[i].status != "calculated" && sellProfit[j].status != "calculated")
			{
				profits = {};
				buyProfit[i].status = "calculated";
				sellProfit[j].status = "calculated";
				profits.name = buyProfit[i].name;
				if(buyProfit[i].quantity > sellProfit[j].quantity){
					profits.profit = ( sellProfit[j].rate - buyProfit[i].rate ) * sellProfit[j].quantity ;
				}else{
					profits.profit = ( sellProfit[j].rate - buyProfit[i].rate ) * buyProfit[i].quantity ;
				}
				//impose transcation fees on each transaction made
				//profits.profit = profits.profit - sellProfit[j].fees - buyProfit[i].fees;
				myProfit.push(profits);
			}
		}
	}
		var allPairs = [];
			allPairs = _.uniq(myProfit,"name");
			allPairs = _.sortByAll(allPairs,"name");
		
		var netProfit = [];
			for (var i=0;i<allPairs.length;i++){
				netProfit[i] = { name: allPairs[i].name, amount:0};
				}
				for(var i=0;i<myProfit.length;i++){
					for (var j=0;j<netProfit.length;j++){
						if(netProfit[j].name == myProfit[i].name){
							netProfit[j].amount += parseFloat((myProfit[i].profit).toFixed(2));	
						}
					}	
				}
			done(null,{profit:netProfit})
}

/**
* Retrieves a trader's exposure from database
* @param args - trader
* @callback myExposures
*/
OrderService.prototype.getMyExposures = function(args,done){
	var netExposures	,
		myExposures = [],
		username 	= args.username,
		privateKey = args.privateKey;

	if ( this.retrieveFromDatabase != undefined ){
		this.retrieveFromDatabase('myExposures','viewMyExposures',[username,status[1]]).then(function(res){
					res.rows.forEach(function(doc){
						myExposures.push(doc.value);
					})
			netExposures = OrderService.prototype.calculateExposures(myExposures);
			done(null,{name:username,data:netExposures})	
		}).catch(function(err){
			console.log(err);
			done();
		})
	}else{
	if( username != undefined && privateKey == PRIVATEKEY){
	OrderService.prototype.retrieveFromDatabase('myExposures','viewMyExposures',[username,status[1]])
									.then(function(res){
										res.rows.forEach(function(doc){
											myExposures.push(doc.value);
										})
		OrderService.prototype.retrieveFromDatabase('myExposures','viewMyExposures',[username,status[0]])
									.then(function(res){
									res.rows.forEach(function(doc){
										myExposures.push(doc.value);
									})
			netExposures = OrderService.prototype.calculateExposures(myExposures);
		
				done(null,{name:username,data:netExposures})	
					})
			})
		}else{
			done(null,{data:"you are not allowed to view this page."})
		}
	}
}
	
/**
* calculates user's exposures and display it on API
*/
OrderService.prototype.calculateExposures = function(args){
	var netExposures = [],
		ccy = ["GBP","USD","EUR","MYR"];
	
	//initialisation
	for (var i=0;i<ccy.length;i++){
		netExposures[i] = {name: ccy[i],amount:0};
	}
	for(var i=0;i<args.length;i++){
			if( args[i].amount != args[i].remaining){
				if (args[i].dir == dir[1]){
					args[i].amount *= -1;
					args[i].remaining *= -1;
					}
		}
	}
	
	for(var i=0;i<args.length;i++){
		switch(args[i].name.substr(0,3)){	
			case "GBP":
			netExposures[0].amount += parseFloat(args[i].amount) - parseFloat(args[i].remaining);
					break;

			case "USD":
			netExposures[1].amount += parseFloat(args[i].amount) - parseFloat(args[i].remaining);
					break;

			case "EUR":
			netExposures[2].amount += parseFloat(args[i].amount) - parseFloat(args[i].remaining);
					break;

			case "MYR":
			netExposures[3].amount += parseFloat(args[i].amount) - parseFloat(args[i].remaining);
					break;
					}
				}
	return netExposures;
}
	
/**
* gets all pending customOrders to be triggered into open orders
*/
OrderService.prototype.getCustomOrders = function(args,done){
	var customOrders = [];

	if(this.retrieveFromDatabase != undefined){
		this.retrieveFromDatabase('allCustomOrders','viewAllCustomOrders','pending').then(function(res){
						res.rows.forEach(function(doc){
								customOrders.push(doc.value);
							})
					done(null,{customOrders:customOrders})
				})
	}else{
	OrderService.prototype.retrieveFromDatabase('allCustomOrders','viewAllCustomOrders','pending')
						.then(function(res){
							res.rows.forEach(function(doc){
									customOrders.push(doc.value);
							})
				done(null,{customOrders:customOrders})
			})
		}
}

/**
* checks the order's amount with trader's trading limits
* if overlimit, order will be rejected
*/
OrderService.prototype.checkTradingLimits = function(args,done){
	
	var trader = args.trader,
		orderObj = args.data;

	for(var i=0;i<trader.tradingLimits.length;i++){
		if(orderObj.name.substr(0,3) == trader.tradingLimits[i].name)
				if(orderObj.amount > trader.tradingLimits[i].limit)
						orderObj.status = status[2];
	}
	done(null,{data:orderObj})
}

OrderService.prototype.retrieveFromDatabase = function(viewName,DesignName,data){
	var deferred = Q.defer();
		try{
		orderDB.view(viewName,DesignName,
						  {key:data},function(err,body){
				if(!err){
					deferred.resolve(body);
				}else{
					console.log(err);
					deferred.resolve(null);
				}
			})
		}catch(err){
			logger.error(err);
		}
		return deferred.promise;
}

OrderService.prototype.getMyOrdersMock = function(args,done){
	return database.getMyOrdersMock();
}

/**
* Sets the pairs for advance order ( inter app )
* @callback - undefined
*/
OrderService.prototype.setCurrentPair = function (args,done){
	currentPair = args.data;
	done();
}
	
/**
* Shows the pairs for table page
* accessed by api/order/showCurrentPair
* @callback currentPair
*/
OrderService.prototype.showCurrentPair = function (args,done){
	done(null,{data:currentPair});
}

OrderService.prototype.showAvailablePairs = function(args,done){
	done(null,{data:availablePairs.pairs()})
}

}