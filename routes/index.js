/**
 * Basic route controller
 */
var pages = require('./pages');

var formidable = require('formidable'),
    util = require('util');


module.exports = function(app) {
    app.get('/', function(req, res, next){
        pages.index(req, res);
    });
    app.post('/', function(req, res, next){
        res.writeHead(200, {'content-type': 'text/plain'});
        var form = new formidable.IncomingForm();
        console.log('Received POST', form);
        form.parse(req, function(err, fields, files) {
            console.log("Parsing");
            res.send('received upload:\n\n');
            res.end(util.inspect({fields: fields, files: files}));
        });

        form.on('fileBegin', function(name, file) {
            console.log("Begin file upload");
        });

        form.on('field', function(name, value) {
            res.write(name+": "+value+"\n");
        });

        form.on('file', function(name, file) {
            res.write("File: ");
            res.write(util.inspect(file));
            res.write("\n");
        });

        form.on('progress', function(bytesReceived, bytesExpected) {
            console.log("Progress@" + bytesReceived + "/" + bytesExpected);
        });

        form.on('error', function(err) {
            console.log("ERROR UPLOADING:");
            res.end();
            console.dir(err);
        });
        form.on('aborted', function() {
            console.log("ABorted");
            res.end();
        });

        form.on('end', function() {
            console.log("end");
            res.end();
        });

    });
    app.get('/analysis', function(req, res, next){
        console.log('GET analysis');
        res.render('analysis');
    });
};