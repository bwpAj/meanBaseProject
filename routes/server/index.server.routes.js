/**
 * Created by beiwp on 2016/8/22.
 */
'use strict';

var express = require('express'),
    router = express.Router(),
    core = require('../../libs/core'),
    index = require('../../controllers/server/index.server.controller');

router.use(function (req, res, next) {
    console.log('index routes====' + new Date());
    res.locals.Path = 'index';
    next();
});

router.get('/',index.index);
router.route('/install').all(index.install);

module.exports = function (app) {
    var path = core.translateAdminDir('/');
    app.use(path, router);
};
