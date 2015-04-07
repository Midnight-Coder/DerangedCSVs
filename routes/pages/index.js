/*
 * GET hello world home page.
 */

exports.index = function(req, res){
  res.render('index', {
    title: 'Deranged CSVs',
    layout: 'layout'
  });
};
