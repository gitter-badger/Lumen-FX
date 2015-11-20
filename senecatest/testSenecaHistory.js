/**
<LumenFX: An FX system designed and built by thecitysecret>
    Copyright (C) 2015 thecitysecret

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var assert 		= require('chai').assert,
	influx 		= require('influx'),
	dbConfig 	= require('../public/config/InfluxDBConfig'),
	dbInflux 	= influx(dbConfig),
	Q 			= require('q'),
	seneca 		= require('seneca')( { timeout:99999 } );
			      require("should")
seneca
    .use('../History')

describe('Historical', function () {
  
describe('getTrendData()', function () {

    it('should correctly get trend data from influx database', function (done) {
		seneca.act({role:'historyAPI', cmd:'getTrendData'},function(args,cb){
				assert.equal(11,cb.data.length)
			done();
		})
    })
})
	
describe('getOhlcData()', function () {
	it('should correctly get data for OHLC chart from influx database', function (done) {
		seneca.act({role:'historyAPI', cmd:'getOhlcData',name:"GBPJPY"},function(args,cb){
			var test = cb.ohlc;
				assert.equal("GBPJPY",test[0].name)
				done();
		})
	})	
})


})