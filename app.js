var express = require('express');
// Use express at the static file server.
var app = express.createServer();

app.get('/', function(req, res){
    res.send('Hello World');
});
    
// Start the appserver.     
app.listen(8080);
