/**
 * Created by beiwp on 2016/8/24.
 */
'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Role = mongoose.model('Role'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    passport = require('passport'),
    core = require('../../libs/core'),
    config = require('../../config/config'),
    ACTIONS = require('../../config/actions'),
    uploader = require('../../libs/uploader')(config.upload);

var noRedirect = [
    'user/login',
    'user/forget',
    'user/register'
];


/**
 * 项目初始化检验 用户数据为空时 先进入管理注册页面
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.checkUser = function (req, res, next) {
    console.log('\n=======user checkuser======' + new Date() + '\n');
    if (req.session.user) {
        var path = core.translateAdminDir('/index');
        return res.redirect(path);
    }
    User.find({}, function (err, results) {
        if (err) return;
        if (results.length > 0) {
            return next();
        } else {
            return res.render('server/user/install');
        }
    });
};

/**
 * 跳转登录
 * @param req
 * @param res
 */

exports.jumpLogin = function (req, res) {
    req.session.loinReferer = req.headers.referer;
    res.render('server/user/login');
};


/**
 * 登录
 * @param req
 * @param res
 */
exports.login = function (req, res, next) {
    console.log(req.method + '======User controller login ======' + new Date());

    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
        passport.authenticate('local', function (err, user, info) {
            var token;
            if (err) {
                res.render('info', {message: core.getErrorMessage(err)});
            }
            if (info) {
                res.render('info', {message: info});
            }
            if (user) {
                token = user.generateJwt();
                console.log("token===" + token);
                req.session.token = token;
                //记录登录信息
                user.last_login_date = new Date();
                user.last_login_ip = core.getIp(req);
                user.save();
                req.session.user = user;
                console.log('登录成功', new Date());
                console.log(req.session.user);

                var path = core.translateAdminDir('/');
                var ref = req.session.loginReferer || path;

                for (var i in noRedirect) {
                    if (ref.indexOf(noRedirect[i]) > -1) {
                        ref = path;
                        break;
                    }
                }
                res.redirect(ref);
            } else {
                res.render('info', {message: '用户不存在'});
            }

        })(req, res, next);

    } else {
        res.render('info', {
            message: '参数异常'
        });
    }

};

/**
 * 注册
 * @param req
 * @param res
 * @param next
 */
exports.register = function (req, res, next) {
    console.log(req.method + '======User controller register ======' + new Date());

    var method = req.method;
    if (method === 'GET') {
        res.render('server/user/register', {})
    } else if (method === 'POST') {
        var obj = req.body;
        Role.findOne({
            status: 202
        }, function (err, role) {
            console.log(role);
            if (err || !role) {
                return res.render('info', {
                    message: '注册失败，未开放角色：' + config.admin.role.user
                });
            }
        });

    }
};

/**
 * 退出登录
 * session.destroy() 注销session
 * @param req
 * @param res
 * @param next
 */
exports.logout = function (req, res, next) {
    if (req.session) {
        req.session.User = null;
        req.session.destroy();
        console.log('注销成功');
        var path = core.translateAdminDir('/');
        res.redirect(path);
    } else {
        res.render('info', {
            message: '注销失败'
        });
    }
};


/**
 * 删除对象 User beiwp on 2016/8/24
 */
var funDelUser = function (obj, res, mess) {
    obj.remove(function (err) {
        if (err) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        core.resJson(res, {type: 1, message: '删除成功'});
    });
};

/**
 * 新增更新对象 User beiwp on 2016/8/24
 */
var funEditUser = function (obj, res, mess) {
    obj.save(function (err, result) {
        if (err || !result) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        core.resJson(res, {type: 1, message: mess + '成功', data: result});
    });
};


/**
 * 新增 User beiwp on 2016/8/24
 * @param req
 * @param res
 */
