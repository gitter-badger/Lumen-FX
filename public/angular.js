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

var loginURL = 'http://localhost:3000/login';
const PRIVATEKEY = "TheCitySecretLtdLumenFX";
/**
* Main app 
* handles index.ejs elements
*/
angular
	.module('mainApp',[])
      .service('appAPI', seneca.ng.web({prefix:'/api/'}))
      .service('appUser', seneca.ng.web({prefix:'/auth/'}))
      .service('appPubSub', seneca.ng.pubsub())
      .controller('showPriceCtrl',['$scope','$http','$q','appAPI','appPubSub','appUser','$rootScope',
								   function($scope,$http,$q,appAPI,appPubSub,appUser,$rootScope){						  
		var myPairs = [];						 
		$scope.predefinedPairs =[];
		$scope.selection = [];
		$scope.amount = [];
									   
	/**
	* quick buttons to add amount 
	* initialised to "0" if empty
	*/
	var setFocus = function(){
		 var element = document.getElementById("currencyInput" + $scope.selectedPair);
			if(element)
			element.focus();
	}
	
	var updateAmount = function(increment){
		if($scope.amount[$scope.selectedPair] != undefined){
			if($scope.amount[$scope.selectedPair] == "")
				$scope.amount[$scope.selectedPair] = "0";
				
		$scope.amount[$scope.selectedPair] = parseFloatIgnoreCommas($scope.amount[$scope.selectedPair]) + increment;
		$scope.amount[$scope.selectedPair] = displayAmount($scope.amount[$scope.selectedPair]);	
		
		setFocus();
		}
	}
		$scope.quickbtn100 = function() {
				updateAmount(100);
			}
		$scope.quickbtn1000 = function() {
				updateAmount(1000);
			} 
		$scope.quickbtn10000 = function() {
				updateAmount(10000)
			}
		$scope.quickbtn100000 = function() {
				updateAmount(100000);
			}
		$scope.quickbtn1000000 = function() {
				updateAmount(1000000);
			}
		$scope.quickbtnReset = function() {
				$scope.amount[$scope.selectedPair] = "0.00"
				setFocus();
			}

	var customOrder = [],
		orderAppWindow,
		tableAppWindow,
		pendingTask;
		$scope.hasValue = [];
	
	var init = function(){
		var deferred = $q.defer(),
			 promise = $http({
				method: 'GET',
				url: '/api/price/showPrice'
			})
			.success(function(data, status, headers, config) {
				deferred.resolve(data);  
			});
		return deferred.promise;
	}
	
	appAPI.get('order/showAvailablePairs',function(data){
		$scope.orderPredefinedPairs = data.data;
		$scope.orderPredefinedPairs.sort();
	})
	
	$scope.selected = function(name){
		$scope.selectedPair = name;
	}	
	
	/**
	* if user is not logged in, it goes to login page
	*/
	appUser.get('instance',function(data){
		appPubSub.pub('get-user',[data])
			if(data.user == undefined){
				$http.get('/login');
			}else{
				$scope.username = data.user.nick;
			}
		})
		
	appAPI.get('login/getCurrentTrader?privateKey=' + PRIVATEKEY + '&username=' + $scope.username,function(data){
		$scope.trader = data.data;
	})
	
	
	/**
	* retrieve the price from API every 500 ms
	* transform the price to display the day high & day low and spreads
	* calculate the latest price to display on the table
	* publish to get-api
	*/
	setInterval(function(){
		appAPI.get('price/showPrice',function(data){
			appPubSub.pub('get-api',[data])
		})},500);

	/**
	* subscribe to get-api
	* sub will be listening to pub when it is called
	*/
	appPubSub.sub('get-api',function(data){
	for(var i=0;i<data.data.length;i++){
		$scope.predefinedPairs[i] = data.data[i].id;}
		
		$scope.allPairs = data.data;
		$scope.myPairs = $scope.allPairs;

		var allPairs = $scope.allPairs;		
		if( myPairs.length > 0 )
			for (i = 0; i < allPairs.length; i++) {
				var pip = 10000;
					//get Last Price
					if (myPairs[i].rate > allPairs[i].rate) {
						myPairs[i].increase = false;
					}else if (myPairs[i].rate < allPairs[i].rate) {
						myPairs[i].increase = true;
					}else {
						myPairs[i].increase = "";
					}

					myPairs[i].ask  = allPairs[i].ask;
					myPairs[i].bid  = allPairs[i].bid;
					myPairs[i].rate = allPairs[i].rate;

					if (myPairs[i].ask - myPairs[i].bid >= 0.01)
						pip = 100;

					myPairs[i].spread = (allPairs[i].ask - allPairs[i].bid) * pip;
				
					if( myPairs[i].rate > 0 ){
						if (myPairs[i].rate > myPairs[i].high) {
							myPairs[i].high = parseFloat(myPairs[i].rate);
						}else if (myPairs[i].rate < myPairs[i].low) {
							myPairs[i].low = parseFloat(myPairs[i].rate);
						}
					}else{
						myPairs[i].high = 0;
						myPairs[i].low = 999;
						}
				myPairs[i].latestPrice = Math.abs(myPairs[i].rate - myPairs[i].low) / Math.abs(myPairs[i].high - myPairs[i].low);
				myPairs[i].latestPrice *= 50;
			}	
			$scope.myPairs = myPairs;
	})

	/**
	* save the local pairs to database
	* a http post
	*/
	var saveToShowPair = function(localPair){
		appAPI.post('setLocalPairs',localPair);
	}
	
	/**
	* initialise the saved local pairs from database
	* show the local pair which match to all available ccy pairs
	*/
	init().then(function(promise){
		myPairs = promise.data;
		setTimeout(function(){
			appAPI.get('login/getCurrentTrader?privateKey=' + PRIVATEKEY + '&username=' + $scope.username,function(data){
				var localPair = data.data.pairName;
				if ( localPair != undefined)
					for(var i=0;i<localPair.length;i++){
						for(var j=0;j<myPairs.length;j++){
							if(localPair[i] == myPairs[j].id){
								$scope.selection.push(localPair[i]);
								myPairs[j].show = true;
							}
						}
					}
				})
		},500);

		/**
		* initialised all the input amount to 10,000
		*/
		for(var i=0;i<myPairs.length;i++){
			$scope.amount[myPairs[i].name]  = displayAmount(10000);
			}
	})
	
	
	/**
	* the exit button on the top right of a ccy table
	* hides the ccy pairs by obj.show = false
	* removes the selected pairs from $scope.selection
	* save the changes to database
	*/
    $scope.exit = function exit(pair) {
        var idx = $scope.selection.indexOf(pair.id),
			obj = getObject(pair.id);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
            obj.show = false;
            if ($scope.selection.length === 0)
                $scope.selection = [];
        }
		saveToShowPair($scope.myPairs);
    }
	
	/**
	* select all available ccy pairs to be displayed
	* set the .show to true
	* save the changes to database
	*/
    $scope.selectAll = function() {
        if ($scope.selection.length < $scope.predefinedPairs.length) {
			$scope.selection = [];
            for (i = 0; i < $scope.predefinedPairs.length; i++){
				$scope.selection.push($scope.predefinedPairs[i]);
                $scope.myPairs[i].show = true;
            }
        } else {
			$scope.selection = [];
            for (i = 0; i <  $scope.predefinedPairs.length; i++) {
                $scope.myPairs[i].show = false;
            }
        }
		saveToShowPair($scope.myPairs);
    }
	
    var getObject = function(pairName) {
		for (i = 0; i <  $scope.predefinedPairs.length; i++) {
            if (pairName == $scope.predefinedPairs[i]) {
				return $scope.myPairs[i];
            }
        }
    }
	
	/**
	* toogle the ccy pairs to be displayed
	* add new pairs to the selection to display
	* save changes to database
	*/
    $scope.toggleSelection = function (pairName) {
        var idx = $scope.selection.indexOf(pairName),
			obj = getObject(pairName);
		
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
            obj.show = false;
        }
        // is newly selected
        else {
            $scope.selection.push(pairName);
            obj.show = true;
        }
		saveToShowPair($scope.myPairs);
    }
	
	/**
	* creates an external table windows
	* displaying the tables with animations
	* post the selected pair for query at table page
	*/
	$scope.showTable = function (pair){
		appAPI.post('setCurrentPair',{id:pair})
		var mainWindow = fin.desktop.Window.getCurrent(),
			tableWindowConfig = {
				defaultHeight: 325,
				defaultWidth: 1000,
				maxWidth: 1000,
				maxHeight: 350,
				resizable:true,
				};
		  tableAppWindow = windowFactory.create(utils.extend(tableWindowConfig, {
                name: 'table' + pair.id,
                url: 'views/table.html'
            }));
		
		 animations.showWindow(tableAppWindow, [mainWindow]);
	}
	
    $scope.sortType = 'date'; // set the default sort type
    $scope.sortReverse = true;  // set the default sort order
    $scope.tableData = [];	
	
	/**
	* get current trader's orders
	* publish to set-table-data
	* display orders with directives at orderChart
	*/
	$scope.$watch('username',function(newV,oldV){
			if(newV != undefined)	
				appAPI.get('order/getMyOrders?privateKey=' + PRIVATEKEY + '&username=' + $scope.username,function(data){
					appPubSub.pub('set-table-data',[data]);
					$scope.allData = data.data;
			})
	})
	
	/**
	* populates the orders into allData
	* hasValue to display the the orders which contains at least an order
	*/
	appPubSub.sub('set-table-data',function(data){
            $scope.allData = data.data;
		
			$scope.allData.forEach(function(results){
				$scope.hasValue[results.name] = false;
				if($scope.hasValue[results.name] != undefined){
					$scope.hasValue[results.name] = true;
				}
				
			})
		})
	
	$scope.display = function(){
		
		if($scope.amount[$scope.selectedPair] != undefined)
			$scope.amount[$scope.selectedPair] = displayAmount(parseFloatIgnoreCommas($scope.amount[$scope.selectedPair]));
		
		if(isNaN(parseFloatIgnoreCommas($scope.amount[$scope.selectedPair])))
		   $scope.amount[$scope.selectedPair] = "0.00";
	}
	

	/**
	* real-time, concurrency listener
	*/
	// Send the ready event.
	// Listen for the new visitor event.
	io = io.connect()
	// Emit ready event with room name.
	// Listen for the announce event.
	io.on('new order', function(data) {
			if ( data.data.tradedFrom == $scope.username){
					notification("Execution triggered");
						setTimeout(function(){
						 appAPI.get('order/getMyOrders?privateKey=' + PRIVATEKEY+'&username=' + $scope.username,function(data){
							appPubSub.pub('set-table-data',[data]);
						 })
					appAPI.get('order/getMyExposures?privateKey=' + PRIVATEKEY +'&username=' + $scope.username,function(data){
							if (data.name == $scope.username)
								appPubSub.pub('set-exposure-data',[data]);
						 })
						appAPI.get('order/calculateProfitLoss?username=' + $scope.username,function(data){
							appPubSub.pub('get-profit-data',[data]);
						})
						publishInterApp('insertOrder',"Updated Table Data");	
				},300)
			}
		})

	if(typeof(fin) != "undefined"){
		fin.desktop.main(function() {
				fin.desktop.InterApplicationBus.subscribe('*', 'insertOrder',
					function(){		
					setTimeout(function(){
					 appAPI.get('order/getMyOrders?privateKey=' + PRIVATEKEY +'&username=' + $scope.username,function(data){
						appPubSub.pub('set-table-data',[data]);
					 })
					appAPI.get('order/getMyExposures?privateKey=' + PRIVATEKEY +'&username=' + $scope.username,function(data){
						appPubSub.pub('set-exposure-data',[data]);
					 })
					appAPI.get('order/calculateProfitLoss?username=' + $scope.username,function(data){
						appPubSub.pub('get-profit-data',[data]);
					})
				},150)
			})
		})
	}
	
	$scope.insertBuyOrder = function(pair,amount){
		if(pendingTask) {
			clearTimeout(pendingTask);
			}
		pendingTask = setTimeout(function(){
				insertOrder("buy",pair.ask,pair.id,amount,$scope.username,"open","market",$http);
		}, 400);
		if(amount == "")
			$scope.amount[pair.id] = "0.00";
		else
			$scope.amount[pair.id] = displayAmount(parseFloatIgnoreCommas(amount));
	}
		

	$scope.insertSellOrder = function(pair,amount){
		if(pendingTask) {
			clearTimeout(pendingTask);
		}
		pendingTask = setTimeout(function(){
			insertOrder("sell",pair.bid,pair.id,amount,$scope.username,"open","market",$http)
		}, 400);
		
		if(amount == "")
			$scope.amount[pair.id] = "0.00";
		else
			$scope.amount[pair.id] = displayAmount(parseFloatIgnoreCommas(amount));
	}
	
	/**
	* creates a window for advance order 
	* post the selected pair for advance order to advance order page
	*/
	$scope.advanceOrder = function(pair){
	appAPI.post('setCurrentPair',pair)
		var mainWindow = fin.desktop.Window.getCurrent(),
			draggableArea = document.querySelector('.container'),
		    limitWindowConfig = {
					defaultHeight: 300,
					defaultWidth: 300,
					maxWidth: 300,
					maxHeight: 300,
					resizable:false,
				};
		  orderAppWindow = windowFactory.create(utils.extend(limitWindowConfig, {
                name: 'customOrder' + pair.id,
                url: 'views/customOrder.html'
            }));	
		animations.showWindow(orderAppWindow, [mainWindow]);
	}
	/**
	* closes all children window upon logout
	*/
	$rootScope.$on('logout', function (event, data) {
		if(orderAppWindow != undefined)
	 		orderAppWindow.close();
		if(tableAppWindow != undefined)
		 	tableAppWindow.close();
	})
	
}])
 	  .controller('showRight',function($scope,$rootScope){
		$scope.showExposure = true;
	
	/**
	* close all children window upon logging out
	*/
		$scope.logout = function(){
		$rootScope.$broadcast('logout', {
			someProp: 'logout' // send whatever you want
		});	
	}
})
	  .controller('exposuresCtrl',
				  function($scope,$http,appAPI,appPubSub,appUser){
	
		appUser.get('instance',function(data){
			appPubSub.pub('get-user',[data])
			$scope.username = data.user.nick;
		})
	
		$scope.$watch('username',function(newV,oldV){

			if(newV != undefined)	
				appAPI.get('order/getMyExposures?privateKey=' + PRIVATEKEY +'&username=' + $scope.username ,function(data){
				renderData(data);
			})
		})
		
		appPubSub.sub('set-exposure-data',function(data){
				initialised = false;
			   renderData(data);
			})
	
		var renderData = function(data){
			$scope.myExposure = [];
			$scope.args = [];
			$scope.hasValue = false;
			
			$scope.netExposures = data.data;
		/**
		* hasValue shows the table for position if the trader holds at least one position 
		*/
		$scope.netExposures.forEach(function(doc){
			if(doc.amount != 0){
				$scope.hasValue = true;
				}
		})
	}
})
 	  .controller('tradingLimitCtrl',
				  function($scope,$http,appAPI,appPubSub,appUser){

	appUser.get('instance',function(data){
		appPubSub.pub('get-user',[data])
		$scope.username = data.user.nick;
	})
	
	$scope.limits = [];
	$scope.$watch('username',function(newV,oldV){
			if(newV != undefined)	
		appAPI.get('login/getCurrentTrader?privateKey=' + PRIVATEKEY + '&username=' + $scope.username,function(data){
			renderData(data.data)
			$scope.trader = data.data;
		})
	})
		
	var renderData = function(data){
			$scope.limits = [];
			$scope.limit = [];
			if ( data.tradingLimits != undefined){
				$scope.myLimits = data.tradingLimits;
				$scope.limits = $scope.myLimits;
				
				for(var i=0;i<$scope.limits.length;i++){
					$scope.limit[$scope.limits[i].name] = displayAmount($scope.limits[i].limit);
				}
			}
		}
	
	$scope.saveLimit = function(){
		for (i=0;i<$scope.limits.length;i++){
		

			
			$scope.limits[i].limit = parseFloatIgnoreCommas(validateAmount($scope.limit[$scope.limits[i].name]));
					if ( isNaN($scope.limits[i].limit) )
							$scope.limits[i].limit = 0;
			$scope.limit[$scope.limits[i].name] = displayAmount($scope.limits[i].limit);
		}
			appAPI.post('setTradingLimits',$scope.limits)
	}

})
	  .controller('profitCtrl',
				  function($scope,$http,appAPI,appPubSub,appUser){
		
	appUser.get('instance',function(data){
			appPubSub.pub('get-user',[data])
			$scope.username = data.user.nick;
		})

	appAPI.get('price/showPrice',function(data){
			if($scope.predefinedPairs == undefined){
					$scope.predefinedPairs = [];

				for(var i=0;i<data.data.length;i++){
					$scope.predefinedPairs[i] = data.data[i];
					}
				}else{
					console.log("defined");
				}
		})
		
	$scope.$watch('username',function(newV,oldV){
			if(newV != undefined)	
				appAPI.get('order/calculateProfitLoss?username=' + $scope.username,function(data){
					renderData(data);
				})
	})
	
	$scope.sortType = 'name'; // set the default sort type
    $scope.sortReverse = false;  // set the default sort order
	
	appPubSub.sub('get-profit-data',function(data){
		renderData(data);
	})
	
	var renderData = function(data){
		$scope.netProfit = [];
		$scope.hasValue = false;
		$scope.netProfit = data.profit;
	
		$scope.netProfit.forEach(function(doc){
			if(doc.amount != 0){
				$scope.hasValue = true;
			}
		})
	}
})
	  .directive('liveChart', 
				 function($parse, $window,appAPI,appPubSub){
	    var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;
    return {
        restrict: 'EA',
        template: "<svg width='250' class='chart' height='50'></svg>",
        link: function(scope, elem, attrs) {

            var exp = $parse(attrs.chartData);
            var margin = {
                    top: 5,
                    right: 5,
                    bottom: 10,
                    left: 5
                },
                width = 250 - margin.left - margin.right,
                height = 40 - margin.top - margin.bottom;

            var scopeData = exp(scope);
			var dataToPlot = [];
			scope.initialised = false;
			var allData;
			
			appAPI.get('history/showTrendData',function(data){
					appPubSub.pub('showTrendData',[data]);
				})
				
			setInterval(function(){
			appAPI.get('history/showTrendData',function(data){
					appPubSub.pub('showTrendData',[data]);
				})
			},5 * 60 * 1000)
		
		appPubSub.sub('showTrendData',function(data){
			dataToPlot = [];
				allData = data.data;
						allData.forEach(function(doc){
							if(scopeData.id == doc.name){
								for (var i=0;i<doc.data.length;i++){
									dataToPlot.push([i,doc.data[i].rate])
								}
							}
					})
				redrawLineChart();
			})
				
            var pathClass = "path";
            var xScale, yScale, xAxisGen, yAxisGen, lineFun;
			
            var d3 = $window.d3;
            var rawSvg = elem.find('svg');
            var svg = d3.select(rawSvg[0])
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + 5 + "," + margin.top + ")");

            function setChartParameters() {
                xScale = d3.scale.linear()
                    .range([0, width]);


                yScale = d3.scale.linear()
                    .range([height, 0]);

                xAxisGen = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom");

                yAxisGen = d3.svg.axis()
                    .scale(yScale)
                    .orient("left");

                xScale.domain(d3.extent(dataToPlot, function(d) {
                    return d[0];
                }));
				
                yScale.domain(d3.extent(dataToPlot, function(d) {
                    return d[1];
				}));


                lineFun = d3.svg.line()
                    .x(function(d) {
                        return xScale(d[0]);
                    })
                    .y(function(d) {
                        return yScale(d[1]);
                    });
            }

            function drawLineChart() {
                setChartParameters();
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")");
                svg.append("g")
                    .attr("y", 6)
                    .attr("dy", ".50em")
                    .style("text-anchor", "end");
                svg.append("svg:path")
                    .attr({
                        d: lineFun(dataToPlot),
                       "stroke": "#1684B9",
					   "stroke-width": 1.25,
                        "fill": "none",
                        "class": pathClass
                    });
            }

            function redrawLineChart() {
                setChartParameters();
                svg.selectAll("g.y.axis").call(yAxisGen);
                svg.selectAll("g.x.axis").call(xAxisGen);
                svg.selectAll("." + pathClass)
                    .attr({
                        d: lineFun(dataToPlot)
                    });
            }
            drawLineChart();
        }
    };
})
	  .directive('linearChart', 
				 function($parse, $window){
	    var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;
    return {
        restrict: 'EA',
        template: "<svg width='300' class='chart' height='50'></svg>",
        link: function(scope, elem, attrs) {

            var exp = $parse(attrs.chartData);
            var margin = {
                    top: 5,
                    right: 5,
                    bottom: 10,
                    left: 5
                },
                width = 150 - margin.left - margin.right,
                height = 50 - margin.top - margin.bottom;

            var dataToPlot = exp(scope);
			var data = [];
			for(var i=0;i<dataToPlot.length;i++){
				if(dataToPlot[i].rate != null){
					data.push([i,dataToPlot[i].rate]);	
				}
			}
			
			dataToPlot = data;
				
            var pathClass = "path";
            var xScale, yScale, xAxisGen, yAxisGen, lineFun;
			
            var d3 = $window.d3;
            var rawSvg = elem.find('svg');
            var svg = d3.select(rawSvg[0])
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + 5 + "," + margin.top + ")");

            function setChartParameters() {

                xScale = d3.scale.linear()
                    .range([0, width]);

                yScale = d3.scale.linear()
                    .range([height, 0]);

                xAxisGen = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom");

                yAxisGen = d3.svg.axis()
                    .scale(yScale)
                    .orient("left");

                xScale.domain(d3.extent(dataToPlot, function(d) {
                    return d[0];
                }));
                yScale.domain(d3.extent(dataToPlot, function(d) {
                    return d[1];
                }));


                lineFun = d3.svg.line()
                    .x(function(d) {
                        return xScale(d[0]);
                    })
                    .y(function(d) {
                        return yScale(d[1]);
                    });
            }

            function drawLineChart() {
                setChartParameters();
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")");
                svg.append("g")
                    .attr("y", 6)
                    .attr("dy", ".50em")
                    .style("text-anchor", "end");
                svg.append("svg:path")
                    .attr({
                        d: lineFun(dataToPlot),
                       "stroke": "#1684B9",
					   "stroke-width": 1.25,
                        "fill": "none",
                        "class": pathClass
                    });
            }

            function redrawLineChart() {
                setChartParameters();
                svg.selectAll("g.y.axis").call(yAxisGen);
                svg.selectAll("g.x.axis").call(xAxisGen);
                svg.selectAll("." + pathClass)
                    .attr({
                        d: lineFun(dataToPlot)
                    });
            }
            drawLineChart();
        }
    };
})
	  .directive('barChart', 
				 function($parse, $window){
    return {
        restrict: 'EA',
        template: "<svg width='280' class='chart' height='400'></svg>",
        link: function(scope, elem, attrs) {
			
            var exp = $parse(attrs.chartData);
            var margin = {
                    top: 5,
                    right: 5,
                    bottom: 10,
                    left: 5
                },
                width = 280,
                height = 400;
			
			 var d3 = $window.d3;
            var rawSvg = elem.find('svg');
       
			var currency= [];
			var amount = [];

   		var dataToPlot = exp(scope);
			
			for(var i=0;i<dataToPlot.length;i++){
				if(parseFloat(dataToPlot[i].amount) != 0){
					currency.push(dataToPlot[i].name);
					if(dataToPlot[i].rate != undefined){
						amount.push(parseFloat((dataToPlot[i].amount).toFixed(2)));
					}
					else{
						amount.push(parseFloat(dataToPlot[i].amount.toFixed(2)));
					}
				}
			}
			if (amount.length < 5)
				height = 200;

			var xscale,yscale,xAxis,yAxis,grid,tickVals,x_xis,y_xis,chart,inner,transit,transittext,updatebar,myText;
			var max = d3.max(amount);
			var min = d3.min(amount);
			var initialised = false;
			var colors = ['#6BEE6B','#F78787'];
			var center = 100;

            var svg = d3.select(rawSvg[0])
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + 5 + "," + 0 + ")");

		scope.$watchCollection(exp,function(newV,oldV){
		
			var previous = amount;
			amount = [];
			currency = [];
			
			for(var i=0;i<newV.length;i++){
				if(parseFloat(newV[i].amount) != 0){
					currency.push(newV[i].name);
					if(newV[i].rate != undefined){
						amount.push(parseFloat((newV[i].amount).toFixed(2)));
					}
					else{
						amount.push(parseFloat(newV[i].amount.toFixed(2)));
					}
				}	
			}
	
			 max = d3.max(amount);
			 min = d3.min(amount);
			
			setTimeout(function(){
			if (amount.length != previous.length && initialised == true){	
				svg.selectAll("rect").remove();
				svg.selectAll("text").remove();
				drawBarChart();
			}
			
			if(amount.length != 0 && initialised != true ){
					drawBarChart();
					initialised = true;
			}
				redraw();
			},400)
		})
		

	function drawBarChart() {

       	 grid = d3.range(currency.length).map(function(i){
			return {'x1':0,'y1':0,'x2':0,'y2':0};
		});

		 tickVals = grid.map(function(d,i){
			if(i>0){ return i*10; }
			else if(i===0){ return "100";}
		});
		
		 xscale = d3.scale.linear()
						.domain([d3.min(amount),d3.max(amount)])
						.range([0,center]) 
						.nice();
		
		 yscale = d3.scale.linear()
						.domain([0,currency.length])
						.range([25,amount.length * 50]);
		
			xAxis = d3.svg.axis();
			xAxis
				.orient('bottom')
				.scale(xscale)
				.tickValues(tickVals);

			yAxis = d3.svg.axis();
			yAxis
				.orient('left')
				.scale(yscale)
				.tickSize(0) // for the vertical line beside the y Axis
				.tickFormat(function(d,i){ return currency[i]; })
				.tickValues(d3.range(currency.length))
	
		 y_xis = svg.append('g')
			  .attr("transform", "translate(240,25)")
			  .attr('id','yaxis')
			  .style({'font-size':'11px'})
			  .call(yAxis);

		 x_xis = svg.append('g')
						  .attr("transform", "translate(0,0)")
						  .attr('id','xaxis');
	

		 chart = svg.append('g')
							.attr("transform", "translate(50,0)")
							.attr('id','bar')
							.selectAll('rect')
							.data(amount)
							.enter()
							.append('rect')
							.attr('height',13)
							.attr({'x':function(d,i){
									return center;}
							,'y':function(d,i){ return yscale(i); }})
							.style('fill',function(d,i){ 
								if(amount[i] > 0){
									return colors[0];}
								else{
									return colors[1];}
							})
							.attr('width',0);
		
		 inner = svg.append('g')
							.attr("transform", "translate(50,0)")
							.attr('id','inner')
							.style('z-index',-1)
							.selectAll('rect')
							.data(amount)
							.enter()
							.append('rect')
							.attr('height',13)
							.attr({'x':function(d,i){
									return 0;}
							,'y':function(d,i){ return yscale(i); }})
							.style('fill',function(d,i){ 
								return "rgba(200,200,200,0.3)";
							})
							.attr('width',200);
		
		 transit = d3.select("svg").selectAll("rect")
						    .data(amount)
						    .transition()
						    .duration(1000) 
							.attr("x", function(d, i) {
								if(d < 0){
									if( d == min ){
										return d3.min([0,(xscale(min)-xscale(d))]);
									}else{
										return center - Math.abs((d/min)) * center;}
								}
								else{
								return center;}
							})
							.attr("width", function(d, i) { 
								if( d < 0){
									return Math.abs(d/min * center); }
								else if (d == 0 ){
									return 0;
								}else{
									return Math.abs(d/max * center);}
							});			
         }
		
	function redraw(){
		
			xscale = d3.scale.linear()
						.domain([d3.min(amount),d3.max(amount)])
						.range([0,center]) 
						.nice();
		
			yscale = d3.scale.linear()
						.domain([0,currency.length])
						.range([25,amount.length * 50]);
		
		 	updatebar = svg.selectAll("rect")
					.data(amount)
					.transition()
					.duration(1000)
					.attr("x", function(d, i) {
								if(d < 0){
									if( d == min ){
										return d3.min([0,(xscale(min)-xscale(d))]);
									}else{
										return center - Math.abs((d/min)) * center;}
								}
								else{
								return center;}
							})
						.style('fill',function(d,i){ 
								if(amount[i] > 0){
									return colors[0];}
								else{
									return colors[1];}
						})
						.attr("width", function(d, i) {
								if( d < 0){
									return Math.abs(d/min * center); }
								else if (d == 0){
									return 0;
								}else{
									return Math.abs(d/max * center);}
							});
		
		
	    myText = d3.select('#bar')
			.selectAll('text')
			.data(amount)
			.transition()
			.duration(300)
			.style("opacity", 0)
			.transition().duration(300)
			.style("opacity", 1)
			.text(function(d,i){ 
					if( dataToPlot[0].rate == undefined)
							return displayAmount(d );
						  else
							return displayAmount(d ,currency[i].substr(0,3)); })
			.style({'color':'#4597BF','font-size':'12px'});	
		}

		}
    };
})
	  .directive('orderChart', 
				 function($parse, $window){
    return {
        restrict: 'EA',
        template: "<svg width='200' class='chart' height='180'></svg>",
        link: function(scope, elem, attrs) {
			
            var exp = $parse(attrs.chartData);
            var margin = {
                    top: 5,
                    right: 5,
                    bottom: 5,
                    left: 5
                },
                width = 200,
                height = 170;
			var center = 100;
			
			 var d3 = $window.d3;
            var rawSvg = elem.find('svg');
			
			var amount = [];
			var status = [];
			var maxLength ;
			var dataToPlot = exp(scope);
			var name ;
			var initialised = [];
			
			if( dataToPlot.length < maxLength)
				maxLength = dataToPlot.length;
			if(dataToPlot[0] != undefined){
				name = dataToPlot[0].name;
				initialised[name] = false;
			}
			
			var xscale,yscale,xAxis,yAxis,tickVals,x_xis,y_xis,chart,transit,updatebar;
			var max = d3.max(amount);
			var min = d3.min(amount);
			
			var colors = ['#6BEE6B','#F78787','#2B2929'];

            var svg = d3.select(rawSvg[0])
                .attr("width", width)
                .attr("height", height)
                .append("g")

		scope.$watchCollection(exp,function(newV,oldV){

			amount = [];
			status = [];
			maxLength = 35;

			if( newV.length < maxLength)
				maxLength = newV.length;
			
			for(var i=0;i<maxLength;i++){
				if(parseFloat(newV[i].amount) != 0 ){
					status.push(newV[i].status);
					if(newV[i].dir == "sell"){
						amount.push(parseFloat((newV[i].amount * -1).toFixed(2)));
					}
					else{
						amount.push(parseFloat(newV[i].amount.toFixed(2)));
					}
				}	
			}
			 max = d3.max(amount);
			 min = d3.min(amount);
			
	
			setTimeout(function(){
				if(amount.length != 0 && initialised[name] != true ){		
					drawBarChart();
					initialised[name]= true;
					redraw();
				}
			
			//when length changes
			
				if( initialised[name] == true && newV.length != oldV.length){
					svg.selectAll("rect").remove();
					initialised[name] = false; 
					drawBarChart();
					redraw();		
				}
			},500)
	})
	
	function drawBarChart() {

		 xscale = d3.scale.linear()
						.domain([d3.min(amount),d3.max(amount)])
						.range([0,center]) 
						.nice();
		
		 yscale = d3.scale.linear()
						.domain([0,amount.length])
						.range([25, d3.min([180, amount.length * 25])])
		 				.nice();
		
			xAxis = d3.svg.axis();
			xAxis
				.orient('bottom')
				.scale(xscale)
				.tickValues(tickVals);

			yAxis = d3.svg.axis();
			yAxis
				.orient('left')
				.scale(yscale)
				.tickSize(0) // for the vertical line beside the y Axis
				.tickFormat(function(d,i){ return amount[i]; })
				.tickValues(d3.range(amount.length));
	
		 y_xis = svg.append('g')
			  .attr("transform", "translate(0,-18)")
			  .attr('id','yaxis' + name)
			  .style({'fill':'black','font-size':'10px'})
			 // .call(yAxis);

		 x_xis = svg.append('g')
						  .attr("transform", "translate(0,0)")
						  .attr('id','xaxis' + name);
		
		 chart = svg.append('g')
							.attr("transform", "translate(0,-18)")
							.attr('id','bar' + name)
							.selectAll('rect')
							.data(amount)
							.enter()
							.append('rect')
							.attr('height',function (d){
		 							if(maxLength < 10)
										return 10;
									else if (maxLength < 20)
										return 5;
									else
										return 3;
		 					})
							.attr({'x':function(d,i){
									return center;}
							,'y':function(d,i){ return yscale(i)+3; }})
							.style('fill',function(d,i){ 
								if(status[i] == "rejected"){
									return colors[2];
							  }else{
								if(amount[i] > 0){
									return colors[0];
								}else{
									return colors[1];
								}
							  }
							})
							.attr('width',0);
		
		 transit = d3.select("svg").selectAll("rect"+ name)
						    .data(amount)
						    .transition()
						    .duration(1000) 
							.attr("x", function(d, i) {
								if(d < 0){
									if( d == min ){
										return d3.min([0,(xscale(min)-xscale(d))]);
									}else{
										return center - Math.abs((d/min)) * center;}
								}
								else{
								return center;}
							})
							.attr("width", function(d, i) {
								if( d < 0){
									return Math.abs(d/min * center); }
								else if (d == 0){
									return 0;
								}else{
									return Math.abs(d/max * center);}
							});
         		}
	
	function redraw(){
		
			xscale = d3.scale.linear()
						.domain([d3.min(amount),d3.max(amount)])
						.range([0,center]) 
						.nice();
		
			yscale = d3.scale.linear()
						.domain([0,amount.length])
						.range([25, height]);
		
		 	updatebar = svg.selectAll("rect")
					.data(amount)
					.transition()
					.duration(1000)
					.attr("x", function(d, i) {

								if(d < 0){
									if( d == min ){
										return d3.min([0,(xscale(min)-xscale(d))]);
									}else{
										return center - Math.abs((d/min)) * center;}
								}
								else{
								return center;}
							})
						.style('fill',function(d,i){ 
							if(status[i] == "rejected"){
									return colors[2];
							  }else{
								if(amount[i] > 0){
									return colors[0];}
								else{
									return colors[1];
								}
							  }
						})
						.attr("width", function(d, i) {
								if( d < 0){
									return Math.abs(d/min * center); }
								else if (d == 0){
									return 0;
								}else{
									return Math.abs(d/max * center);}
							});
					}
			}
    	};
})
	  .directive('validNumber', 
				 function(){
	  return {
		require: '?ngModel',
		link: function(scope, element, attrs, ngModelCtrl) {
		  if(!ngModelCtrl) {
			return; 
		  }
			
		  ngModelCtrl.$parsers.push(function(val) {
			if (angular.isUndefined(val)) {
				var val = '';
			}
			var clean = val.replace( /[^0-9,.]+/g, '');
			if (val !== clean) {
			  ngModelCtrl.$setViewValue(clean);
			  ngModelCtrl.$render();
			}
			return clean;
		  });

		  element.bind('keypress', function(event) {
			  //char = space
			if(event.keyCode === 32) {
			  event.preventDefault();
			}
		  });
		}
	  }
	})
	  .filter("largeFont",['$sce', 
							function($sce) {
		  return function(input) {
			  output = enlargeText(input);
			//strict contextual escaping
			return $sce.trustAsHtml(output);
    };
}])
	  .filter('capitalize', function(){
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
})
/**
* Sub app 
* handles other sub views such as candleChart, login, registration, table
*/
angular
	  .module('subApp',[])
	  .factory('$remember', function() {
		return function(values) {

			var cookie = values +';';
			var date = new Date();
			date.setDate(date.getDate() + 10);

			cookie += 'expires=' + date.toString() + ';';

			document.cookie = cookie;
		}
	}) 
	  .factory('$forget', function() {
		return function(value) {
			var cookie = value + ';';
			cookie += 'expires=' + (new Date()).toString() + ';';
			document.cookie = cookie;
		}
	})
      .service('appAPI', seneca.ng.web({prefix:'/api/'}))
      .service('appUser', seneca.ng.web({prefix:'/auth/'}))
      .service('appPubSub', seneca.ng.pubsub())
	  .controller('tableCtrl',function($scope,$http,appAPI,appPubSub,appUser){

	fin.desktop.main(function() {
		fin.desktop.InterApplicationBus.subscribe('*', 'insertOrder',
		function(){									  
			setTimeout(function(){
				appAPI.get('order/getMyOrders?privateKey=' + PRIVATEKEY + '&username=' + $scope.username,function(data){
				appPubSub.pub('set-table-data',[data]);
			})
			},100)
		})	
	})

	appUser.get('instance',function(data){
			appPubSub.pub('get-user',[data])
			if(data.user == undefined){
				$http.get('/login');}
			else{
			$scope.username = data.user.nick;
			}
		})

	$scope.tableData = [];	
	$scope.sortType = 'date'; // set the default sort type
	$scope.sortReverse = true;  // set the default sort order
	$scope.search = '';
	
	appAPI.get('order/showCurrentPair',function(data){
		appPubSub.pub('showPair',[data])
		$scope.pairs = data.data.id;
		$scope.search = $scope.pairs;
		oriValue = $scope.price;
	})

	appAPI.get('login/getCurrentTrader?privateKey=' + PRIVATEKEY + '&username=' + $scope.username,function(data){
		$scope.trader = data.data;
	})
	
	$scope.$watch('username',function(newV,oldV){
			if(newV != undefined)	
				appAPI.get('order/getMyOrders?privateKey=' + PRIVATEKEY + '&username=' + $scope.username,function(data){
					appPubSub.pub('set-table-data',[data]);
					$scope.tableData = data.data;
			})
	})
		
	appPubSub.sub('set-table-data',function(data){
            $scope.tableData = data.data;
		})
	})
	  .controller('loginCtrl', function($scope, $http,$remember,$forget,appAPI) {
	
	$scope.validated = false;
	$scope.username = document.cookie;
	
	$scope.$watchCollection("[username,password]",function(newV,oldV){
		if(newV[0] != undefined && newV[1] != undefined){
			
			if(newV[0].length > 2){
				$scope.userDivClass = "";
				$scope.userClass = "";
			}else{
				$scope.userDivClass = "has-error has-feedback";
				$scope.userClass = "glyphicon glyphicon-remove form-control-feedback";
			}
			
			if(newV[1].length > 3){
				$scope.passDivClass = "";
				$scope.passwordClass = "";
			}else{
				$scope.passDivClass = "has-error has-feedback";
				$scope.passwordClass = "glyphicon glyphicon-remove form-control-feedback";	
			}
			
			if(newV[0].length > 2 && newV[1].length > 3){
				$scope.username = newV[0].trim();
				$scope.validated = true;
			}else{	
				$scope.validated = false;
			}
		}
	})
	
	$scope.$watch('remember',function(oldV,newV){
		if ($scope.remember === true){
			$remember($scope.username);}
		else{
			$forget($scope.username);
		}
	})

	$scope.login = function(){
	if ($scope.remember === true){
			$remember($scope.username);}
		else{
			$forget($scope.username);
		}
		if($scope.username.length == 0 || $scope.password.length < 3){
			$scope.username = "failed";
			$scope.password = "failed";
		}
		
	$http.post("/auth/login",{name:$scope.username.toLowerCase(),password:$scope.password})
}

})	
	  .controller('registerCtrl', ['$scope', '$http','$window', 
								   function($scope, $http,$window) {
 
	var insertTrader = function(trader) {
	$http.post('/SaveNewTraderToDataBase', trader).success(function(response) {

	if( response.status == false){
		alert("username in use");
	}else{
		alert("Registration Successful,You will be redirected.");	
	}

	}).error(function(err){
	console.log(err);
	})};

	var validateString = function (a,b){
	var flag = false;  
		if (a === b ){
			flag = true;
		}else{
			flag = false;
		}  
	return flag;
	}

        $scope.addTrader = function() {
		
			
        if(!$scope.tickpass){
        	$scope.error = "**";
        }
        if(!$scope.tickemail){
			$scope.erroremail = "**";
        }
        if ($scope.tickemail && $scope.tickpass){
				alert("Registration Successful");
				var encrypted = CryptoJS.AES.encrypt($scope.password, "TCS");
			$scope.trader = {   firstname: $scope.firstname,lastname:$scope.lastname,
							 	email:$scope.email, username:$scope.username.toLowerCase(),
					 			password:encrypted.toString()};
			insertTrader($scope.trader);
			$window.location.href = loginURL;
            }
        }
    
        $scope.tickemail = false;
        $scope.email = [];
        $scope.$watchCollection ("[confirmemail,email]",function(newValue,oldValue){
        $scope.erroremail = "";
        if($scope.email.length > 5 && validateString($scope.confirmemail,$scope.email))
        {
        	$scope.tickemail= true;
        }
        else{
        	$scope.tickemail = false;}
        })
    
        $scope.tickpass = false;
        $scope.password = [];
        $scope.$watchCollection("[confirmpassword,password]",function(newValue,oldValue){
        $scope.error = "";
			  
        if($scope.password.length > 5 && validateString($scope.confirmpassword,$scope.password))
        {
        	$scope.tickpass= true;
        }
        else{
        	$scope.tickpass = false;}
        })
}])
	  .controller('customOrderCtrl',function($scope,$http,appAPI,appPubSub,appUser){
	
	self.focus();
	$scope.direction = "buy";
	$scope.orderType = "limit";
	$scope.expiry = ["1 hour","2 hours","4 hours","1 day","1 week"];
	$scope.expiryDate = "1 day";
	$scope.stop = "btnclicked";
	$scope.orderType = "stop";

	var oriValue,
		now = new Date(); 
	now.setDate(now.getDate() + 1);
	$scope.date = now.getFullYear() + "-" + (now.getMonth() +1) + "-" + now.getDate();
	$scope.time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
	
	$scope.setType = function(type){
		$scope.orderType = type;
			if( type == "stop"){
				$scope.limit = "";
				$scope.stop = "btnclicked";
			}else{
				$scope.stop	 = "";
				$scope.limit = "btnclicked";
			}
	}

	appAPI.get('price/showCurrentPair',function(data){
		appPubSub.pub('showPair',[data])
		$scope.pairs = data.data;
		$scope.amount = displayAmount(10000);
   		$scope.price = parseFloat($scope.pairs.rate.toFixed(5));
		oriValue = $scope.price;
	})

	appUser.get('instance',function(data){
		appPubSub.pub('get-user',[data])
		$scope.username = data.user.nick;
	})
	
	$scope.$watch('price',function(newV,oldV){
		if(newV == null)
			$scope.price = oriValue;
	})
	/*
	
	$scope.$watch('expiryDate',function(newV,oldV){
		now = new Date();
		switch(newV){
			case "1 hour":
				now.setHours(now.getHours() + 1);
				break;
			case "2 hours":
				now.setHours(now.getHours() + 2);
				break;
			case "4 hours":
				now.setHours(now.getHours() + 4);
				break;
			case "1 day":
				now.setDate(now.getDate() + 1);
				break;
			case "1 week":
				now.setDate(now.getDate() + 7);
				break;
				
		}
		$scope.date = now.getFullYear() + "-" + (now.getMonth() +1) + "-" + now.getDate();
		$scope.time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
	})
	*/

	$scope.insertAdvanceOrder = function(dir){
		var pendingTask;
		if(pendingTask) {
			clearTimeout(pendingTask);
		}
		pendingTask = setTimeout(function(){
				insertOrder(dir,$scope.price, $scope.pairs.id,
							$scope.amount,$scope.username,"pending", $scope.orderType,$http)
				if(parseFloatIgnoreCommas($scope.amount) > 0 )
						window.close();
		}, 400);
	}
	
	})
  	  .controller('candleChartCtrl',function($scope,$http,appAPI,appPubSub){
	
	 $scope.data = [];
	 $scope.predefinedPairs = [];
	
	
	$scope.queryCurrency = "EURCHF";
	$scope.queryInterval = "15m";
	
	appAPI.get('history/showAvailablePairs',function(data){
		$scope.predefinedPairs = data.data;
		$scope.predefinedPairs.sort();
	})
	
	$scope.$watchCollection("[queryCurrency,queryInterval]",function(newV,oldV){
		var name = newV[0];
		var interval = newV[1];
		
		appAPI.get("history/getOhlcData?name=" + name + "&interval=" + interval  ,function(data){
			appPubSub.pub('get-chart-data',[data])
		})
	})
	
	$scope.resetData = function(){
		var name = $scope.queryCurrency;
		var interval = $scope.queryInterval ;
		var date = $scope.queryDate ;
		
		appAPI.get("history/getOhlcData?name=" + name + "&interval=" + interval ,function(data){
			appPubSub.pub('get-chart-data',[data])
		})
	}
	
	appPubSub.sub('get-chart-data',function(data){

		$scope.allData = data.ohlc[0].data;
	})
	
	/*
		appAPI.get("history/showOflcData?name=" + name ,function(data){
			appPubSub.pub('get-chart-data',[data])
		})
	})

	appPubSub.sub('get-chart-data',function(data){
		console.log(data.data.data);
		$scope.allData = data.data.data;
	})*/
	

})
	  .directive('candleChart', function($parse,$window) {
        return {
            restrict: 'EA',
           template: "<svg width='600' class='chart' height='400'></svg>",
            link: function(scope, elem, attrs) {
     	var exp = $parse(attrs.chartData);
			var amount = [];
            var dataToPlot = exp(scope);

				dataToPlot.forEach(function(doc){
					amount.push(doc.High);
				})
				
				var xMin = dataToPlot[0].Date;
				var xMax = dataToPlot[dataToPlot.length-1].Date;
				var yMin = d3.min(amount) - (d3.min(amount) * 0.5);
				var yMax = d3.max(amount) + (d3.min(amount) * 0.5);
				
  var dim = {
        width: 600, height: 400,
        margin: { top: 20, right: 50, bottom: 30, left: 50 },
        ohlc: { height: 400 },
        indicator: { height: 65, padding: 5 }
    };
	
    dim.plot = {
        width: dim.width - dim.margin.left - dim.margin.right,
        height: dim.height - dim.margin.top - dim.margin.bottom
    };
    dim.indicator.top = dim.ohlc.height+dim.indicator.padding;
    dim.indicator.bottom = dim.indicator.top+dim.indicator.height+dim.indicator.padding;
				
    var indicatorTop = d3.scale.linear()
            .range([dim.indicator.top, dim.indicator.bottom]);

  var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;
				
				xMin = parseDate(xMin);
				xMax = parseDate(xMax);
				
		var panExtent = {x: [xMin,xMax], y: [yMin,yMax] };
				
    var x = techan.scale.financetime()
            .range([0, dim.plot.width]);

    var y = d3.scale.linear()
            .range([dim.ohlc.height, 0]);
				
	var zoom = d3.behavior.zoom()
			.scaleExtent([0.1, 10])
	 		.on("zoom", draw);
	
    var yPercent = y.copy();

    var yVolume = d3.scale.linear()
            .range([y(0), y(0.2)]);

    var candlestick = techan.plot.candlestick()
            .xScale(x)
            .yScale(y);

    var sma0 = techan.plot.sma()
            .xScale(x)
            .yScale(y);

    var sma1 = techan.plot.sma()
            .xScale(x)
            .yScale(y);

    var ema2 = techan.plot.ema()
            .xScale(x)
            .yScale(y);

    var volume = techan.plot.volume()
            .accessor(candlestick.accessor())
            .xScale(x)
            .yScale(yVolume);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

    var timeAnnotation = techan.plot.axisannotation()
            .axis(xAxis)
            .format(d3.time.format('%Y-%m-%d'))
            .width(65)
            .translate([0, dim.plot.height]);

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("right");

    var ohlcAnnotation = techan.plot.axisannotation()
            .axis(yAxis)
            .format(d3.format(',.5fs'))
            .translate([x(1), 0]);

    var closeAnnotation = techan.plot.axisannotation()
            .axis(yAxis)
            .accessor(candlestick.accessor())
            .format(d3.format(',.5fs'))
            .translate([x(1), 0]);

    var percentAxis = d3.svg.axis()
            .scale(yPercent)
            .orient("left")
            .tickFormat(d3.format('+.1%'));

    var percentAnnotation = techan.plot.axisannotation()
            .axis(percentAxis);
	
    var volumeAxis = d3.svg.axis()
            .scale(yVolume)
            .orient("right")
            .ticks(3)
            .tickFormat(d3.format(",.3s"));

    var volumeAnnotation = techan.plot.axisannotation()
            .axis(volumeAxis)
            .width(35);
		

    var macdScale = d3.scale.linear()
            .range([indicatorTop(0)+dim.indicator.height, indicatorTop(0)]);

    var rsiScale = macdScale.copy()
            .range([indicatorTop(1)+dim.indicator.height, indicatorTop(1)]);

    var macd = techan.plot.macd()
            .xScale(x)
            .yScale(macdScale);

    var macdAxis = d3.svg.axis()
            .scale(macdScale)
            .ticks(3)
            .orient("right");

    var macdAnnotation = techan.plot.axisannotation()
            .axis(macdAxis)
            .format(d3.format(',.2fs'))
            .translate([x(1), 0]);

    var macdAxisLeft = d3.svg.axis()
            .scale(macdScale)
            .ticks(3)
            .orient("left");

    var macdAnnotationLeft = techan.plot.axisannotation()
            .axis(macdAxisLeft)
            .format(d3.format(',.2fs'));

    var rsi = techan.plot.rsi()
            .xScale(x)
            .yScale(rsiScale);

    var rsiAxis = d3.svg.axis()
            .scale(rsiScale)
            .ticks(3)
            .orient("right");

    var rsiAnnotation = techan.plot.axisannotation()
            .axis(rsiAxis)
            .format(d3.format(',.2fs'))
            .translate([x(1), 0]);

    var rsiAxisLeft = d3.svg.axis()
            .scale(rsiScale)
            .ticks(3)
            .orient("left");

    var rsiAnnotationLeft = techan.plot.axisannotation()
            .axis(rsiAxisLeft)
            .format(d3.format(',.2fs'));

    var ohlcCrosshair = techan.plot.crosshair()
            .xScale(timeAnnotation.axis().scale())
            .yScale(ohlcAnnotation.axis().scale())
            .xAnnotation(timeAnnotation)
            .yAnnotation([ohlcAnnotation, volumeAnnotation])
            .verticalWireRange([0, dim.plot.height]);

    var macdCrosshair = techan.plot.crosshair()
            .xScale(timeAnnotation.axis().scale())
            .yScale(macdAnnotation.axis().scale())
            .xAnnotation(timeAnnotation)
            .yAnnotation([macdAnnotation, macdAnnotationLeft])
            .verticalWireRange([0, dim.plot.height]);

    var rsiCrosshair = techan.plot.crosshair()
            .xScale(timeAnnotation.axis().scale())
            .yScale(rsiAnnotation.axis().scale())
            .xAnnotation(timeAnnotation)
            .yAnnotation([rsiAnnotation, rsiAnnotationLeft])
            .verticalWireRange([0, dim.plot.height]);
				
	var rawSvg = elem.find('svg');
				
   var svg = d3.select(rawSvg[0])
            .attr("fill", "black")
            .attr("width", dim.width)
            .attr("height", dim.height);

    var defs = svg.append("defs");

    defs.append("clipPath")
            .attr("id", "ohlcClip")
        .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", dim.plot.width)
            .attr("height", dim.ohlc.height);

    defs.selectAll("indicatorClip").data([0, 1])
        .enter()
            .append("clipPath")
            .attr("id", function(d, i) { return "indicatorClip-" + i; })
        	.append("rect")
            .attr("x", 0)
            .attr("y", function(d, i) { return indicatorTop(i); })
            .attr("width", dim.plot.width)
            .attr("height", dim.indicator.height);

    svg = svg.append("g")
            .attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + dim.plot.height + ")");

    var ohlcSelection = svg.append("g")
            .attr("class", "ohlc")
            .attr("transform", "translate(0,0)");

    ohlcSelection.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + x(1) + ",0)")
        .append("text")
            .attr("transform", "rotate(-90)")

    ohlcSelection.append("g")
            .attr("class", "close annotation up");

    ohlcSelection.append("g")
            .attr("class", "volume")
            .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g")
            .attr("class", "candlestick")
            .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g")
            .attr("class", "indicator sma ma-0")
            .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g")
            .attr("class", "indicator sma ma-1")
            .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g")
            .attr("class", "indicator ema ma-2")
            .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g")
            .attr("class", "percent axis");

    ohlcSelection.append("g")
            .attr("class", "volume axis");

    var indicatorSelection = svg.selectAll("svg > g.indicator").data(["macd", "rsi"]).enter()
             .append("g")
                .attr("class", function(d) { return d + " indicator"; });

    indicatorSelection.append("g")
            .attr("class", "axis right")
            .attr("transform", "translate(" + x(1) + ",0)");

    indicatorSelection.append("g")
            .attr("class", "axis left")
            .attr("transform", "translate(" + x(0) + ",0)");

    indicatorSelection.append("g")
            .attr("class", "indicator-plot")
            .attr("clip-path", function(d, i) { return "url(#indicatorClip-" + i + ")"; });

    svg.append('g')
            .attr("class", "crosshair ohlc");

    svg.append('g')
            .attr("class", "crosshair macd");

    svg.append('g')
            .attr("class", "crosshair rsi");

    svg.append("g")
            .attr("class", "trendlines analysis")
            .attr("clip-path", "url(#ohlcClip)");
    svg.append("g")
            .attr("class", "supstances analysis")
            .attr("clip-path", "url(#ohlcClip)");

    	scope.$watchCollection(exp,function(newV,oldV){
			if(newV != undefined){
					setParameters(newV);
				}	
			})

	function setParameters(allData){

		data = allData; 
        var accessor = candlestick.accessor(),
            indicatorPreRoll = Math.floor(allData.length * 0.8);

        data = data.map(function(d) {

            return {
                date: parseDate(d.Date),
                open: +d.Open,
                high: +d.High,
                low: +d.Low,
                close: +d.Close
            };
        }).sort(function(a, b) { 
			return d3.ascending(accessor.d(a), accessor.d(b)); });

        x.domain(techan.scale.plot.time(data).domain());
        y.domain(techan.scale.plot.ohlc(data.slice(indicatorPreRoll)).domain());
        yPercent.domain(techan.scale.plot.percent(y, accessor(data[indicatorPreRoll])).domain());
        yVolume.domain(techan.scale.plot.volume(data).domain());



        var macdData = techan.indicator.macd()(data);
        macdScale.domain(techan.scale.plot.macd(macdData).domain());
        var rsiData = techan.indicator.rsi()(data);
        rsiScale.domain(techan.scale.plot.rsi(rsiData).domain());

        svg.select("g.candlestick").datum(data).call(candlestick);
        svg.select("g.close.annotation").datum([data[data.length-1]]).call(closeAnnotation);
        svg.select("g.sma.ma-0").datum(techan.indicator.sma().period(10)(data)).call(sma0);

        svg.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom);
        svg.select("g.crosshair.macd").call(macdCrosshair).call(zoom);
        svg.select("g.crosshair.rsi").call(rsiCrosshair).call(zoom);


        var zoomable = x.zoomable();
		
        zoomable.domain([indicatorPreRoll, data.length]);

        draw();
        zoom.x(zoomable).y(y);
	}

    function draw() {
		
	    zoom.translate();
        zoom.scale();

        svg.select("g.x.axis").call(xAxis);
        svg.select("g.ohlc .axis").call(yAxis);

        svg.select("g.candlestick").call(candlestick.refresh);
        svg.select("g.close.annotation").call(closeAnnotation.refresh);
        svg.select("g.volume").call(volume.refresh);
        svg.select("g .sma.ma-0").call(sma0.refresh);
        svg.select("g.macd .indicator-plot").call(macd.refresh);
        svg.select("g.rsi .indicator-plot").call(rsi.refresh);
        svg.select("g.crosshair.ohlc").call(ohlcCrosshair.refresh);
        svg.select("g.crosshair.macd").call(macdCrosshair.refresh);
        svg.select("g.crosshair.rsi").call(rsiCrosshair.refresh);

    }

        }   
    }
})
 	  .directive('validNumber', function() {
	  return {
		require: '?ngModel',
		link: function(scope, element, attrs, ngModelCtrl) {
		  if(!ngModelCtrl) {
			return; 
		  }

		  ngModelCtrl.$parsers.push(function(val) {
			if (angular.isUndefined(val)) {
				var val = '';
			}
			var clean = val.replace( /[^0-9,.]+/g, '');
			if (val !== clean) {
			  ngModelCtrl.$setViewValue(clean);
			  ngModelCtrl.$render();
			}
			return clean;
		  });

		  element.bind('keypress', function(event) {
			if(event.keyCode === 32) {
			  event.preventDefault();
			}
			if(event.keyCode === 188) {
			}
			if(event.keyCode === 190) {
			}
		  });
		}
	  }
	})
	  .filter('customSearch', [function(){
    /** @data is the original data**/
    /** @search is the search query for search**/
    return function(data,search){
        var output = []; // store result in this
		search = search.toLowerCase();
		search = search.split(" ");

        /**@case1 if both searches are present**/
        if(!!search && search.length == 1){
           // search = search.toLowerCase(); 
            //loop over the original array
            for(var i = 0;i<data.length; i++){
                // check if any result matching the search request
                if(data[i].name.toLowerCase().indexOf(search[0]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
                }	
				else if(data[i].date.toLowerCase().indexOf(search[0]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
                }
				else if(data[i].dir.toLowerCase().indexOf(search[0]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
                }
				else if(data[i].type.toLowerCase().indexOf(search[0]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
                }
				else if(data[i].status.toLowerCase().indexOf(search[0]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
                }
				else if(data[i].amount.toFixed(2).indexOf(search[0]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
                }
				else if(data[i].rate.toFixed(4).indexOf(search[0]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
                }
				
				
            }
        }else if(!!search && search.length == 2){
            for(var i = 0;i<data.length; i++){
                // check if any result matching the search request
	if(data[i].name.toLowerCase().indexOf(search[0]) !== -1 && 
	   data[i].status.toLowerCase().indexOf(search[1]) !== -1  ){
                    //push data into results array
                    output.push(data[i]);
			}
				else if(data[i].name.toLowerCase().indexOf(search[0]) !== -1 && 
						data[i].dir.toLowerCase().indexOf(search[1]) !== -1  ){
                    //push data into results array
                    output.push(data[i]);
                }
				else if(data[i].dir.toLowerCase().indexOf(search[0]) !== -1  &&
						data[i].name.toLowerCase().indexOf(search[1]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
                }
				else if(data[i].name.toLowerCase().indexOf(search[0]) !== -1  &&
						data[i].type.toLowerCase().indexOf(search[1]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
                }
				else if(data[i].name.toLowerCase().indexOf(search[0]) !== -1  &&
						data[i].status.toLowerCase().indexOf(search[1]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
                }
				else if(data[i].name.toLowerCase().indexOf(search[0]) !== -1  &&
						data[i].status.toLowerCase().indexOf(search[1]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
                }
				else if(data[i].dir.toLowerCase().indexOf(search[0]) !== -1  &&
						data[i].status.toLowerCase().indexOf(search[1]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
                }
			else if(data[i].status.toLowerCase().indexOf(search[0]) !== -1  && 
					data[i].name.toLowerCase().indexOf(search[1]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
                }
			else if(data[i].status.toLowerCase().indexOf(search[0]) !== -1  &&
					data[i].dir.toLowerCase().indexOf(search[1]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
					}
			else if(data[i].type.toLowerCase().indexOf(search[0]) !== -1  && 
					data[i].name.toLowerCase().indexOf(search[1]) !== -1 ){
                    //push data into results array
                    output.push(data[i]);
				}
		}

	} else {
            /**@case4 no query is present**/
            output = data;
        }
        return output; // finally return the result
    }
}])

/**
* to display the enlarge text on the pip values
* @param pText - the pip values
* @return str - string with customised class
*/
function enlargeText(pText) {
	
	pText = parseFloat(pText);
	
	if (pText.toFixed(5).length > 7){
		text = "" + Number(pText).toFixed(4);}
	else{
    text = "" + Number(pText).toFixed(5);}
    alteredText = text.split(".");

    var str = "";
    var thirdLast = alteredText[1].charAt(alteredText[1].length - 3);
    var secondLast = alteredText[1].charAt(alteredText[1].length - 2);
    var last = alteredText[1].charAt(alteredText[1].length - 1);

    enlargedText = [thirdLast, secondLast];
    alteredText[2] = "";
    var i = 0;
    do {
        alteredText[2] += text[i];
        i++;
    } while (i < text.length - 3);
    str = alteredText[2] + '<span class="largerText">' + enlargedText[0] + enlargedText[1] +
        ' </span>' + '<span class="lastText">' + last + '</span>';
    return str;

}

/**
* displays the openFin's notification
* @param order - order details
*/
function notification(order){
	   var topic = "hello:of:notification",
			message = order;
		publishInterApp(topic,message)
}

/**
* publish message to all of its' child to hook up with the latest updates
* serve as a trigger to notify the child
* @param topic - the name of the topic
* @param message - the content of the publisher
*/
function publishInterApp(topic,message){
	 fin.desktop.InterApplicationBus.publish(topic, {
                message: message,
                timeStamp: Date.now()
            });
}

/**
* toFixed a float to a string displaying commmas and decimals 
* added currency symbol for exposures and profit and loss
* @param n - float value
* @param x - currency symbol if exist
* @return string value
*/
function displayAmount(n,x){
		if ( x != undefined)
    	return  x + " " + n.toFixed(2).replace( /(\d)(?=(\d{3})+\.)/g, "$1,");
	else
		return  n.toFixed(2).replace( /(\d)(?=(\d{3})+\.)/g, "$1,");
}

/**
* parse string into float values ignoring commas
* @param number - string
* @return float value
*/
function parseFloatIgnoreCommas(number){
    var numberNoCommas = number.replace(/,/g, '');
    return parseFloat(numberNoCommas);
}

/**
* force input to be lowercase at during log in
*/
function forceLower(strInput){
	strInput.value=strInput.value.toLowerCase();
}

/**
* validate amount to length of 13
* to set the maximum length of the amount
*/
function validateAmount(amount){
		amount = parseFloatIgnoreCommas(amount);
		amount = amount.toFixed(2);
		
		if ( amount.length > 13){
			amount = "9999999999";
		}
			
	return amount;

}

/**
* Insert Order ( Buy,Sell,Advanded Orders)
*/
function insertOrder(dir,rate,name,amount,username,status,type,http){
		amount = validateAmount(amount);
		
		var order = {};
		order.dir = dir;
		order.rate = parseFloat(rate);
		order.date = new Date();
		order.name = name;
		order.amount = parseFloatIgnoreCommas(amount);
		order.remaining = order.amount;
		order.trader = username;
		order.status = status;
		order.type = type;

		//executing

		if( order.amount != 0  && parseFloat(order.amount)){
			http.post('/insertOrder',order)
			notification(order);
			publishInterApp('insertOrder',order);	
		}else{
			notification("ERROR AMOUNT");
		}

}
