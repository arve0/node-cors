var http = require('http');
var app = require('./index')

var server = http.createServer(app);
var port = process.env.PORT || 8000;
server.listen(port);
console.log('Listening on port ' + port);
