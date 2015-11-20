/*
 * custom-levels.js: Custom logger and color levels in winston
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */
var winston = require('winston');

//
// Configs for logging mechanism
//
var config = {
  colors: {
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'grey',
    info: 'green',
    verbose: 'cyan',
    silly: 'magenta'
  }
};

var logger = module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: true,
		//logs from error level to ... level
 	  level:'warn',
    })
  ],
  colors: config.colors
});


