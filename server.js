var express = require('express');
// Use express at the static file server.
var app = express.createServer(),
    port = process.env.PORT || 8080;

app.get('/', function(req, res){
    res.send('Hello World');
});
    
// Start the appserver.     
app.listen(port);
