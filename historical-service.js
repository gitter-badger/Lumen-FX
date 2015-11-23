/*
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
var seneca = require('seneca')( { timeout:99999 } )
var	host   = require('./public/config/host').host;
seneca
	.use('History')
	.listen({host:host,port:9003,pin:{role:'historyAPI'}})

seneca.act({role:'historyAPI', cmd:'getTrendData'})

/**
* gets the trend for the ccy pairs every 5 minutes
*/
setInterval(function(){
	seneca.act({role:'historyAPI', cmd:'getTrendData'})
},3 * 60 * 1000);

