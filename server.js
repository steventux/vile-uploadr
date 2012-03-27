var express = require('express'),
    fs = require('fs'),
    knox = require('knox'),
    app = express.createServer(),
    port = process.env.PORT || 8080;

app.dynamicHelpers({ messages: require('express-messages') });

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ 
    secret: "marzipan is private", 
    store: new express.session.MemoryStore({ reapInterval: 60000 * 10 }) 
  }));
  app.use(express.static(__dirname + '/public/'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get('/', function(req, res){
  res.render('new', {s3: req.session.s3});
});


app.post('/upload', function(req, res){
  
  var s3sessionParams = function(key, secret, bucket) {
    if (key && secret && bucket) { // assign
      req.session.s3 = { key:key, secret:secret, bucket:bucket };
    } else if (req.session.s3) { // return params
      return req.session.s3;
    } else {
      return false;
    }
  } 

  fs.readFile(req.files.uploadFile.path, function (err, data) {
    if (!s3sessionParams())
      s3sessionParams(req.body.key, req.body.secret, req.body.bucket);
    var client = knox.createClient(s3sessionParams());
    
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
