'use strict';

/** @constructor */
module.exports = function MockDatabase(database) { 
	
	var users = [],
		counter = 0;
	
	if(database.length > 0 )
	database.forEach(function(doc){
		users.push({username:doc.username,password:doc.password})
	})

	this.getAllData = function(){
		return users;
	},
	this.getInit = function(){
		return database.init;
	},
	
	this.getYahoo = function(){
		return database.yahoo;
	},
		
	this.getOanda = function(){
		return database.oanda;
	},
		
	this.getTrendData = function(){
		return database.trend;
	},
		
	this.getAllOhlcData = function(){
		return database.history;
	},	
	this.getAllOrders = function(){
		return database.orders;
	},
		
	this.getMyOrdersMock = function(){
		return database;
	}
	
	
}	