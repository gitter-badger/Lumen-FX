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
 */

module.exports = function CurrencyPair(id, name, bid, ask, rate, low, high, open, latestPrice) {
	this.id = id;
	this.name = name;
	this.bid = bid;
	this.ask = ask;
	this.low = low;
	this.high = high;
	this.rate = rate;
	this.open = open;
	this.latestPrice = latestPrice;
	this.status = "inactive";

	this.transform = function(name,bid,ask){
			this.id = name;
			this.name = this.id;
			this.bid = parseFloat(bid);
			this.ask = parseFloat(ask);
			this.rate = (this.ask + this.bid) / 2.0;
			if (this.open == 0)
				this.open = this.rate;
			this.pip = 10000;
		
		if(this.rate > this.high)
			this.high = this.rate;
		if(this.rate < this.low)
			this.low = this.rate;
		
			if (this.ask - this.bid >= 0.01)
				this.pip = 100;
			this.spread = (this.ask - this.bid) * this.pip;
			this.latestPrice = this.rate;
			this.status = "active";
		}

}