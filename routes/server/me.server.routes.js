/**
 * Created by beiwp on 2016/5/31.
 */
'use strict';

var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var me = require('../../controllers/server/me.server.controller');

router.use(function(req, res, next){
    console.log('管理员信息：'+ new Date());
    res.locals.Path = 'me';
    if(!req.session.user){
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});

router.route('/').get(me.init);
router.route('/edit').all(me.edit);
router.route('/updatepwd').all(me.updatePassword);

module.exports = function(app){
   var path = core.translateAdminDir('/me');
   app.use(path, router);
};


