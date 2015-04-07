/**
 * Basic route controller
 */
var pages = require('./pages');
var formidable  = require('formidable');
var fs = require('fs');
var Parse = require('csv-parse');

function parseEmployeeFile(filePath, res){


    var output = [];
    function onNewRecord(record){
        output.push(record);
    }

    function onError(error){
        res.send(error);
    }

    function done(){
        //TODO hide progress bar
        res.render('analysis', {output: output});
    }

    var columns = ['employee_id', 'birthdate', 'firstname', 'lastname', 'sex', 'start_date'];
    parseCSVFile(filePath, columns, onNewRecord, onError, done);

}

function parseSalaryFile(filePath, res, requestId){

    var output = [];
    function onNewRecord(record){
        if(record.employee_id === requestId){
            output.push(record);
        }
    }

    function handleError(error){
        res.send(error);
    }

    function done(){
        res.render('dets', {output: output});
    }

    var columns = ['employee_id', 'salary', 'start_of_salary', 'end_of_salary'];
    parseCSVFile(filePath, columns, onNewRecord, handleError, done);

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
        handleError(error);
    });

    parser.on("finish", function(){
        parser.end();
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
            app.locals.employeeDetails = files.csv1.path;
            app.locals.salaryDetails = files.csv2.path;

            console.log(app.locals.employeeDetails + " " + app.locals.salaryDetails);

            parseEmployeeFile(app.locals.employeeDetails, res);
        });

        form.on('progress', function(bytesReceived, bytesExpected) {
            var progress = (bytesReceived * 100) / bytesExpected;
            io.sockets.in('sessionId').emit('uploadProgress', progress);
        });
    });
    app.get('/detail', function(req, res){
        //TODO optimize: parsing whole csv /employee_id click!!!
        parseSalaryFile(app.locals.salaryDetails, res, req.query.id);
    });
};