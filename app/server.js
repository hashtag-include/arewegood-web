// external dependencies
var http = require('http');
var fs = require('fs');

var port = process.env.PORT || 1337;

fs.readFile('temp-index.html', function (err, html) {
    if (err) {
        throw err; 
    }       
    http.createServer(function(req, res) {  
        res.writeHeader(200, { 'Content-Type': 'text/html' });  
        res.write(html);  
        res.end();  
    }).listen(port);
});