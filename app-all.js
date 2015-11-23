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
 * 
 */
"use strict";
var seneca 			= require('seneca')( { timeout: 99999}),
	path 			= require('path'),
	request 		= require('request'),
	bodyparser 		= require('body-parser'),
	openfinLauncher	= require('openfin-launcher'),
	nano 			= require("nano")("http://localhost:5984"),
	traderinfodb 	= nano.db.use("traderinfodb"),
	serveStatic    	= require('serve-static'),
	CryptoJS 		= require("crypto-js"),
	PRIVATEKEY		= require('./public/config/commonVar').key,
	logger			= require("./public/config/logger"),
	host  			= require('./public/config/host').host;
					  require('fixparser')

seneca
	.use('api-all')
 	.client({host:host,port:9002,pin:{role:"priceAPI"}})
    .client({host:host,port:9003,pin:{role:"historyAPI"}})
	.client({host:host,port:9004,pin:{role:"orderAPI"}})
	.client({host:host,port:9010,pin:{role:"accountAPI"}})
	.client({host:host,port:9998,pin:{role:"fixMessageAPI"}})

var express = require('express.io'),
app = express();
app.http().io()

var user = "";
var u = seneca.pin({role:'user',cmd:'*'})
app.use(bodyparser.json())
app.enable('trust proxy')
app.use(express.query())
app.use(bodyparser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))
app.use(seneca.export('web'))

app.engine('ejs',require('ejs-locals'))
app.engine('html',require('ejs').renderFile)
app.set('views', __dirname + '/public/views')
app.set('view engine','jade')

u.register({nick:"demo",name:"demo",email:"demo@me.com",active:true,username:"demo", password:"password"})

/**
* register all users from database into SenecaJS auth
*/
try{
	traderinfodb.view('allTrader','viewAllTrader', function(err, body) {
		var decrypted,
			decryptedText;
			if (!err){
			body.rows.forEach(function(doc) {
			doc = doc.value;
				decrypted = CryptoJS.AES.decrypt( doc.password, "TCS" );
				decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
				u.register({nick:doc.username,name:doc.firstname,
					email:doc.email,active:true,username:doc.username, password:decryptedText})
			})
		}else{
		logger.warn(err);
		}
	})
}catch(err){
	logger.error(err);
}

app.get('/login', function(req, res){
	res.render('login.html',{})
	res.end();
})

app.get('/',function(req,res){
	if( checkLoggedIn(req.seneca.user)){
		user = req.seneca.user;
		res.render('index.ejs',{user:req.seneca.user})
	}else{
		res.render('login.html',{locals:{user:req.seneca.user}})
	}

})

/** 
* post the currentPair for other page's controller
* customOrder page
*/
app.post('/api/setCurrentPair',function(req,res){
	var data = req.body;
	seneca.act({role:'priceAPI', cmd:'setCurrentPair',data:data})
	seneca.act({role:'orderAPI', cmd:'setCurrentPair',data:data})
	res.end();	
})

app.post('/api/setTradingLimits',function(req,res){
	var data = req.body;
	seneca.act({role:'accountAPI', cmd:'getCurrentTrader',
				username:req.seneca.user.nick,privateKey:PRIVATEKEY},function(args,done){
		seneca.act({role:'accountAPI', cmd:'setTradingLimits',limits:data,trader:done.data},function(args,done){
			res.end();
		})
			
	})
	
})

app.post('/api/setLocalPairs',function(req,res){
	var data = req.body;
	seneca.act({role:'accountAPI', cmd:'getCurrentTrader',
				username:req.seneca.user.nick,privateKey:PRIVATEKEY},function(args,done){
		seneca.act({role:'accountAPI', cmd:'setLocalPairs',data:data,trader:done.data},function(args,done){
			res.end();
		})	
	})
})

app.post('/insertOrder',function(req,res){
	var data = req.body;
	if( checkLoggedIn(req.seneca.user) ){
		seneca.act({role:'accountAPI', cmd:'getCurrentTrader',
					username:req.seneca.user.nick,privateKey:PRIVATEKEY},function(args,done){
			trader = done.data;
			seneca.act({role:'orderAPI', cmd:'checkTradingLimits',trader:trader,data:data},function(args,done){
				validatedOrder = done.data;
				seneca.act({role:'orderAPI', cmd:'insertOrder',data:validatedOrder},function(args,done){
				})
			})
		})
			res.end();
	}else{
	res.render('login.html',{locals:{}})
	}
})

app.post('/SaveNewTraderToDataBase',function(req,res){
	var decrypted,
		decryptedText,
		data = req.body;
	decrypted = CryptoJS.AES.decrypt(data.password, "TCS");
	decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
	u.register({nick:data.username,name:data.name,email:data.email,active:true,username:data.username, password:decryptedText})

	seneca.act({role:'accountAPI', cmd:'registerTrader',data:data},function(args,done){
		res.end();
	})
})

app.post('/triggerUpdate',function(req,res){
	if ( req.body.data.tradedFrom == user.nick || req.body.data.tradedWith ){
		req.io.broadcast('new order',{data:req.body.data})
		}		
	  res.end();
})

openfinLauncher.launchOpenFin({
        //Launch a hosted application 
        configPath: 'http://' + host + ':3000/app.json'
    })
    .fail(function(error) {
        console.log('error!', error);
    });

/**
* starts the app at PORT 3000
*/
app.listen(3000)
logger.info('Listening on port 3000')

function checkLoggedIn(user){
	if (user == undefined)
		return false;
	else
		return true;

}
