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
        console.log("rendering:" + templateName + " with " + output.length);
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
    console.log("parsing:" + sourceFilePath);
    parser.on("readable", function(){
        while (record = parser.read()) {
            if(requestId){
                console.log("requestId exitst!", record)
                if(requestId === record.employee_id){
                    output.push(record);
                }
            }
            else{
                console.log("Emp:", record)
                output.push(record);
            }
        }
    });

    parser.on("error", function(error){
        handleError(error);
    });

    parser.on("finish", function(){
        console.log("Parsed lines#" + output.length);
        parser.end();
        done(output);
    });
    source.pipe(parser);
}

module.exports = function(app, io) {
    app.get('/', pages.index);
    app.post('/analysis', function(req, res, next){
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

            parseSalaryFile(app.locals.employeeDetails, res, 'analysis',
                ['employee_id', 'birthdate', 'firstname', 'lastname', 'sex', 'start_date']);
        });

        form.on('progress', function(bytesReceived, bytesExpected) {
            var progress = (bytesReceived * 100) / bytesExpected;
            io.sockets.in('sessionId').emit('uploadProgress', progress);
        });
    });
    app.get('/detail', function(req, res){
        //TODO optimize: parsing whole csv /employee_id click!!!
        parseSalaryFile(app.locals.salaryDetails, res, 'dets',
            ['employee_id', 'salary', 'start_of_salary', 'end_of_salary'], req.query.id);
    });
};