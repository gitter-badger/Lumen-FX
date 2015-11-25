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
