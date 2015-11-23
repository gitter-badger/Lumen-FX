/*
 *	<LumenFX: An FX system designed and built by thecitysecret>
 *  Copyright (C) 2015 thecitysecret
 *
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

module.exports = function (options) {
    'use strict';
	this.add({role: 'fixMessageAPI', cmd: 'buildFixMessage'}, buildFixMessage);
	this.add({role: 'fixMessageAPI', cmd: 'parseFixMessage'}, parseFixMessage);
    
    var
        sides = {
            'BUY':  1,
            'SELL': 2
        },
        orderTypes = {
            'MARKET':  1,
            'LIMIT': 2,
            'STOP':  3,
            'STOP LIMIT': 4
        },
        tagIDs = {
            'Account': 1,
            'BeginString': 8,
            'BodyLength': 9,
            'CheckSum': 10,
            'Currency': 15,
            'MsgType': 35,
            'OrderID': 37,
            'OrderQty': 38,
            'OrderType': 40,
            'OrigTime': 42,
            'Price': 44,
            'Side': 54,
            'Symbol': 55,
            'SecurityType': 167
        },
        separator = String.fromCharCode(1);
    
    function leftPad(value, paddingCharacter, length) {
        if (value.toString().length >= length) {
            return value;
        }
        var padding = (new Array(length - value.toString().length + 1)).join(paddingCharacter);
        return padding + value;
    }
    
    function getCheckSum(text) {
        var checkSum = 0, i;
        for (i = 0; i < text.length; i = i + 1) {
            checkSum = checkSum + text.charCodeAt(i);
        }
        checkSum = checkSum % 256;
        return leftPad(checkSum, '0', 3);
    }
       
    function getKeyOf(map, value) {
        var
            keys = Object.keys(map),
            k;
        for (k = 0; k < keys.length; k = k + 1) {
            if (map[keys[k]] == value) {
                return keys[k];
            }
        }
        throw 'Key not found.';
    }
    
    function buildFixDate(date) {
        var dateFormat = '{0}{1}{2}-{3}:{4}:{5}.{6}';
        return String.format(
            dateFormat,
            date.getUTCFullYear(),
            leftPad(date.getUTCMonth() + 1, '0', 2),
            leftPad(date.getUTCDate(), '0', 2),
            leftPad(date.getUTCHours(), '0', 2),
            leftPad(date.getUTCMinutes(), '0', 2),
            leftPad(date.getUTCSeconds(), '0', 2),
            leftPad(date.getUTCMilliseconds(), '0', 3)
        );
    }
    
    function parseFixDate(text) {
        var date = new Date(
            parseInt(text.substr(0, 4)), 
            parseInt(text.substr(4, 2)) - 1, 
            parseInt(text.substr(6, 2)), 
            parseInt(text.substr(9, 2)), 
            parseInt(text.substr(12, 2)), 
            parseInt(text.substr(15, 2)), 
            parseInt(text.substr(18, 3))
        );
        return date;    
    }
    
    function buildFixSymbol(name) {
        return String.format('{0}/{1}', name.substr(0, 3), name.substr(3));
    }
    
    function parseFixSymbol(symbol) {
        return symbol.substr(0, 3) + symbol.substr(4);
    }
    
    function buildFixSide(dir) {
        return sides[dir.toUpperCase()];
    }
    
    function parseFixSide(side) {
         return getKeyOf(sides, side).toLowerCase();               
    }
    
    function buildFixOrderType(type) {        
        return orderTypes[type.toUpperCase()];
    }
    
    function parseFixOrderType(orderType) {
        return getKeyOf(orderTypes, orderType).toLowerCase()
    }
    
    function buildFixMessage(request, callback) {
        
        // Create a string.format() method.
        if (!String.format) {
            String.format = function (format) {
                var args = Array.prototype.slice.call(arguments, 1);
                return format.replace(/\{(\d+)\}/g, function (match, number) {
                    return typeof args[number] !== 'undefined'
                        ? args[number]
                        : match;
                });
            };
        }
    
        // Create the formats for the three message elements: header, body and trailer.
        var order = request.data,
            headerFormat =
                '8=FIX.4.2' + separator +           // 8    = BeginString.
                '9={0}'     + separator,            // 9    = BodyLength.
            bodyFormat =
                '35=D'      + separator +           // 35   = MsgType ("D" = Order - Single).
                '167=FOR'   + separator +           // 167  = SecurityType. "FOR" = Foreign Exchange Contract.      
                '37={0}'    + separator +           // 37   = OrderID.         
                '1={1}'     + separator +           // 1    = Account.
                '54={2}'    + separator +           // 54   = Side (1 = Buy, 2 = Sell).
                '55={3}'    + separator +           // 55   = Symbol (in EBS format, ie "CCY1/CCY2").
                '15={4}'    + separator +           // 15   = Currency (denomination of the quantity field).  
                '38={5}'    + separator +           // 38   = OrderQty.               
                '40={6}'    + separator +           // 40   = OrderType (1 = Market, 2 = Limit, 3 = Stop, 4 = Stop Limit).
                '44={7}'    + separator +           // 44   = Price.
                '42={8}'    + separator,            // 42   = OrigTime (in UTC).     
            trailerFormat =
                '10={0}' + separator,               // 10 = CheckSum.
            bodyText,
            headerText,
            fixMessage,
            checkSum,
            trailerText;
        
        // Create and assemble the message elements.
        bodyText = String.format(
            bodyFormat,
            order.id,
            order.traderID,
            buildFixSide(order.dir),
            buildFixSymbol(order.name),
            order.name.substr(3),
            order.amount,
            buildFixOrderType(order.type),
            order.rate,
            buildFixDate(order.date)
        );
        headerText = String.format(headerFormat, bodyText.length);
        fixMessage = headerText + bodyText;
        checkSum = getCheckSum(fixMessage);
        trailerText = String.format(trailerFormat, checkSum);
        fixMessage = fixMessage + trailerText;

        // Notify the caller.
        callback(null, {data: fixMessage});
    }
    
    function getFixTagValue(tags, id) {
        var t, elements;
        for (t = 0; t < tags.length; t = t + 1) {
            elements = tags[t].split('=');
            if (elements.length != 2) { 
                throw 'Tag invalid.';
            }
            if (elements[0] == id.toString()) {
                return elements[1];
            }
        }
        throw 'Tag not found.';
    }
    
    function parseFixMessage(text, callback) {
        var
            tags = text.data.toString().split(separator),
            symbol = getFixTagValue(tags, tagIDs.Symbol),
            order = { 
                amount: parseInt(getFixTagValue(tags, tagIDs.OrderQty)),
                date: parseFixDate(getFixTagValue(tags, tagIDs.OrigTime)), 
                dir: parseFixSide(getFixTagValue(tags, tagIDs.Side)),
                id: getFixTagValue(tags, tagIDs.OrderID),
                name: parseFixSymbol(symbol),
                rate: parseFloat(getFixTagValue(tags, tagIDs.Price)),
                traderID: getFixTagValue(tags, tagIDs.Account),
                type: parseFixOrderType(getFixTagValue(tags, tagIDs.OrderType))
            };
        callback(null, {data: order});
    }
    
};
