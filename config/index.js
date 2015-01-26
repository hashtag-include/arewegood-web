'use strict';

// this file will eventually be replaced with conar when hulksmash and directory support is integrated
var hulksmash = require('hulksmash');

var database = require('./database.json');
var environment = require('./environment.json');

module.exports = hulksmash.objects(database, environment);