'use strict';

$(document).ready(function() {
  $('#splash').backstretch('images/splash-fun.jpg');
  
  // These are the taglines the main page rands through
  var taglines = [
    {h1: 'Gathering insights.', small:'Now that\'s awesome.'},
    {h1: 'Understanding code.', small:'Best. Feeling. Ever.'},
    {h1: 'Zero downtime.', small:'Now you\'re talking.'},
    {h1: 'Exception handling.', small:'Let us do that for you.'},
    {h1: 'Arbitrary data.', small:'Log whatever feels right.'}
  ], prevTagline = 0;

  setInterval(function() {
    var index = prevTagline;

    while (index === prevTagline) {
      index = Math.floor((Math.random() * taglines.length));
    }
    prevTagline = index;

    $('#splash div h1').fadeOut('slow', function() {
      $('#splash div h1').text(taglines[index].h1).append('<small>'+taglines[index].small+'</small>').fadeIn('slow');
    });
  }, 10000);
});

var TableView = function(selector) { // jshint ignore:line
    this.$el = $(selector);

    this.init = function() {
        if(this.$el.length > 0) {
            this.$el.DataTable();
        }
    };
};