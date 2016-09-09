/**
 * Created by beiwp on 2016/9/9.
 */
'use strict';

var express = require('express'),
    router = express.Router(),
    core = require('../../libs/core'),
    category = require('../../controllers/server/category.server.controller');

router.use(function (req, res, next) {
    console.log('category routes====' + new Date());
    res.locals.Path = 'category';
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

router.route('/list').get(category.listCategory).post(category.addCategory);
router.route('/list/:id').get(category.viewCategory).put(category.editCategory).delete(category.delCategory);
router.route('/listAll').get(category.listAllCategory);

module.exports = function (app) {
    var path = core.translateAdminDir('/category');
    app.use(path, router);
};
