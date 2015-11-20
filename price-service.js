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
var seneca = require('seneca')()
var	host   = require('./public/config/host').host;
seneca
	.use('Price')
	.listen({host:host,port:9002,pin:{role:'priceAPI'}})
	.listen({host:host,port:9007,pin:{role:'priceAPI'}})
	.client({host:host,port:9017,pin:{role:'orderAPI'}})

/*	get the live rates
 * 	persist the data into influxdb
 * 	compare the current rate with the limit / stop order to be executed
*/
seneca.act({role:'priceAPI', cmd:'initPrice'},function(args,done){
	
setInterval(function(){
	seneca.act({role:'priceAPI', cmd:'getPrice',data:done.results})
},200);
	
setInterval(function(){
seneca.act({role:'priceAPI', cmd:'showPrice'},function(args,done){	
	seneca.act({role:'priceAPI',cmd:'persistData',data:done.data})
	})
},3 * 60 * 1000)	
	
setInterval(function(){
	seneca.act({role:'priceAPI', cmd:'showPrice'},function(args,done){
			currentPrice = done.data;

		seneca.act({role:'orderAPI', cmd:'getCustomOrders'},function(args,done){
				existingOrders = done.customOrders;

		if(currentPrice.length > 0 )
			seneca.act({role:'orderAPI', cmd:'executeCustomOrders',data:[currentPrice,existingOrders]})
				})
		})
	},500)
})

/* 
 * 	resets the day high and day low
 */

setInterval(function(){
			seneca.act({role:'priceAPI', cmd:'initPrice'})
},10 * 60 * 60 * 1000);