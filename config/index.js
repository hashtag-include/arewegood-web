'use strict';

// this file will eventually be replaced with conar when hulksmash and directory support is integrated
var hulksmash = require('hulksmash');

var authentication = require('./authentication.json');
var environment = require('./environment.json');

module.exports = hulksmash.objects(authentication, environment);