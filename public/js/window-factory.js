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

var windowFactory = windowFactory || {},
    utils = utils || {};
(function() {
    'use strict';

    windowFactory.create = function(customConfig, callback) {
        var config = {
            "name": "ChildWindow",
            "defaultWidth": 680,
            "defaultHeight": 500,
            "maxWidth": 800,
            "maxHeight": 750,
            "autoShow": false,
            "maximizable": false,
            "resizable": true,
            "frame": false,
            "url": 'about:blank',
            "cornerRounding": {
                "width": 5,
                "height": 5
            }
        };

        customConfig = customConfig || {};
        utils.extend(config, customConfig);

        var newWindow = new fin.desktop.Window(config, callback, function(err) {
            console.log('this was the err', err);
        });
        return newWindow;
    };
})();
