'use strict';

var API_ROOT = 'http://api.arewegood.local:3000';
var API_SUFFIX_REPO = '/repos';

$(document).ready(function() {
	if($('table.logs').length > 0) {
		$('table.logs').DataTable();
	}
});

var TrackRepository = function(items, selector) {
    this.items = items;
    this.$el = $(selector);

    this.onClick = function() {
        // if(this.items.indexOf(this.$el.find('input').val()) !== -1) {
        //     console.log('added');
        // }
        $.ajax({
            type: 'GET',
            url: API_ROOT + API_SUFFIX_REPO,
            xhrFields: {
                withCredentials: true
            }
        }).done(function(msg) {
            alert('Reponse: ' + msg);
        });
    };

    this.init = function() {
        var $input = $('<input></input>');
        var $button = $('<button></button>').text('add');

        // $input.autocomplete({
        //     source: this.items
        // });

        $button.on('click', this.onClick.bind(this));
        
        this.$el.append($input).append($button);
    };
};