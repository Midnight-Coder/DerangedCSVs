/**
 * Basic route controller
 */
var pages = require('./pages');

module.exports = function(app) {
    app.get('/', pages.index);
    app.post('/', function(req, res, next){
        if(app.done){
            console.log("Upload finished");
            res.status(204).end();
        }
        else{
            console.log('false');
        }
    });
};