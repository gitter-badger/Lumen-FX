var assert  	 	= require('chai').assert,
	expect  	 	= require('chai').expect,
	sinon		 	= require('sinon'),
	MockDatabase	= require('./MockDatabase'),
	//include the LoginService Class
	LoginService 	= require('../LoginService'),
	seneca 	 	 	= require('seneca')( { timeout:99999 } ),
    request			= require('request'),
	Q 				= require('q'),
 	chai 			= require("chai"),
	logger			= require("../public/config/logger");
					require("should");

//use the Seneca's method
				
describe('A System with Login Service', function() {
var	expectedAllUsers 	= [
{ "_id": "8642c68e25b4cf20a459d19186281be1",
   "_rev": "628-81ae8fc4bd90d6c64252cc21989ca303",
   "firstname": "nicholas",
   "lastname": "chan",
   "email": "nicholas@me.com",
   "username": "nicholas",
   "password": "U2FsdGVkX19xKcj49pJVBF2yVrqBCH+9rtOoVybFkiY=",
   "pairName": [
				   "EURCHF","EURGBP","EURUSD","GBPEUR","GBPJPY",
	   				"MYRCHF","USDEUR","USDGBP","USDHKD","USDJPY"],
   "tradingLimits": [
       {	"name": "GBP",
           "limit": 0
       },
       {	"name": "USD",
           "limit": 0
       },
       {	"name": "EUR",
           "limit": 0
       },
       {	 "name": "MYR",
           "limit": 0
       }]
},{"_id": "341d92f4d86f99e1fb82bc0c8a07b233",
   "_rev": "42-ac252f7abc6a0d7d61a30db3f7a3c77a",
   "firstname": "demo",
   "lastname": "demo",
   "email": "demo@me.com",
   "username": "demo",
   "password": "U2FsdGVkX1/OG0tuG/kR+7oHRWkIt/X7kwO94hX8DCo=",
   "tradingLimits": [
       {
           "name": "GBP",
           "limit": 1121000,
           "error": false
       },
       {
           "name": "USD",
           "limit": 500000,
           "error": false
       },
       {
           "name": "EUR",
           "limit": 6020000,
           "error": false
       },
       {
           "name": "MYR",
           "limit": 500000,
           "error": false
       }
   ],
   "pairName": [
       "EURCHF",
       "EURGBP",
       "EURUSD",
       "GBPMYR",
       "USDEUR",
       "USDGBP",
       "USDHKD"
   ]
}],
	//currentUser 	 	= new MockUser(),
	database  			= new MockDatabase(expectedAllUsers),
   	loginService		= new LoginService(database),
	//mockCurrentUser 	= sinon.mock(currentUser),
	mockDbUser			= sinon.mock(database);


  beforeEach(function(done){
	var insertStub 	= sinon.stub(loginService, "insertToDatabase",function(args,done){
			logger.info( args.username + " has been inserted or updated to the mock database")
			if(done != undefined)
				done(null,{data:args});
	})
	var retrieveStub= sinon.stub(loginService, "retrieveFromDatabase");
  		retrieveStub.yields(null,loginService.getAllData());
	  
	var validateStub= sinon.stub(loginService, "validateExistingTrader",function(args){
		var deferred = Q.defer();
			loginService.getAllData().forEach(function(results){
				if(results.username == args.username)
					deferred.resolve({name:"fake stub",status:false,obj:loginService});
				else if(args.username == null)
					deferred.resolve({name:"fake stub",status:null,obj:loginService});
				else
					deferred.resolve({name:"fake stub",status:true,obj:loginService});
			})
			return deferred.promise;
		})

	var getTraderStub= sinon.stub(loginService, "getCurrentTrader",function(args){
		var deferred = Q.defer();
			loginService.getAllData().forEach(function(results){
				if(results.username == args.username){
					deferred.resolve(results);
				}else{
						deferred.resolve("null");
				}
			})

			return deferred.promise;
	})
	
	done();
  });
	
  afterEach(function(done){
    loginService.insertToDatabase.restore();
    loginService.retrieveFromDatabase.restore();
    loginService.validateExistingTrader.restore();
    loginService.getCurrentTrader.restore();
	  
    done();
  });


it('should create a new user account with a valid information', function(done){
	var validNewUser = {username:"asdd",password:"nicholas"};
	  
	loginService.registerTrader({data:validNewUser}, function(err, results){
		setTimeout(function(){
			expect(validNewUser.username).equal(results.data.username);
			expect(results.data.tradingLimits).to.exist;
			done();
		})
	})
});

it('should prompt error upon failing at registration', function(done){
	var invalidNewUser = {username:"nicholas",password:"nicholas"};

    loginService.registerTrader({data:invalidNewUser}, function(err, results){
		setTimeout(function(){
			logger.warn( results.status )
			expect({status:'username existed,Please try using other usernames.'}).to.eql(results);
			done();
		})
	}); 
});

it('should prompt error when input is null', function(done){
	var invalidNewUser = {username:null,password:null};

    loginService.registerTrader({data:invalidNewUser}, function(err, results){
		setTimeout(function(){
			logger.warn( "null or undefined value inserted" )
			expect(null).to.eql(results);
			done();
		})
    }); 
});

it('should log the user into the system', function(done){
	var validUser = {username:"nicholas",password:"nicholas"};
		loginService.getCurrentTrader(validUser).then(function(result){
			expect(validUser.username).to.eql(result.username);
			done();
		}).catch(function(err){
			done(err);
		})
});
	
it('should not log the user into the system', function(done){
	var invalidUser = {username:"nicholas",password:"asd"};

		loginService.getCurrentTrader(invalidUser).then(function(result){
			logger.info("invalid login credentials")
			expect(invalidUser.username).to.eql(result.username);
			done();
		}).catch(function(err){
			done(err);
		})
});
		
it('should not log the user into the system with undefined values', function(done){
	var invalidUser = {username:undefined,password:"asd"};

		loginService.getCurrentTrader(invalidUser).then(function(result){
			logger.info("invalid undefined login credentials")
			expect(invalidUser.username).to.eql(result.username);
			done();
		}).catch(function(err){
			done(err);
		})
});
	
it('should update trader\'\s trading limits', function(done){
	var validUser = {username:"nicholas",password:"nicholas"};

		loginService.getCurrentTrader(validUser).then(function(result){
			var actualUser = result;
			var limits = [
					   {	"name": "GBP",
						   "limit": 200
					   },
					   {	"name": "USD",
						   "limit": 200
					   },
					   {	"name": "EUR",
						   "limit": 200
					   },
					   {	 "name": "MYR",
						   "limit": 200
					   }];
			loginService.setTradingLimits({limits:limits,trader:actualUser},function(err,cb){
				logger.info("trading limits updated to");
				logger.info(cb.data.tradingLimits);
				expect(cb.data.tradingLimits).to.eql(limits)
				done();
			})
		}).catch(function(err){
			done(err);
	})
});
	
it('should not update trader\'\s trading limits when value is not a number', function(done){
	var validUser = {username:"nicholas",password:"nicholas"};

		loginService.getCurrentTrader(validUser).then(function(result){
			var actualUser = result;
			var limits = [
					   {	"name": "GBP",
						   "limit":  ""
					   },
					   {	"name": "USD",
						   "limit":  ""
					   },
					   {	"name": "EUR",
						   "limit":  ""
					   },
						{	 "name": "MYR",
						   "limit":  ""
					   }];
			loginService.setTradingLimits({limits:limits,trader:actualUser},function(err,cb){
				logger.warn("trading limits is not a number");
				expect(cb).to.eql({status:"limits isNaN"})
				done();
			})
		}).catch(function(err){
			done(err);
	})
});
	
})

