/**
 * Basic route controller
 */
var pages = require('./pages');
var formidable  = require('formidable');

module.exports = function(app) {
    app.get('/', pages.index);
    app.post('/', function(req, res, next){
        var form = new formidable.IncomingForm();
        form.uploadDir = "./images";
        form.type = 'multipart';
        form.multiples = true;

        form.parse(req, function(err, fields, files) {
            console.log('Done', files);
            res.status(204).end();
        });

        form.on('progress', function(bytesReceived, bytesExpected) {
            console.log("progress ..... " + (bytesReceived*100)/bytesExpected);
        });

        form.on('error', function(err) {
            console.log("Error: ", err);
        });

    });
};