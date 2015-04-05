/**
 * Basic route controller
 */
var pages = require('./pages');

module.exports = function(app) {
    app.get('/', pages.index);
    app.post('/', function(req, res, next){
        if(app.done){
            console.log(req.body); // form fields
            console.log(req.files); // form files
            res.status(204).end();
        }
        else{
            console.log('false');
        }
    });
};