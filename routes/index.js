/**
 * Basic route controller
 */
var pages = require('./pages'),
    formidable  = require('formidable'),
    fs = require('fs'),
    Parse = require('csv-parse');

function parseCSVFile(sourceFilePath, res, templateName, columns, requestId){
    var source = fs.createReadStream(sourceFilePath),
        parser = Parse({
            columns:columns
        }),
        data = [],
        record;
    parser.on("readable", function(){
        while (record = parser.read()) {
            //Consider the record when requestID is absent -> general employee details
            //Or when requestId matches the record's employee id
            if(!requestId || requestId === record.employee_id){
                data.push(record);
            }
        }
    });

    parser.on("error", function(error){
        res.send(error);
    });

    parser.on("finish", function(){
        parser.end();
        res.render(templateName, {
            title: 'Deranged CSVs',
            layout: 'layout',
            data: data
        });
    });
    source.pipe(parser);
}

module.exports = function(app, io) {
    app.get('/', pages.index);

    app.post('/employees', function(req, res, next){

        //Initialize the form
        var form = new formidable.IncomingForm();
        form.uploadDir = "./tempStorage";
        form.type = 'multipart';
        form.multiples = true;

        form.parse(req, function(err, fields, files) {
            if(err){
                res.send(400);
                res.redirect('/?page=uploaderror');
                console.log("Error: ", err);
                io.sockets.in('sessionId').emit('error', err);
            }
            //Locally store the file names
            app.locals.employeeDetails = files.csv1.path;
            app.locals.salaryDetails = files.csv2.path;
            //Parse the csv and pass it column headers
            parseCSVFile(app.locals.employeeDetails, res, 'employees',
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

    app.get('/salary', function(req, res){
        //Prevents direct access to /salary without relevant data present
        if(!app.locals.salaryDetails || !app.locals.employeeDetails){
            return res.redirect('/?page=salary');
        }
        //TODO optimize: parsing whole csv per click --> solution: bootstrap to client Model
        //Parse the csv and pass it column headers
        parseCSVFile(app.locals.salaryDetails, res, 'salary',
            ['employee_id', 'salary', 'start_of_salary', 'end_of_salary'], req.query.id);
    });
};
