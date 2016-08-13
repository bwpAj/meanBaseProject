/**
 * Created by beiwp on 2016/5/31.
 */
'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Role = mongoose.model('Role');
var userController = require('./user.server.controller');
var _ = require('underscore');
var config = require('../../config');
var core = require('../../libs/core');
var ACTIONS = require('../../actions');


/**
 * 管理员信息
 * @param req
 * @param res
 * @param next
 */
exports.init = function (req, res, next) {
    console.log('======me controller init ======' + new Date());
    var id = req.session.user._id;
    User.findById(id).populate('roles').exec(function (err, user) {

        user._roles = req.Roles;
        user._actions = req.Actions;

        var actions = [];

        if (req.Roles.indexOf('admin') > -1) {
            actions = ACTIONS;
        } else {
            actions = ACTIONS.filter(function (item) {
                var items = item.actions.filter(function (act) {
                    return req.Actions.indexOf(act.value) > -1;
                });
                if (items.length > 0) {
                    return item;
                }
            })
        }

        var tempUser = {
            'user': user,
            'acts': actions
        };
        //自定义扩展的属性  no
        user.acts = actions;
        user.markModified('acts');//传入anything，表示该属性类型发生变化

        core.resJson(res, tempUser);
    });
};

/**
 * 编辑
 * @param req
 * @param res
 */
exports.edit = function (req, res) {
    console.log(req.method + '======me controller edit ======' + new Date());
    var id = req.session.user._id;
    if (req.method === 'PUT') {
        var obj = req.body;
        User.findById(id).populate('roles').exec(function (err, user) {
            _.extend(user, _.pick(obj, 'name', 'email', 'mobile', 'gender', 'birthday'));
            user.save(function (err, result) {
                if (err || !result) {
                    return core.resJson(res, {message: '修改失败', type: 0});
                }
                req.session.user = result;
                res.locals.User = user;
                core.resJson(res, {message: '修改成功', type: 1, user: user});
            });
        })

    } else if (req.method === 'GET') {
        User.findById(id).populate('roles').exec(function (err, user) {
            user._roles = req.Roles;
            user._actions = req.Actions;
            core.resJson(res, user);
        })
    }
};

/**
 * 更新密码
 * @param req
 * @param res
 */
exports.updatePassword = function (req, res) {
    console.log(req.method + '======me controller updatePassword ======' + new Date());
    var id = req.session.user._id;
    if (req.method === 'PUT') {
        var user_pwd = req.body;
        User.findById(id).populate('roles').exec(function (err, user) {

            if (err || !user) {
                return core.resJson(res, {message: '修改异常', type: 0})
            }
            if (!user.authenticate(user_pwd.oldpassword)) {
                return core.resJson(res, {message: '旧密码不相符', type: 0})
            }

            _.extend(user, _.pick(user_pwd, 'password'));

            user.save(function (err, result) {
                if (err) {
                    return core.resJson(res, {message: '修改异常', type: 0})
                }
                req.session.user = result;
                res.locals.User = user;
                core.resJson(res, {message: '修改成功', type: 1})
            });


        });
    }
};

