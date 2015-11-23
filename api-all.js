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

module.exports = function api( options ) {
	"use strict";
	options = require('./options');
	
	this.use('user')
	this.use('ng-web')
	this.use('auth',options)

  var price_ops   = { getPrice:'getPrice',initPrice:'initPrice', showCurrentPair:'showCurrentPair', showPrice:'showPrice'},
	  order_ops   = { insertOrder:'insertOrder',getMyOrders:'getMyOrders',getCustomOrders:'getCustomOrders',
				      getMyExposures:'getMyExposures',calculateProfitLoss:'calculateProfitLoss',
					  showAvailablePairs :'showAvailablePairs',showCurrentPair:'showCurrentPair',},
	  login_ops   = { setLocalPair:'setLocalPair',getCurrentTrader:'getCurrentTrader'},
	  history_ops = { getTrendData:'getTrendData',showTrendData:'showTrendData',
					  getOhlcData:'getOhlcData',showOhlcData:'showOhlcData',
					  showAvailablePairs:'showAvailablePairs'};

  this.add( 'role:api,path:price', function( args, done ) {
    this.act( {role:'priceAPI',
      cmd:   price_ops[args.operation]
    }, done )
  })
   this.add( 'role:api,path:order', function( args, done ) {
    this.act( {role:'orderAPI',
      cmd:   order_ops[args.operation],
	  trader :args.trader,
	  username:args.username,
	  privateKey:args.privateKey
    }, done )
  })
  this.add( 'role:api,path:login', function( args, done ) {
    this.act( {role:'accountAPI',
      cmd:   login_ops[args.operation],
      data: args.data,
	  trader: args.trader,
	  username:args.username,
	  privateKey:args.privateKey
    }, done )
  })
	  this.add( 'role:api,path:history', function( args, done ) {
    this.act( {role:'historyAPI',
      cmd:   history_ops[args.operation],
	  name: args.name,
	  date: args.date,
	  interval : args.interval
    }, done )
  })
	
  this.add('init:api', function( args, done ) {
	  this.act('role:web',{use:{
      prefix: '/api',
      pin:    'role:api,path:*',
      map: {
        price: { GET:true, suffix:'/:operation' },
        order: { GET:true, suffix:'/:operation' },
        login: { GET:true, suffix:'/:operation' },
        history: { GET:true, suffix:'/:operation' }
      }
    }})
    done(null,{data:"success"})
  })
  
}
