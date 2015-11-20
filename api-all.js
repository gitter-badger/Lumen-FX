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