exports.addUser = function (req, res) {
    console.log(req.method + '======User controller addUser ======' + new Date());

    var obj = req.body;
    if (obj) {
        Role.findOne({status: 202}, function (err, role) {
            if (err || !role) {
                core.resJson(res, {type: 0, message: '未开放角色'})
            }
            obj.roles = [role._id];
            if (req.session.user) {
                obj.author = req.session.user._id;
            }
            /*唯一性验证*/
            User.count({username: obj.username}, function (err, count) {
                if (count > 0) {
                    return core.resJson(res, {type: 0, message: '用户名已存在'})
                } else {
                    /*唯一性验证*/
                    User.count({email: obj.email}, function (err, count) {
                        if (count > 0) {
                            return core.resJson(res, {type: 0, message: '邮箱已存在'})
                        } else {
                            var user = new User(obj);
                            funEditUser(user, res, '新增');
                        }
                    });
                }
            });
        });

    }
};

/**
 * 删除 User beiwp on 2016/8/24
 * @param req
 * @param res
 */
exports.delUser = function (req, res) {
    console.log(req.method + '======User controller delUser ======' + new Date());

    var id = req.params.id;//获取参数
    if (id) {
        User.findById(id).populate('author').exec(function (err, result) {
            if (err) {
                return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
            }
            if (!result) {
                return core.resJson(res, {type: 0, message: '查询对象不存在'});
            }

            // 权限判断
            var isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            var isAuthor = result.author && ((result.author._id + '') === req.session.user._id);
            if (!(isAdmin && isAuthor)) {
                return core.resJson(res, {type: 0, message: '没有权限'});
            }
            if (result.status === 101) {
                return core.resJson(res, {type: 0, message: '不能删除系统默认管理员'})
            }

            funDelUser(result, res);

        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }

};


/**
 * 修改 User beiwp on 2016/8/24
 * @param req
 * @param res
 */
exports.editUser = function (req, res) {
    console.log(req.method + '======User controller editUser ======' + new Date());

    var id = req.params.id;//获取参数
    var obj = req.body; //获取对象

    if (id && obj) {
        User.findById(id).populate('author').exec(function (err, result) {
            if (err) {
                return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
            }
            if (!result) {
                return core.resJson(res, {type: 0, message: '查询对象不存在'});
            }

            // 权限判断
            var isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            var isAuthor = result.author && ((result.author._id + '') === req.session.user._id);
            if (!(isAdmin && isAuthor)) {
                return core.resJson(res, {type: 0, message: '没有权限'});
            }

            var query;
            if (typeof obj.roles === 'string') {
                query = Role.find({_id: obj.roles});
            } else if (typeof obj.roles === 'object') {
                query = Role.find({_id: {$in: obj.roles}});                //查询 age等于20或21或21或’haha’的文档
            }
            if (!query) {
                return core.resJson(res, {type: 0, message: '请选择一个角色'})
            }
            query.exec(function (err, roles) {
                if (result.status === 101) {
                    var statuses = _.pluck(roles, 'status'); //在roles对象中 返回 status字段值的一个数组
                    if (statuses.indexOf(201) === -1) {
                        return core.resJson(res, {type: 0, message: '系统管理员角色不正确'});
                    }
                }
                obj.roles = roles;

                _.extend(result, obj);

                funEditUser(result, res, '修改');
            });


        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }
};

/**
 * 列表 User beiwp on 2016/8/24
 * @param req
 * @param res
 */
exports.listUser = function (req, res, next) {

    console.log(req.method + '======User controller list ======' + new Date());

    //filterAuthor(req, res, next);


    var condition = {};

    //分页查询参数 暂时根据用户名 姓名模糊匹配查询
    //{'$or':[{'username':new RegExp('test')}
    //{'username':new RegExp('tes'),'name':new RegExp('呵呵')}
    var usernameParams = req.query.username;
    var nameParams = req.query.name;
    if (usernameParams) {
        condition.username = new RegExp(usernameParams);
    }
    if (nameParams) {
        condition.name = new RegExp(nameParams);
    }

    User.count(condition, function (err, total) {
        console.log("User总数==" + total);
        if (err) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        var query = User.find(condition).populate('author').populate('roles');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        pageInfo.countItems = total;
        console.log('User============分页参数============');
        console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function (err, results) {
            //返回结果
            var obj = {
                type: 1,
                message: '查询成功',
                pages: pageInfo,
                rows: results
            };
            core.resJson(res, obj, 'list');
        });
    });
};

/**
 * 查看  User beiwp on 2016/8/24
 * @param req
 * @param res
 */
exports.viewUser = function (req, res) {
    console.log(req.method + '======User controller viewUser ======' + new Date());

    var id = req.params.id;//获取参数
    if (id) {
        User.findById(id).populate('author').exec(function (err, result) {
            if (err) {
                return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
            }
            if (!result) {
                return core.resJson(res, {type: 0, message: '查询对象不存在'});
            }

            //权限判断
            var isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            var isAuthor = result.author && (( result.author._id + '' ) === req.session.user._id);
            if (!( isAdmin && isAuthor)) {
                return core.resJson(res, {type: 0, message: '没有权限'})
            }

            try {
                var condition = {};
                if (req.Roles.indexOf('admin') < 0) {
                    condition.author = req.session.user._id;
                }
                Role.find(condition, function (err, roles) {
                    if (!err && roles) {
                        var obj = {user: result, roles: roles};
                        core.resJson(res, {type: 1, data: obj});
                    }
                })
            } catch (e) {
                core.resJson(res, result);
            }

            //core.resJson(res, result);
        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }

};


/**
 * 查看登录者信息   beiwp on 2016/8/24
 * @param req
 * @param res
 */
exports.viewMe = function (req, res) {
    console.log(req.method + '======User controller viewMe ======' + new Date());

    var id = req.session.user._id;
    if (id) {
        User.findById(id).populate('roles').populate('file').populate('author').exec(function (err, user) {

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
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }

};


/**
 * 编辑   beiwp on 2016/9/2
 * @param req
 * @param res
 */
exports.editMe = function (req, res) {
    console.log(req.method + '======User controller editMe ======' + new Date());

    var id = req.session.user._id;
    if (id) {
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

    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }
};

/**
 * 更新密码 beiwp on 2016/9/2
 * @param req
 * @param res
 */
exports.updatePassword = function (req, res) {
    console.log(req.method + '======User controller updatePassword ======' + new Date());

    var id = req.session.user._id;
    if (id) {
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
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }
};


/*
 * 修改头像 beiwp on 2016/9/2
 * */
exports.updateHeadImg = function (req, res) {
    console.log(req.method + '======User controller updateHeadImg ======' + new Date());

    var id = req.session.user._id;
    if (id) {
        User.findById(id).exec(function (err, user) {
            if (err || !user) {
                return core.resJson(res, {message: '设置失败', type: 0})
            }
            uploader.processFileUpload(req, config.upload.userImgDir, function (fileResult) {
                if (!fileResult) {
                    return core.resJson(res, {message: '上传失败', type: 0});
                }

                var headImg = user.headImg;
                if (headImg) {
                    var imgHead = path.join(process.cwd(), 'public/' + headImg);
                    console.log("----------------" + imgHead);
                    fs.unlink(imgHead, function (err) {
                        if (!err) {
                            console.log('旧图片 删除成功  ' + path.basename(headImg));
                        }
                        user.headImg = fileResult.url;
                        var uUser = new User(user);
                        funEditUser(uUser, res, '图片更新');
                    });
                } else {
                    user.headImg = fileResult.url;
                    var uUser = new User(user);
                    funEditUser(uUser, res, '图片更新');
                }

                /*_.extend(userFile, fileResult);
                 var file = new File(userFile);
                 file.save(function (err, fileObj) {
                 if (err || !fileObj) {
                 return core.resJson(res, {message: '上传失败', type: 0});
                 }
                 var fileId = fileObj._id;
                 user.file = fileId;
                 var uUser = new User(user);
                 uUser.save(function (err1, newUser) {
                 if (err1) {
                 return core.resJson(res, {message: '设置失败', type: 0});
                 }
                 core.resJson(res, {message: '设置成功', url: fileResult.url, type: 1})
                 });

                 });*/
            });

        })
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }

};