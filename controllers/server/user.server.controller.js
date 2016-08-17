/**
 * Created by beiwp on 2016/5/25.
 */

var mongoose = require('mongoose');
var Role = mongoose.model('Role');
var User = mongoose.model('User');
var core = require('../../libs/core');
var config = require('../../config');
var _ = require('underscore');

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
 * 登录
 * @param req
 * @param res
 * @param next
 */
exports.login = function (req, res, next) {
    if (req.method === 'GET') {
        req.session.loinReferer = req.headers.referer;
        res.render('server/user/login');
    } else if (req.method === 'POST') {
        var username = req.body.username;
        var password = req.body.password;
        User.findOne({
            username: username
        }).populate('roles').exec(function (err, user) {
            if (!user) {
                return res.render('info', {
                    message: '登录失败，查无此人'
                });
            }
            if (user.authenticate(password)) {

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
                res.render('info', {
                    message: '密码不正确'
                });
            }


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
    ;
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
 * 列表
 * @param req
 * @param res
 */
exports.list = function (req, res) {
    console.log(req.method + '======user controller list ======' + new Date());
    var condition = {};
    //用户权限
    /*if (req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }*/

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
        console.log("总数==" + total);
        if (err) {
            return core.resJson(res, {type: 0, message: '查询失败'});
        }
        var query = User.find(condition).populate('author').populate('roles');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        pageInfo.countItems = total;
        console.log('============分页参数============');
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
 * 查看
 * @param req
 * @param res
 */
exports.one = function (req, res) {
    console.log(req.method + '======user controller one ======' + new Date());
    var id = req.params.id;
    User.findById(id).populate('author').exec(function (err, user) {
        if (err || !user) {
            return core.resJson(res, {type: 0, message: '查询出错'});
        }

        var isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        var isAuthor = user.author && (( user.author._id + '' ) === req.session.user._id);
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
                    var obj = {user: user, roles: roles};
                    console.log(obj);
                    core.resJson(res, {type: 1, data: obj});
                }
            })
        } catch (e) {
            core.resJson(res, user);
        }

    });

};

/**
 * 删除
 * @param req
 * @param res
 */
exports.del = function (req, res) {
    console.log(req.method + '======user controller del ======' + new Date());
    var delHandle = function (user) {
        user.remove(function (err) {
            if (err) {
                core.resJson(res, {type: 0, message: '删除失败'});
            }
            if (id === req.session.user._id) {
                req.session.destroy(); //注销用户信息
                res.locals.User = null;
                var path = core.translateAdminDir('/user/login');
                return res.redirect(path);
            }

            core.resJson(res, {type: 1, message: '删除成功'});
        })
    };

    var id = req.params.id;//获取参数
    User.findById(id).populate('roles').populate('author').exec(function (err, result) {
        if (err) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        if (!result) {
            return core.resJson(res, {type: 0, message: '用户不存在'});
        }

        var isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        var isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

        if (!(isAdmin && isAuthor)) {
            return core.resJson(res, {type: 0, message: '没有权限'});
        }
        if (result.status === 101) {
            return core.resJson(res, {type: 0, message: '不能删除系统默认管理员'})
        }
        delHandle(result);
    })
};

/**
 * 新增
 * @param req
 * @param res
 */
exports.add = function (req, res) {
    console.log(req.method + '======user controller add ======' + new Date());

    var obj = req.body;
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
                        user.save(function (err, result) {
                            if (err) {
                                console.log(core.getErrorMessage(err));
                                return core.resJson(res, {type: 0, message: '添加失败'});
                            }
                            core.resJson(res, {type: 1, message: '添加成功'});
                        });
                    }
                });
            }
        });
    });

};

/**
 * 修改
 * @param req
 * @param res
 */
exports.edit = function (req, res) {
    console.log(req.method + '======user controller edit ======' + new Date());

    var id = req.params.id;
    var editHandler = function (user) {
        user.save(function (err, user) {
            if (err || !user) {
                return core.resJson(res, {type: 0, message: '更新失败'});
            }
            if (id === req.session.user._id) {
                req.session.user = user;
                res.locals.User = user;
            }
            core.resJson(res, {type: 1, message: '更新成功'});
        });
    };

    var obj = req.body;
    User.findById(id).populate('roles').populate('author').exec(function (err, result) {
        if (err || !result) {
            return core.resJson(res, {type: 0, message: '查询失败'});
        }

        /*权限判断*/
        var isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        var isAuthor = result.author && (( result.author._id + '' ) === req.session.user._id );
        if (!( isAuthor && isAdmin)) {
            return core.resJson(res, {type: 0, message: '没有权限'})
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
            editHandler(result);
        });
    });
};