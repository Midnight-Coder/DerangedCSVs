/**
 * Basic route controller
 */
var pages = require('./pages');

var connector = require('multiparty'),
    util = require('util');


module.exports = function(app) {
    app.get('/', function(req, res, next){
        pages.index(req, res);
    });
    app.post('/', function(req, res, next){
        res.writeHead(200, {'content-type': 'text/plain'});
        var form = new connector.Form({
            autoFiles: true,
            uploadDir: '/Users/monstero/Documents/DerangedCSVs'
        });
        console.log('Received POST');
        form.parse(req);
        // , function(err, fields, files) {
        //     console.log('f', files);
        //     console.log(err, fields);
        //     res.write('recieved ' + files.length + " many files" + "\n");
        //     console.log('in n out');
        //     res.end(util.inspect({fields: fields, files: files}));
        // });

        form.on('error', function (err) {
            console.log('Error parsing form: ' + err.stack);
        });

        form.on('part', function (part) {
            console.log('in part');
            if (!part.filename)
                return;
            size = part.byteCount;
            file_name = part.filename;
        });

        form.on('file', function (name, file) {
            console.log('in file:', name);
            var temporal_path = file.path;
            var extension = file.path.substring(file.path.lastIndexOf('.'));
            destination_path = './public/' + uuid.v4() + extension;
            var input_stream = fs.createReadStream(temporal_path);
            var output_stream = fs.createWriteStream(destination_path);
            input_stream.pipe(output_stream);

            input_stream.on('end',function() {
                console.log('end!');
                fs.unlinkSync(temporal_path);
                console.log('Uploaded : ', file_name, size / 1024 | 0, 'kb', file.path, destination_path);
            });
        });

          form.on('close', function(){
            console.log('on close!');
            res.write('Uploaded!');
          });
    });

    app.get('/analysis', function(req, res, next){
        console.log('GET analysis');
        res.render('analysis');
    });
};