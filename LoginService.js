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

module.exports = function LoginService(database){
"use strict";
var nano 			= require("nano")("http://localhost:5984"),
	traderinfodb	= nano.db.use("traderinfodb"),
	Q 				= require('q'),
	sinon		 	= require('sinon'),
	PRIVATEKEY		= require('./public/config/commonVar').key,
	logger	 		= require('./public/config/logger'),
	userInstance,
	currentTrader	= {};
	
LoginService.prototype.insertToDatabase = function (data,done){
var payload;
	//if existed, update to the database
	if(data._id != undefined){
		traderinfodb.insert(data,data._id,function(err, body) {
				if(!err){
					payload = (true);
				}else{
					payload = (false);
					throw(err);
				}
			})
		//else, create a new record in database
		}else{
		traderinfodb.insert(data,function(err, body) {
			if(!err){
				payload = (true);
			}else{
				payload = (false);
				throw(err);
			}	
		})
	}
		return payload;
		done(null,data);
}

/*LoginService.prototype*
* checks the database with account details to see if there is a existing user in the system
* returns the promise containing the data of existing users if found.
*/
LoginService.prototype.validateExistingTrader = function(user){
	var username = user.username;
	var deferred = Q.defer();
	
	 LoginService.prototype.retrieveFromDatabase('allTrader','viewAllTrader',username).then(function(results){
		if (results.rows.length > 0 ){
			deferred.resolve({status:false});
		}else{
			deferred.resolve({status:true});
			}	
		})
	return deferred.promise;
}

/**
* sets the default limit to 1,000,000
* registers the new account into database 
*/
LoginService.prototype.registerTrader = function(args,cb){
	var user = args.data;
	var ccy = ["EUR","USD","MYR","GBP"];
		ccy.sort();
	var limits = [];
		ccy.forEach(function(doc){
			limits.push({name:doc,limit:1000000})
		})
			user.tradingLimits = limits;
	
	if (this.validateExistingTrader != undefined){
		this.validateExistingTrader(user).then(function(results){
		if(results.status == true){
			if(results.obj != undefined)
				results.obj.insertToDatabase(user,cb);
			}else if(results.status == false){
				cb(null,{status:"username existed,Please try using other usernames."})
			}else{
				cb(null,null)
			}

			})
		}else{
			LoginService.prototype.validateExistingTrader(user).then(function(results){

				if(results.status == true){
						if(results.obj != undefined)
							results.obj.insertToDatabase(user,cb);
						else
						LoginService.prototype.insertToDatabase(user,cb);
					cb(null,{status:"A new user has been inserted into the system."})
				}else if(results.status == false){
					cb(null,{status:"username existed,Please try using other usernames."})
				}else{
					cb(null,null)
				}
			})
		}
}

LoginService.prototype.retrieveFromDatabase = function(viewName,DesignName,data){
		var deferred = Q.defer();

	traderinfodb.view(viewName,DesignName,
					  {key:data},function(err,body){
			if(!err)
				deferred.resolve(body);
			else
				throw(err)
	})
	return deferred.promise;
}

LoginService.prototype.getCurrentTrader = function(args,done){
	
	var privateKey = args.privateKey;
	var username = args.username;
	var myTrader;
	try{
		if(username != undefined  && username != "undefined" && privateKey == PRIVATEKEY){
		LoginService.prototype.retrieveFromDatabase('allTrader','viewAllTrader',username).then(function(results){
			if ( results.rows.length > 0 ){
					myTrader = results.rows[0].value;
				}
			done(null,{data:myTrader})
		})
		}else{
			done(null,{data:"you are not allowed to view this page."})
		}
	}catch(err){
		console.log("Error connection to database : " + err )}
}

LoginService.prototype.setLocalPairs = function(args,done){

	var pairs = args.data;
	var trader = args.trader;
	
	var myPairs = {};
	myPairs.trader = trader.nick;
	myPairs.name = [];

	var j = 0;
	for(var i=0;i<pairs.length;i++){
		if ( pairs[i].show == true ){
			myPairs.name.push(pairs[i].id);
			j++;
		}
	}
	currentTrader = trader;
	if(currentTrader._id != undefined){
		currentTrader.pairName = myPairs.name;
		
		LoginService.prototype.insertToDatabase(currentTrader,done)
		done(null,{data:currentTrader})
		}
}

LoginService.prototype.setTradingLimits = function(args,done){
	
	var limits = args.limits;
	var trader = args.trader;
	var flag = true;
	
		currentTrader = trader;
		
		limits.forEach(function(doc){
			if (isNaN(parseFloat(doc.limit)))
				flag = false;
		})	
		
		if( flag ){
			currentTrader.tradingLimits = limits;
			if (this.insertToDatabase != undefined){
				try{
					this.insertToDatabase(currentTrader,done)
				}catch(err){
					console.log("error writing into database : " + err);
					done(null,{status:"failed"})
				}
			}else{
					try{
						LoginService.prototype.insertToDatabase(currentTrader,done)
						done(null,{data:currentTrader});
					}catch(err){
						console.log("error writing into database : " + err);
						done(null,{status:"failed"})
					}
				}
		}else{
			done(null,{status:"limits isNaN"})
		}
}

LoginService.prototype.getAllData = function(){
	return database.getAllData();
}

}