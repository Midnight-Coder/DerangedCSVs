/*
 * GET hello world home page.
 */

exports.index = function(req, res){
  res.render('index', {
    title: 'CSV Parser',
    layout: 'layout'
  });
};