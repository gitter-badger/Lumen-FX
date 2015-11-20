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