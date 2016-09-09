/**
 * Created by beiwp on 2016/9/8.
 */
'use strict';

var express = require('express'),
    router = express.Router(),
    core = require('../../libs/core'),
    content = require('../../controllers/server/content.server.controller');

router.use(function (req, res, next) {
    console.log('content routes====' + new Date());
    res.locals.Path = 'content';
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

router.route('/list').get(content.listContent).post(content.addContent);
router.route('/list/:id').get(content.viewContent).put(content.editContent).delete(content.delContent);


module.exports = function (app) {
    var path = core.translateAdminDir('/content');
    app.use(path, router);
};
