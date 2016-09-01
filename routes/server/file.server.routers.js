/**
 * Created by beiwp on 2016/8/24.
 */
'use strict';

var express = require('express'),
    router = express.Router(),
    core = require('../../libs/core'),
    config = require('../../config/config'),
    file = require('../../controllers/server/file.server.controller');

var jwt = require('express-jwt');

var auth = jwt({
    secret: config.jwtSecret,
    userProperty: 'userModel'
});


router.use(function (req, res, next) {
    console.log('file routes====' + new Date());
    res.locals.Path = 'file';
    next();
});

//权限判断
router.use(function (req, res, next) {
    if (!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});

router.route('/list').get(auth,file.listFile).post(file.addFile);
router.route('/list/:id').get(file.viewFile).put(file.editFile).delete(file.delFile);


module.exports = function (app) {
    var path = core.translateAdminDir('/file');
    app.use(path, router);
};
