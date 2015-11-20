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
var LoginService 	= require('./LoginService'),
	loginService 	= new LoginService(),
	seneca 			= this;
	
	/**
	 * Seneca role declaration / Seneca method signature
	 */
	this.add({role:'accountAPI', cmd:'registerTrader'},loginService.registerTrader)
	this.add({role:'accountAPI', cmd:'getCurrentTrader'},loginService.getCurrentTrader)
	this.add({role:'accountAPI', cmd:'setLocalPairs'},loginService.setLocalPairs)
	this.add({role:'accountAPI', cmd:'setTradingLimits'},loginService.setTradingLimits)
}