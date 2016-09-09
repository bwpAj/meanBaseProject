/**
 * Created by beiwp on 2016/9/9.
 */
'use strict';

var express = require('express'),
    router = express.Router(),
    core = require('../../libs/core'),
    tag = require('../../controllers/server/tag.server.controller');

router.use(function (req, res, next) {
    console.log('tag routes====' + new Date());
    res.locals.Path = 'tag';
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

router.route('/list').get(tag.listTag).post(tag.addTag);
router.route('/list/:id').get(tag.viewTag).put(tag.editTag).delete(tag.delTag);
router.route('/listAll').get(tag.listAllTag);


module.exports = function (app) {
    var path = core.translateAdminDir('/tag');
    app.use(path, router);
};
