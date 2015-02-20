'use strict';

var TableView = function(selector) { // jshint ignore:line
    this.$el = $(selector);

    this.init = function() {
        if(this.$el.length > 0) {
            this.$el.DataTable();
        }
    };
};