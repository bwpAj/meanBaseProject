/**
 * Created by beiwp on 2016/8/22.
 */
'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Role = mongoose.model('Role'),
    Content = mongoose.model('Content'),
    Category = mongoose.model('Category'),
    Comment = mongoose.model('Comment'),
    File = mongoose.model('File'),
    core = require('../../libs/core'),
    config = require('../../config/config');

/**
 * 新增 Index beiwp on 2016/8/22
 * @param req
 * @param res
 */
exports.index = function (req, res) {
    console.log(req.method + '======Index controller index ======' + new Date());

    if (req.session.user) {
        var obj = {};
        var filter = {};
        if (req.Roles && req.Roles.indexOf('admin') < 0) {
            filter = {author: req.session.user._id}
        }
        //result 返回的数量
        Content.find(filter).count().exec().then(function (result) {
            obj.content = result;
            return Category.find(filter).count().exec()
        }).then(function (result) {
            obj.category = result;
            return Comment.find(filter).count().exec();
        }).then(function (result) {
            obj.comment = result;
            return User.find(filter).count().exec();
        }).then(function (result) {
            obj.user = result;
            return Role.find(filter).count().exec();
        }).then(function (result) {
            obj.role = result;
            return File.find(filter).count().exec();
        }).then(function (result) {
            obj.file = result;
            console.log(obj);
            console.log("token==99-====" + res.locals.token);
            res.render('server/index', {data: JSON.stringify(obj), token: res.locals.token});
        });

    } else {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
};

/**
 * 项目初始化校验 install beiwp on 2016/8/22
 * @param req
 * @param res
 */
exports.install = function (req, res) {
    console.log(req.method + '======Index controller install ======' + new Date());

    if (req.session.user) {
        var path = core.translateAdminDir('');
        res.redirect(path);
    }

    User.find({}, function (err, results) {
        if (err) return;
        if (results.length < 1) {
            if (req.method === 'GET') {
                res.render('server/user/install', {
                    title: '初始化'
                });
            } else if (req.method === 'POST') {
                var createUser = function (obj) {
                    var user = new User(obj);
                    user.save(function (err, user) {
                        if (err) {
                            var errMsg = core.getErrorMessage(err);
                            res.render('info', {
                                message: '初始化失败 ' + errMsg
                            })
                        } else if (user) {
                            res.render('info', {
                                message: '初始化完成'
                            });
                        }

                    });
                };

                var obj = req.body;
                obj.status = 101;

                Role.find({status: 201}, function (err, roles) {
                    if (roles.length < 1) {
                        console.log('没有角色' + config.admin.role.admin);
                        var role = new Role({
                            name: config.admin.role.admin,
                            actions: [],
                            status: 201 //系统默认管理员角色
                        });

                        role.save(function (err, result) {
                            console.log('role result', result);
                            obj.roles = [role._id];
                            createUser(obj);
                        });

                        //管理员也是用户
                        new Role({
                            name: config.admin.role.user,
                            actions: [],
                            status: 202 //系统默认用户角色
                        }).save();
                    } else {
                        obj.roles = [roles[0]._id];
                        createUser(obj);
                    }

                });
            }
        } else {
            var path = core.translateAdminDir('');
            res.redirect(path);
        }
    });
};


