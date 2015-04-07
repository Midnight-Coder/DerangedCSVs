/**
 * Basic route controller
 */
var pages = require('./pages');
var formidable  = require('formidable');
var fs = require('fs');
var Parse = require('csv-parse');

function parseSalaryFile(filePath, res, templateName, columns, requestId){

    function handleError(error){
        res.send(error);
    }

    function done(output){
        res.render(templateName, {output: output});
    }

    parseCSVFile(filePath, columns, handleError, done, requestId);

}

function parseCSVFile(sourceFilePath, columns, handleError, done, requestId){
    var source = fs.createReadStream(sourceFilePath),
        parser = Parse({
            columns:columns
        }),
        output = [],
        record;
    parser.on("readable", function(){
        while (record = parser.read()) {
            if(requestId){
                if(requestId === record.employee_id){
                    output.push(record);
                }
            }
            else{
                output.push(record);
            }
        }
    });

    parser.on("error", function(error){
        handleError(error);
    });

    parser.on("finish", function(){
        parser.end();
        done(output);
    });
    source.pipe(parser);
}

module.exports = function(app, io) {
    app.get('/', pages.index);
    app.post('/analysis', function(req, res, next){

        //Initialize the form
        var form = new formidable.IncomingForm();
        form.uploadDir = "./tempStorage";
        form.type = 'multipart';
        form.multiples = true;

        form.parse(req, function(err, fields, files) {
            if(err){
                res.send(400);
                res.redirect('/');
                console.log("Error: ", err);
                io.sockets.in('sessionId').emit('error', err);
            }
            app.locals.employeeDetails = files.csv1.path;
            app.locals.salaryDetails = files.csv2.path;

            parseSalaryFile(app.locals.employeeDetails, res, 'analysis',
                ['employee_id', 'birthdate', 'firstname', 'lastname', 'sex', 'start_date']);
        });

        form.on('progress', function(bytesReceived, bytesExpected) {
            var progress = (bytesReceived * 100) / bytesExpected;
            io.sockets.in('sessionId').emit('uploadProgress', progress);
        });
        //Rename formidable's random filenames
        form.on('fileBegin', function(name, file){
            file.path = form.uploadDir + "/" + file.name;
        });
    });
    app.get('/detail', function(req, res){
        //TODO optimize: parsing whole csv per click --> solution: bootstrap to client Model
        parseSalaryFile(app.locals.salaryDetails, res, 'dets',
            ['employee_id', 'salary', 'start_of_salary', 'end_of_salary'], req.query.id);
    });
};