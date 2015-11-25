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
"use strict";
var seneca = require('seneca')()
var	host   = require('./public/config/host').host;
var today	 = new Date();
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
	
	if( today.getDay() > 0 && today.getDay() < 6 )
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
			var currentPrice = done.data;

		seneca.act({role:'orderAPI', cmd:'getCustomOrders'},function(args,done){
				var existingOrders = done.customOrders;

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
