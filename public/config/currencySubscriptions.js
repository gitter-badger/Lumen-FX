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

module.exports = {
	//THERE IS A LIMIT OF PAIRS YOU CAN SUBSCRIBED FROM OANDA
	//please visit http://developer.oanda.com/rest-live/development-guide/ for more information
	OANDAPairs : [ "EURUSD","USDJPY","EURGBP","GBPJPY","EURCHF","USDHKD"],
	YAHOOPairs : ["GBPMYR","MYRCHF","USDGBP","USDEUR","GBPEUR"],
	pairs : function(){
	
		var allPairs = [];
			
		allPairs = this.OANDAPairs.slice();
		this.YAHOOPairs.forEach(function(doc){
			allPairs.push(doc);
		})
		allPairs.sort();
		return allPairs;
	}
}
