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