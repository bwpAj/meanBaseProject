/**
 *
 * =================================================================================================
 *     Task ID			  Date			     Author		      Description
 * ----------------+----------------+-------------------+-------------------------------------------
 *     文件路由          2016年7月25日         beiwp			   文件上传router
 *
 */
var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var filter = require('../../controllers/server/file.server.controller');

router.use(function(req, res,next){
    console.log('user routes===='+new Date());
    res.locals.Path = 'filter';
    next();
});

//权限判断
router.use(function(req,res,next){
    if(!req.session.user){
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});

router.route('/list').post(filter.add);

module.exports = function(app){
    var path = core.translateAdminDir('/file');
    app.use(path,router);
};
