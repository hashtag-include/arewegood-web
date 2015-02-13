'use strict';

// this file will eventually be replaced with conar when hulksmash and directory support is integrated
var hulksmash = require('hulksmash');

var authentication = require('./authentication.json');
var environment = require('./environment.json');

// TODO: replace with conar and will be removed
module.exports = hulksmash.objects(authentication, environment)[process.env.NODE_ENV === 'development' ? 'development' : 'production']; 