'use strict';

// this file will eventually be replaced with conar when hulksmash and directory support is integrated
var hulksmash = require('hulksmash');

var authentication = require('./authentication.json');
var environment = require('./environment.json');
var constants = require('./constants.json');

// TODO: replace with conar and will be removed
var config = hulksmash.objects(authentication, environment, constants);
module.exports = hulksmash.objects(config[process.env.NODE_ENV === 'development' ? 'development' : 'production'], config['both']);