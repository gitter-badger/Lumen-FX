var assert  	 	= require('chai').assert,
	expect  	 	= require('chai').expect,
	sinon		 	= require('sinon'),
	MockDatabase	= require('./MockDatabase'),
	//include the OrderService Class
	OrderService 	= require('../OrderService'),
	seneca 	 	 	= require('seneca')( { timeout:99999 } ),
    request			= require('request'),
	Q 				= require('q'),
 	chai 			= require("chai"),
	logger			= require("../public/config/logger");
					  require("should");



//use the Seneca's method
				
describe('A System with Order Service', function() {
var expectedAllOrders   = require('./expectedOrders'),
	validUser 			= {username:"nicholas",password:"nicholas"},
	invalidUser			 = {username:"asdasd",password:"password"},
	database  			= new MockDatabase(expectedAllOrders),
   	orderService		= new OrderService(database);
	
  beforeEach(function(done){
	var retrieveStub= sinon.stub(orderService, "retrieveFromDatabase",function(viewName,DesignName,data){
	var deferred = Q.defer();

		var username = data;
		if ( viewName == "myOrders" ){
			if(username == validUser.username){
				deferred.resolve(orderService.getMyOrdersMock().nicholasExecutions);
			}else{
				deferred.resolve({rows:[]});
			}
		}else if( viewName == "allCustomOrders"){
				deferred.resolve(orderService.getMyOrdersMock().customOrders);
		}else if ( viewName == "myExposures"){
			if( data[0] == validUser.username){
				deferred.resolve(expectedAllOrders.nicholasExecutions);
			}else{
				deferred.resolve({rows:[]});
			}
		}
		return deferred.promise;
	})
	  

	var validateStub= sinon.stub(orderService, "insertCustomOrder",function(args,callback){
		if(args.type != "market")
			callback(null,{ok:true})
		else
			callback(null,{ok:false})	
		})

	done();
  });
	
  afterEach(function(done){
    orderService.retrieveFromDatabase.restore();
    orderService.insertCustomOrder.restore();
   // orderService.getCurrentTrader.restore();
    done();
  });

	
it('should display error if trader\'s orders were not found', function(done){ 

	
	
	orderService.getMyOrders({username:invalidUser.username}, function(err, results){
		setTimeout(function(){
			logger.warn("No orders found for trader '"+ invalidUser.username + "'")
			expect(results.data).to.be.empty;
			done();
		})
	})
});

it('should get trader\'s orders from database', function(done){
	orderService.getMyOrders({username:validUser.username}, function(err, results){
		setTimeout(function(){
			expect(results.data.length).not.equal(0)
			expect(results.data).to.not.equal(null)
			done();
		})
	})
});

it('should get trader\'s exposures', function(done){
	orderService.getMyExposures({username:validUser.username}, function(err, results){
		setTimeout(function(){
			//expect(results).to.eql(expectedAllOrders.nicholasExposures)
			expect(results.data).to.not.to.be.empty
			done();
		})
	})
});

it('should return default value for exposures if user is not found', function(done){
	orderService.getMyExposures({username:invalidUser.username}, function(err, results){
		setTimeout(function(){
			expect(results.data).to.eql(expectedAllOrders.defaultExposures.data)
			done();
		})
	})
});

it('should insert orders if amount is less than trading limits', function(done){
	var user = validUser;
		user.tradingLimits = [{name:"GBP",limit:1000000},
								  {name:"USD",limit:1000000},
								  {name:"EUR",limit:1000000},
								  {name:"MYR",limit:1000000}];
	var orderOjb = {name:"EURCHF",amount:30000,status:"open"}
	orderService.checkTradingLimits({trader:user,data:orderOjb}, function(err, results){
		setTimeout(function(){
			expect(results.data.status).to.equal("open")
			done();
		})
	})
});

it('should change status to rejected if amount is more than trading limits', function(done){
	var user = validUser;
		user.tradingLimits = [{name:"GBP",limit:1000000},
								  {name:"USD",limit:1000000},
								  {name:"EUR",limit:1000000},
								  {name:"MYR",limit:1000000}];
	var orderOjb = {name:"EURCHF",amount:3000000,status:"open"}
	orderService.checkTradingLimits({trader:user,data:orderOjb}, function(err, results){
		setTimeout(function(){
			expect(results.data.status).to.equal("rejected")
			done();
		})
	})
});
	
it('should calculate exposures', function(done){
	//calculating nicholas' exposures
	 var value = orderService.calculateExposures(expectedAllOrders.nicholas.rows);
		expect(value).to.eql(expectedAllOrders.nicholasExposures.data)
		done();
});

it('should get custom Order', function(done){
		orderService.getCustomOrders({}, function(err, results){
			setTimeout(function(){
				results.customOrders.forEach(function(result){
					expect(result.type).to.not.equal("market");
				})
				done();
			})
		})
});
	
it('should calculate profit and loss', function(done){

    orderService.calculateProfitLoss({username:validUser.username}, function(err, results){
		setTimeout(function(){
			if(err) logger.error(err);
			results.profit.forEach(function(result){
				expect(result.amount).to.exist;
				expect(result.name).to.exist;
			})
			done();
		})
	})
});
	
it('should retrieve orders with its\' opposite side', function(done){
    orderService.retrieveOppositeOrders({name:"USDJPY",dir:"buy"}).then(function(results){
		setTimeout(function(){
			expect(results).to.exist
			done();
		})
	}).catch(function(err){
		logger.error(err)
		done(err);
	})
});
	
	
		
it('should insert a new custom order', function(done){
	
	var customOrder = {name:"EURCHF",dir:"buy",type:"limit",amount:123,status:"pending",remaining:123,rate:1.07666,
					  date: new Date().toISOString()};
	
	orderService.insertCustomOrder(customOrder, function(err,results){
		setTimeout(function(){
			expect(results.ok).to.equal(true)
			done();
		})
	})
});

})