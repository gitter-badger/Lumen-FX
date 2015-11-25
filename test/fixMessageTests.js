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

var seneca = require('seneca')();
require("should");
seneca
    .use('fixMessage');

var
    dirs = ['buy', 'sell'],
    sides = [1, 2],
    types = ['market', 'limit', 'stop', 'stop limit'],
    orderTypes = [1, 2, 3, 4],
    names = ['EURGBP', 'GBPUSD', 'USDJPY'],
    symbols = ['EUR/GBP', 'GBP/USD', 'USD/JPY'],
    currencies = ['GBP', 'USD', 'JPY'],
    id = 'dummy order code',
    rate = 1.34,
    date = new Date("January 2, 2000 03:04:05.006"),
    origTime = '20000102-03:04:05.006',
    traderID = 'dummy trader code',
    amount = 1000000,
    checkSums = [
        [
            ['130', '149', '182'],
            ['131', '150', '183'],
            ['132', '151', '184'],
            ['133', '152', '185']
        ],
        [
            ['131', '150', '183'],
            ['132', '151', '184'],
            ['133', '152', '185'],
            ['134', '153', '186']
        ]
    ];

// Create a string.format() method, if we don't have one already.
if (!String.format) {
    String.format = function (format) {
        'use strict';
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/\{(\d+)\}/g, function (match, number) {
            return typeof args[number] !== 'undefined'
                ? args[number]
                : match;
        });
    };
}

function createOrder(dir, type, name, id, rate, date, traderID, amount) {
    'use strict';
    return {
        amount: amount,
        date: date,
        dir: dir,
        id: id,
        name: name,
        rate: rate,
        traderID: traderID,
        type: type
    };
}

function createFix(side, orderType, symbol, currency, orderID, price, origTime, account, orderQty, checkSum) {
    'use strict';
    var
        separator = String.fromCharCode(1),
        length = 81 + orderID.toString().length + price.toString().length + account.toString().length + orderQty.toString().length,
        fixFormat =
        '8=FIX.4.2' + separator +           // 8    = BeginString.
        '9={0}'     + separator +           // 9    = BodyLength.
        '35=D'      + separator +           // 35   = MsgType ("D" = Order - Single). 
        '167=FOR'   + separator +           // 167  = SecurityType. "FOR" = Foreign Exchange Contract.      
        '37={1}'    + separator +           // 38   = OrderID.         
        '1={2}'     + separator +           // 1    = Account.
        '54={3}'    + separator +           // 54   = Side (1 = Buy, 2 = Sell).
        '55={4}'    + separator +           // 55   = Symbol (in EBS format, ie "CCY1/CCY2").
        '15={5}'    + separator +           // 15   = Currency (denomination of the quantity field).  
        '38={6}'    + separator +           // 38   = OrderQty.               
        '40={7}'    + separator +           // 40   = OrderType (1 = Market, 2 = Limit, 3 = Stop, 4 = Stop Limit).
        '44={8}'    + separator +           // 44   = Price.
        '42={9}'    + separator +           // 42   = OrigTime (in UTC).    
        '10={10}'   + separator;
    return String.format(
        fixFormat,
        length,
        orderID,
        account,
        side,
        symbol,
        currency,
        orderQty,
        orderType,
        price,
        origTime,
        checkSum
    );
}

function testBuildAndParseFixMessage(order, fix) {
    'use strict';
    //console.log(data);
    //console.log(fix);
    var description = String.format('#should support {0} {1} {2}', order.dir, order.type, order.name);
    describe(description, function () {
        it('buildFixMessage()', function (done) {

            function verifyFix(data) {
                data.should.equal(fix);
                done();
            }
            seneca.act(
                {
                    role: 'fixMessageAPI',
                    cmd: 'buildFixMessage',
                    data: order
                },
                function (args, callback) {
                    verifyFix(callback.data);
                }
            );
        });
        it('parseFixMessage()', function (done) {
            function verifyOrder(data) {
                data.amount.should.equal(order.amount);
                data.date.getTime().should.equal(order.date.getTime());
                data.dir.should.equal(order.dir);
                data.id.should.equal(order.id);
                data.name.should.equal(order.name);
                data.rate.should.equal(order.rate);
                data.traderID.should.equal(order.traderID);
                data.type.should.equal(order.type);
                done();
            }
            seneca.act(
                {
                    role: 'fixMessageAPI',
                    cmd: 'parseFixMessage',
                    data: fix
                },
                function (args, callback) {
                    verifyOrder(callback.data);
                }
            );
        });
    });
}

var
    d,
    t,
    n,
    order,
    fix;
for (d = 0; d < dirs.length; d = d + 1) {
    for (t = 0; t < types.length; t = t + 1) {
        for (n = 0; n < names.length; n = n + 1) {

            // Create an order and its FIX representation.                
            order = createOrder(
                dirs[d],
                types[t],
                names[n],
                id,
                rate,
                date,
                traderID,
                amount
            );
            fix = createFix(
                sides[d],
                orderTypes[t],
                symbols[n],
                currencies[n],
                id,
                rate,
                origTime,
                traderID,
                amount,
                checkSums[d][t][n]
            );
            
            // Check that the parser can convert one into the other.
            testBuildAndParseFixMessage(order, fix);
        }
    }
}


      