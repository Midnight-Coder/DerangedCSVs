/**
 * Basic route controller
 */
var pages = require('./pages');
var formidable  = require('formidable');
var fs = require('fs');
var Parse = require('csv-parse');

function parseFile(filePath, res){


    var output = [];
    function onNewRecord(record){
        output.push(record);
    }

    function onError(error){
        res.send(error);
    }

    function done(linesRead){
        res.render('analysis', {output: output});
        console.log("parsed:" + filePath);
    }

    var columns = ['employee_id', 'birthdate', 'firstname', 'lastname', 'sex', 'start_date'];
    parseCSVFile(filePath, columns, onNewRecord, onError, done);

}

function parseCSVFile(sourceFilePath, columns, onNewRecord, handleError, done){
    var source = fs.createReadStream(sourceFilePath);

    var parser = Parse({
        delimiter: ',',
        columns:columns
    });

    parser.on("readable", function(){
        var record;
        while (record = parser.read()) {
            onNewRecord(record);
        }
    });

    parser.on("error", function(error){
        handleError(error)
    });

    parser.on("finish", function(){
        done();
    });
    source.pipe(parser);
}

module.exports = function(app, io) {
    app.get('/', pages.index);
    app.post('/', function(req, res, next){
        var form = new formidable.IncomingForm();
        form.uploadDir = "./images";
        form.type = 'multipart';
        form.multiples = true;

        form.parse(req, function(err, fields, files) {
            //TODO : redirect to analysis
            if(err){
                res.send(400);
                res.redirect('/');
                console.log("Error: ", err);
                io.sockets.in('sessionId').emit('error', err);
            }
            console.log(files.csv1.path + " " + files.csv2.path);

            parseFile(files.csv1.path, res);
        });

        form.on('progress', function(bytesReceived, bytesExpected) {
            var progress = (bytesReceived * 100) / bytesExpected;
            io.sockets.in('sessionId').emit('uploadProgress', progress);
        });
    });
};