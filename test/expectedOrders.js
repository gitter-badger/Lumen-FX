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
module.exports={

nicholas:{rows:[
{_id:'8f829576b8ab0b087a2413620588ef3d',_rev:'1-64a4bbea9f7e03c49ae7b2a29684def2',dir:'buy',rate:1.08172,date:'2015-11-09T10:50:36.477Z',name:'EURCHF',amount:10000,remaining:10000,trader:'nicholas',status:'rejected',type:'market'}
,{_id:'8f829576b8ab0b087a2413620588f3d4',_rev:'1-f110b5621e6788dc6191d8258811a132',dir:'buy',rate:1.08149,date:'2015-11-09T10:52:33.898Z',name:'EURCHF',amount:10000,remaining:10000,trader:'nicholas',status:'rejected',type:'market'}
,{_id:'8f829576b8ab0b087a241362058901f8',_rev:'1-a7f483567cf9fe6242aa706c383ad6a3',dir:'buy',rate:1.08149,date:'2015-11-09T10:56:39.158Z',name:'EURCHF',amount:23,remaining:23,trader:'nicholas',status:'open',type:'market'}
,{_id:'8f829576b8ab0b087a24136205890733',_rev:'1-5b9d3650519cddf337a43f5df983f7d9',dir:'buy',rate:1.08147,date:'2015-11-09T10:56:48.358Z',name:'EURCHF',amount:23232323,remaining:23232323,trader:'nicholas',status:'rejected',type:'market'}
,{_id:'8f829576b8ab0b087a24136205890dc2',_rev:'1-8a87eebeaadb96bb3d2685cbf21fa6db',dir:'sell',rate:1.08113,date:'2015-11-09T10:57:49.433Z',name:'EURCHF',amount:2222222,remaining:2222222,trader:'nicholas',status:'rejected',type:'market'}
,{_id:'8f829576b8ab0b087a24136205890e7b',_rev:'1-af632c9fe3c65baa33ae34adb9e0b657',dir:'buy',rate:1.07792,date:'2015-11-10T10:14:10.699Z',name:'GBPJPY',amount:10000,remaining:0,trader:'nicholas',status:'executed',type:'market'}
]},
	
nicholasExposures:
{name:'nicholas',data:[{name:'GBP',amount:10000},{name:'USD',amount:0},{name:'EUR',amount:0},{name:'MYR',amount:0}]},
	
nicholasExecutions:{
rows:
[{value:{_id:'8f829576b8ab0b087a2413620583f980',_rev:'2-cf32cacb140167872279aa54f17cf009',dir:'buy',rate:0.71414,date:'2015-11-02T14:02:00.119Z',name:'EURGBP',amount:10000,remaining:0,trader:'nicholas',status:'executed',type:'market',executions:[{quantityFilled:10000,executionTime:'2015-11-02T14:02:14.074Z',executedPrice:0.71398,tradedFrom:'nicholas',tradedWith:'demo'}]}},
{value:{_id:'8f829576b8ab0b087a24136205840f47',_rev:'3-2555397f3b28d0253e515f4a5530930b',dir:'buy',rate:186.472,date:'2015-11-02T14:02:05.559Z',name:'GBPJPY',amount:10000,remaining:0,trader:'nicholas',status:'executed',type:'stop',executions:[{quantityFilled:10000,executionTime:'2015-11-02T14:02:14.598Z',executedPrice:186.465,tradedFrom:'nicholas',tradedWith:'demo'}]}},
,{value:{_id:'8f829576b8ab0b087a24136205845dd7',_rev:'2-b5f49c7d2a50d2f2181ac133521c86ed',dir:'sell',rate:0.72000,date:'2015-11-02T14:03:18.266Z',name:'EURGBP',amount:10000,remaining:0,trader:'nicholas',status:'executed',type:'market',executions:[{quantityFilled:10000,executionTime:'2015-11-02T14:03:18.339Z',executedPrice:0.72122,tradedFrom:'demo',tradedWith:'nicholas'}]}}
]},

defaultExposures:
{name:'default',data:[{name:'GBP',amount:0},{name:'USD',amount:0},{name:'EUR',amount:0},{name:'MYR',amount:0}]},

customOrders:{rows:[
	{value:{_id:'8f829576b8ab0b087a2413620588ef3d',_rev:'1-64a4bbea9f7e03c49ae7b2a29684def2',dir:'buy',rate:1.08172,date:'2015-11-09T10:50:36.477Z',name:'EURCHF',amount:10000,remaining:10000,trader:'nicholas',status:'pending',type:'stop'}
	}]}
}