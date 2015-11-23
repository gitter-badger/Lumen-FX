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

module.exports 	= function (){
"use strict";
var PriceService 	= require('./PriceService'),
	priceService 	= new PriceService(),
	seneca 			= this;
	/**
	* registering roles for Seneca Microservices
	*/
	this.add({role:'priceAPI', cmd:'getPrice'},priceService.getPrice)
	this.add({role:'priceAPI', cmd:'showPrice'},priceService.showPrice)
	this.add({role:'priceAPI', cmd:'persistData'},priceService.persistData)
	this.add({role:'priceAPI', cmd:'initPrice'},priceService.initPrice)
	this.add({role:'priceAPI', cmd:'setCurrentPair'},priceService.setCurrentPair)
	this.add({role:'priceAPI', cmd:'showCurrentPair'},priceService.showCurrentPair)
}
