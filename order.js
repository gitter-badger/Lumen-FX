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
module.exports 	= function (){
var OrderService 	= require('./OrderService'),
	orderService 	= new OrderService(),
	seneca 			= this;
	/**
	* registering roles for Seneca Microservices
	*/
	this.add({role:'orderAPI', cmd:'insertOrder'},orderService.insertOrder)
	this.add({role:'orderAPI', cmd:'getMyOrders'},orderService.getMyOrders)
	this.add({role:'orderAPI', cmd:'getMyExposures'},orderService.getMyExposures)
	this.add({role:'orderAPI', cmd:'getCustomOrders'},orderService.getCustomOrders)
	this.add({role:'orderAPI', cmd:'executeCustomOrders'},orderService.executeCustomOrders)
	this.add({role:'orderAPI', cmd:'checkTradingLimits'},orderService.checkTradingLimits)
	this.add({role:'orderAPI', cmd:'calculateProfitLoss'},orderService.calculateProfitLoss)
	this.add({role:'orderAPI', cmd:'showCurrentPair'},orderService.showCurrentPair)
	this.add({role:'orderAPI', cmd:'setCurrentPair'},orderService.setCurrentPair)
	this.add({role:'orderAPI', cmd:'showAvailablePairs'},orderService.showAvailablePairs)
	
}