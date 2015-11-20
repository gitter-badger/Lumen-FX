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

module.exports = function HistoryService(database){
"use strict";
var	influx 			= require('influx'),
	dbConfig 		= require('./public/config/InfluxDBConfig'),
	availablePairs	= require('./public/config/currencySubscriptions'),
	dbInflux 		= influx(dbConfig),
	logger	 		= require('./public/config/logger'),
	allTrendData	= [],
	allOhlcData  	= [];
	
/**
 * Queries to influxDB to get the day trends
 * returns the daily trends starting from 8 am till midnight
 */
HistoryService.prototype.getTrendData = function(args,done){
	allTrendData = [];
	//receives the string query from the server
	var today = new Date(),
		starHour = today.getHours() - 8,
		startMin = (starHour * 60) + today.getMinutes(),
		query =  "select first(rate) from prices where time > now() - " + startMin +"m group by time(3m),name";
	
	if(startMin >= 0 && today.getDay() > 0 && today.getDay() < 6){
	//queryRaw because query will return results with odd orders
	//might be fixable with a new version of influxdb

		if(this.query != undefined){
			allTrendData = this.query(query,done);
		}else{
			HistoryService.prototype.query(query,done);
		}
	}
}

HistoryService.prototype.query = function(query,done){
	var queryResults = [];
	var allResults = [];
		try{	
	//queryRaw because query will return results with odd orders
	//might be fixable with a new version of influxdb#
	
		dbInflux.queryRaw(["mydb"], query, function(err, results){
			if(!err){
				var data = results[0];
				//if there isnt any data in the database length == undefined
				if(data.series != undefined)
				for(var j=0;j<data.series.length;j++){
					queryResults[queryResults.length] = data.series[j].tags;
					queryResults[queryResults.length-1].data = [];
					allResults[allResults.length] = data.series[j].tags;
					allResults[allResults.length-1].data = [];

					for(var i=0;i<data.series[j].values.length;i++){
						
							if(data.series[j].values[i].length == 2){
								if(data.series[j].values[i][1] != null)
									queryResults[queryResults.length-1].data.push(
									{	time :data.series[j].values[i][0], 
									 	rate : data.series[j].values[i][1]});
							}else if(data.series[j].values[i].length == 5){
								if(data.series[j].values[i][1] != null)
								allResults[allResults.length-1].data.push(
									{  Date :data.series[j].values[i][0], 
									   Open : data.series[j].values[i][1],
									   High : data.series[j].values[i][2],
									   Close : data.series[j].values[i][3],
									   Low : data.series[j].values[i][4] 
									});
							}
						}
				}
					if(query.length>100){
						allOhlcData = allResults;
						done(null,{ohlc:allOhlcData})
					}else{
						allTrendData = queryResults;
						done(null,{data:allTrendData})
					}
				}else{
					logger.warn(err);
				}
			})
		}catch(err){
			logger.error(err);
			done(null,{status:err})
		}
}

/**
 * Query to influxDB to get the historical data 
 * @param name, currency pair name
 * @param date, the date for which the historical data will show.
 * @param interval, the time frame of data to view
 * returns the historical data of a currency pair for up to 30 days
 */
HistoryService.prototype.getOhlcData = function(args,done){
	//set default values
	var name	 	= "EURGBP",
		date 		= "30d",
		interval	= "15m";

	if(args.name != undefined) 
		name = args.name;
	if(args.date != undefined) 
		date= args.date;
	if(args.interval != undefined )
		interval = args.interval;
	
	var query =  "select first(rate),max(rate),last(rate),min(rate) from prices where name = '" + name.toUpperCase();
		query += "' and time > now() - " + date+ " group by time("+interval+"),name";

			if(this.query != undefined){
				allOhlcData = this.query(query,done)
			}else{
				HistoryService.prototype.query(query,done);
			}
}
	
/**
 * Displays all the daily trends from a local variable
 */
HistoryService.prototype.showTrendData = function(args,done){
	done(null,{data:allTrendData})
}
	
/**
 * Displays the historical data from a local variable
 */
HistoryService.prototype.showOhlcData = function(args,done){
	/*
	var name = args.name;
	allOhlcData.forEach(function(doc){
		if (doc[0].name == name){
			var historyData = doc[0];
			done(null,{data:historyData})
			}
	})
	*/
	
	done(null,{data:allOhlcData})
}

HistoryService.prototype.getExpectedTrendData = function(){
	return database.getTrendData();
}

HistoryService.prototype.getExpectedOhlcData = function(){
	return database.getAllOhlcData();
}

HistoryService.prototype.showAvailablePairs = function(args,done){
	done(null,{data:availablePairs.pairs()})
}

}