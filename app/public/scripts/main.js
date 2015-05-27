'use strict';
var typeAheadTimeout = 0;

function search() {
  $.get('repo-search/?q=' + $('.repo-search').val(), function( data ) {
    // remove all things from the table
    $('.repos-body').find('tr').remove();
    for(var i = 0; i < data.repos.length; i++) {
      var repo = data.repos[i];
      console.log(repo);
      $('.repos-body').append('<tr><td class="name"><a href="/' + repo.fullName + '">' + repo.fullName + '</a></td></tr>');
    }
    console.log(data);
  });
}

$(document).ready(function() {
  $('#splash').backstretch('images/splash-fun.jpg');
  
  // These are the taglines the main page rands through
  var taglines = [
    {h1: 'Gathering insights.', small:'Now that\'s awesome.'},
    {h1: 'Understanding code.', small:'Best. Feeling. Ever.'},
    {h1: 'Zero downtime.', small:'Now you\'re talking.'},
    {h1: 'Exception handling.', small:'Let us do that for you.'},
    {h1: 'Arbitrary data.', small:'Log whatever feels right.'},
    {h1: 'Ben smells', small:'... good'}
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
  
  $('.repo-search').keydown(function(e) {
    typeAheadTimeout = new Date().getTime()+300;
    
    setTimeout(function() {
      if(new Date().getTime() < typeAheadTimeout) {
      } else {
        search(e);
      }
    }, 300);
  });
});

var TableView = function(selector) { // jshint ignore:line
    this.$el = $(selector);

    this.init = function() {
        if(this.$el.length > 0) {
            this.$el.DataTable();
        }
    };
};