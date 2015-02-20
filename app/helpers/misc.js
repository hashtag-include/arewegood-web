'use strict';

module.exports = {
    // used by api to return messages and errors
    SimpleResponse: function(type, message) {
        var response = {};
        response[type] = message;

        return response;
    }
};