
/**
 * Module dependencies.
 */

var express = require('express');
var path = require('path');

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');
app.engine('mustache', require('hogan-express'));

app.use(express.favicon());

app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.cookieParser());
app.use(express.cookieSession({
  key: 'datahero.sess',
  secret: 'dataheroRocks!'
}));
app.use(app.router);
// redirect if nothing else sent a response
//TODO redirect to 404
app.use(redirectUnmatched);
function redirectUnmatched(req, res){
	res.redirect('/?page=invalid');
}


//Setup io events
io.on('connection', function (socket) {
    socket.join('sessionId');
});


require('./routes')(app, io);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

