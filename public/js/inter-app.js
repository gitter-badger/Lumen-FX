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

(function() {
    'use strict';
    //get a hold of the elements we will interact with.
    var closeButton = document.querySelector('#close-app'),
        minimizeButton = document.querySelector('#minimize-window');

    document.addEventListener('DOMContentLoaded', function() {
        //OpenFin is ready
        fin.desktop.main(function() {
            //request the window
            var mainWindow = fin.desktop.Window.getCurrent(),
                draggableArea = document.querySelector('.container');

            //set event emiters.
            setEventEmmiters(mainWindow);
		});
	})
    //set event handlers for the different buttons.
    var setEventEmmiters = function(mainWindow) {
        closeButton.addEventListener('click', function() {
            mainWindow.close();
        });

        minimizeButton.addEventListener('click', function() {
            mainWindow.minimize();
        });
		
    };

}());