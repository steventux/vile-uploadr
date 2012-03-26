var express = require('express'),
    fs = require('fs'),
    knox = require('knox'),
    app = express.createServer(),
    port = process.env.PORT || 8080;

client = knox.createClient({
  key: 'YOUR_S3_KEY'
, secret: 'YOUR_S3_SECRET'
, bucket: 'YOUR_S3_BUCKET'
});

app.dynamicHelpers({ messages: require('express-messages') });

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.session({ secret: "marzipan is private" }));
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get('/', function(req, res){
  res.render('new');
});

app.post('/upload', function(req, res){
  fs.readFile(req.files.uploadFile.path, function (err, data) {
    var s3req = client.put("assets/" + req.files.uploadFile.name, {
        'Content-Length': data.length
      , 'Content-Type': req.files.uploadFile.type
    });
    s3req.on('response', function(s3res){
      if (200 == s3res.statusCode) {
        req.flash('info', 'Uploaded to ' + s3req.url);
      }
      res.redirect("back");
    });
    s3req.end(data);
  });
});
    
// Start the appserver.     
app.listen(port);
