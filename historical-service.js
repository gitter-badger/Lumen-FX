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
var seneca = require('seneca')( { timeout:99999 } )
var	host   = require('./public/config/host').host;
seneca
	.use('History')
	.listen({host:host,port:9003,pin:{role:'historyAPI'}})

seneca.act({role:'historyAPI', cmd:'getTrendData'})

/**
* gets the trend for the ccy pairs every 5 minutes
*/
setInterval(function(){
	seneca.act({role:'historyAPI', cmd:'getTrendData'})
},3 * 60 * 1000);

