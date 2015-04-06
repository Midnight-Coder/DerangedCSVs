/**
 * Basic route controller
 */
var pages = require('./pages');
var formidable  = require('formidable');


module.exports = function(app, io) {
    app.get('/', pages.index);
    app.post('/', function(req, res, next){
        var form = new formidable.IncomingForm();
        form.uploadDir = "./images";
        form.type = 'multipart';
        form.multiples = true;

        form.parse(req, function(err, fields, files) {
            //TODO : redirect to analysis
        });

        form.on('progress', function(bytesReceived, bytesExpected) {
            var progress = (bytesReceived * 100) / bytesExpected;
            io.sockets.in('sessionId').emit('uploadProgress', progress);
        });

        form.on('error', function(err) {
            console.log("Error: ", err);
            io.sockets.in('sessionId').emit('error', err);
        });

    });
};