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
 */

(function() {
    'use strict';
    var mainWindow,
        draggableArea,
		candleChartAppWindow,
		desktopNotificationButton,
		orderAppWindow,
        flipContainer,
        defaultWindowConfig = {
            defaultHeight: 600,
            defaultWidth: 680,
            maxWidth: 800,
            maxHeight: 700,
        },
        smallWindowConfig = {
            defaultHeight: 400,
            defaultWidth: 450,
            maxWidth: 500,
            maxHeight: 500,
        },
        limitWindowConfig = {
            defaultHeight: 300,
            defaultWidth: 300,
            maxWidth: 300,
            maxHeight: 300,
			resizable:false,
        };

    document.addEventListener('DOMContentLoaded', function() {
        //OpenFin is ready
        fin.desktop.main(function() {
         //request the windows.
            mainWindow = fin.desktop.Window.getCurrent();
            draggableArea = document.querySelector('.container');
		
            //register the event handlers.
            setEventHandlers();

            //show the main window now that we are ready.
            mainWindow.show();
        });

    });
			

    var flipDisplay = function() {
        flipContainer.classList.toggle("flip");
    };

    //set event handlers for the different buttons.
    var setEventHandlers = function() {
        //Buttons and components.
        var desktopNotificationButton = document.getElementById('desktop-notification'),
            closeButton = document.getElementById('close-app'),
            arrangeWindowsButton = document.getElementById('arrange-windows'),
            minimizeButton = document.getElementById('minimize-window'),
            candleChartAppButton= document.getElementById('inter-candleChart'),
            logoutAppButton= document.getElementById('inter-logout'),
            flipContainer = document.querySelector('.two-sided-container');

        //Close button event handler
        closeButton.addEventListener('click', function() {
            mainWindow.close();
        });

        //Minimize button event handler
        minimizeButton.addEventListener('click', function() {
            mainWindow.minimize();
        });
		
	   logoutAppButton.addEventListener('click', function() {
		   if(candleChartAppWindow != undefined)
			   candleChartAppWindow.close();
        });
		
			 candleChartAppButton.addEventListener('click', function() {
			 if(candleChartAppWindow != undefined){
				 if(candleChartAppWindow.contentWindow.closed)
				  candleChartAppWindow = windowFactory.create(utils.extend(defaultWindowConfig, {
					name: 'candleChart',
					url: 'views/candleChart.html'
				}));
			 }else{

			candleChartAppWindow = windowFactory.create(utils.extend(defaultWindowConfig, {
                name: 'candleChart',
				url: 'views/candleChart.html'
            }));
	 
			 }
			 animations.showWindow(candleChartAppWindow, [mainWindow]);
          });
		
		
			//Subscribe to the InterApplicationBus
			fin.desktop.InterApplicationBus.subscribe('*', 'hello:of:notification',
				function(bussObject, uuid) {
					var notification = new fin.desktop.Notification({
						url: 'views/notification.html',
						message: bussObject.message
					});
				});
		
			fin.desktop.InterApplicationBus.subscribe('*', 'insertOrder',
				function(bussObject, uuid) {
						var message = bussObject.message;
			});		
    };
	}());
