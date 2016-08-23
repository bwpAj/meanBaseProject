/**
 * Created by beiwp on 2016/8/18.
 */

var mongoose = require('mongoose'),
    Role = mongoose.model('Role'),
    core = require('../../libs/core'),
    config = require('../../config'),
    actions = require('../../actions'),
    _ = require('underscore');


/**
 * 删除对象 Role beiwp on 2016/8/18
 */
var funDelRole = function (obj, res) {
    obj.remove(function (err) {
        if (err) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        core.resJson(res, {type: 1, message: '删除成功'});
    });
};

/**
 * 新增更新对象 Role beiwp on 2016/8/18
 */
var funEditRole = function (obj, res, mess) {
    obj.save(function (err, result) {
        if (err || !result) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        core.resJson(res, {type: 1, message: mess+'成功'});
    });
};


/**
 * 新增 Role beiwp on 2016/8/18
 * @param req
 * @param res
 */
exports.addRole = function (req, res) {
    console.log(req.method + '======Role controller addRole ======' + new Date());

    var obj = req.body;
    if (obj) {
        if (req.session.user) {
            obj.author = req.session.user._id;
        }

        var role = new Role(obj);
        funEditRole(role, res, '新增');
    }
};

/**
 * 删除 Role beiwp on 2016/8/18
 * @param req
 * @param res
 */
exports.delRole = function (req, res) {
    console.log(req.method + '======Role controller delRole ======' + new Date());

    var id = req.params.id;//获取参数
    if (id) {
        Role.findById(id).populate('author').exec(function (err, result) {
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

            funDelRole(result,res);
        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }

};


/**
 * 修改 Role beiwp on 2016/8/18
 * @param req
 * @param res
 */
exports.editRole = function (req, res) {
    console.log(req.method + '======Role controller editRole ======' + new Date());

    var id = req.params.id;//获取参数
    var obj = req.body; //获取对象

    if (id && obj) {
        Role.findById(id).populate('author').exec(function (err, result) {
            if (err) {
                return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
            }
            if (!result) {
                return core.resJson(res, {type: 0, message: '查询对象不存在'});
            }

            // 权限判断
            var isAuthor = result.author && ((result.author._id + '') === req.session.user._id);
            if (!isAuthor) {
                return core.resJson(res, {type: 0, message: '没有权限'});
            }

            _.extend(result, obj);

            funEditRole(result, res, '修改');

        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }
};

/**
 * 列表 Role beiwp on 2016/8/18
 * @param req
 * @param res
 */
exports.listRole = function (req, res) {
    console.log(req.method + '======Role controller list ======' + new Date());
    var condition = {};

    //分页查询参数 暂时根据用户名 姓名模糊匹配查询
    //{'$or':[{'username':new RegExp('test')}
    //{'username':new RegExp('tes'),'name':new RegExp('呵呵')}
    var nameParams = req.query.name;
    if (nameParams) {
        condition.name = new RegExp(nameParams);
    }
    Role.count(condition, function (err, total) {
        console.log("Role总数==" + total);
        if (err) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        var query = Role.find(condition).populate('author');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        pageInfo.countItems = total;
        console.log('Role============分页参数============');
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
 * 查看  Role beiwp on 2016/8/18
 * @param req
 * @param res
 */
exports.viewRole = function (req, res) {
    console.log(req.method + '======Role controller viewRole ======' + new Date());

    var id = req.params.id;//获取参数
    if (id) {
        Role.findById(id).populate('author').exec(function (err, result) {
            if (err) {
                return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
            }
            if (!result) {
                return core.resJson(res, {type: 0, message: '查询对象不存在'});
            }

            core.resJson(res, {type: 1, data: result});
        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }

};

/**
 * 获取   RoleActions  beiwp on 2016/8/22
 * @param req
 * @param res
 */
exports.getRoleActions = function(req ,res){
    console.log(req.method + '======Role controller getRoleActions ======' + new Date());
    console.log(actions);
    core.resJson(res,actions);
};



