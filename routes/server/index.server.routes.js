var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var index = require('../../controllers/server/index.server.controller');

router.use(function(req,res,next){
  console.log('index router==='+new Date());
  res.locals.Path = 'index';
  next();
});

router.get('/',index.index);
router.route('/install').all(index.install);


module.exports = function(app){
  var path = core.translateAdminDir('/');
  app.use(path,router);
};
