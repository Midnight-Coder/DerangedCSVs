
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
var multer  = require('multer');

app.done = false;
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');
app.engine('mustache', require('hogan-express'));

app.use(express.favicon());

app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.use(multer({ dest: './images/',
    rename: function (fieldname, filename) {
        return filename+Date.now();
      },
    onFileUploadStart: function (file) {
      console.log(file.originalname + ' is starting ...')
    },
    onFileUploadComplete: function (file) {
      console.log(file.fieldname + ' uploaded to  ' + file.path)
      app.done=true;
    }
}));

app.use(express.cookieParser());
app.use(express.cookieSession({
  key: 'datahero.sess',
  secret: 'dataheroRocks!'
}));
app.use(app.router);

require('./routes')(app);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

