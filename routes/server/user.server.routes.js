/**
 * Created by beiwp on 2016/8/24.
 */
'use strict';

var express = require('express'),
    router = express.Router(),
    core = require('../../libs/core'),
    user = require('../../controllers/server/user.server.controller');

router.use(function (req, res, next) {
    console.log('user routes====' + new Date());
    res.locals.Path = 'user';
    next();
});

// 不能放到权限判断下面 会有重定向的
router.route('/login').all(user.checkUser,user.login);
router.route('/register').all(user.register);
router.route('/logout').all(user.logout);

//权限判断
router.use(function (req, res, next) {
    if (!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});

router.route('/list').get(user.listUser).post(user.addUser);
router.route('/list/:id').get(user.viewUser).put(user.editUser).delete(user.delUser);


module.exports = function (app) {
    var path = core.translateAdminDir('/user');
    app.use(path, router);
};
