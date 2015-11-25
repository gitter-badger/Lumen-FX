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
