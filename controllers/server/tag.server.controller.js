/**
 * Created by beiwp on 2016/9/9.
 */
'use strict';

var mongoose = require('mongoose'),
    Tag = mongoose.model('Tag'),
    core = require('../../libs/core'),
    config = require('../../config/config'),
    _ = require('underscore');


/**
 * 删除对象 Tag beiwp on 2016/9/9
 */
var funDelTag = function (obj, res, mess) {
    obj.remove(function (err) {
        if (err) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        core.resJson(res, {type: 1, message: '删除成功'});
    });
};

/**
 * 新增更新对象 Tag beiwp on 2016/9/9
 */
var funEditTag = function (obj, res, mess) {
    obj.save(function (err, result) {
        if (err || !result) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        core.resJson(res, {type: 1, message: mess + '成功', data: result});
    });
};


/**
 * 新增 Tag beiwp on 2016/9/9
 * @param req
 * @param res
 */
exports.addTag = function (req, res) {
    console.log(req.method + '======Tag controller addTag ======' + new Date());

    var obj = req.body;
    if (obj) {
        if (req.session.user) {
            obj.author = req.session.user._id;
        }

        var tag = new Tag(obj);

        funEditTag(tag, res, '新增');
    }
};

/**
 * 删除 Tag beiwp on 2016/9/9
 * @param req
 * @param res
 */
exports.delTag = function (req, res) {
    console.log(req.method + '======Tag controller delTag ======' + new Date());

    var id = req.params.id;//获取参数
    if (id) {
        Tag.findById(id).populate('author').exec(function (err, result) {
            if (err) {
                return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
            }
            if (!result) {
                return core.resJson(res, {type: 0, message: '查询对象不存在'});
            }

            // 权限判断
            /*var isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
             var isAuthor = result.author && ((result.author._id + '') === req.session.user._id);
             if (!(isAdmin && isAuthor)) {
             return core.resJson(res, {type: 0, message: '没有权限'});
             }*/

            funDelTag(result, res);

        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }

};


/**
 * 修改 Tag beiwp on 2016/9/9
 * @param req
 * @param res
 */
exports.editTag = function (req, res) {
    console.log(req.method + '======Tag controller editTag ======' + new Date());

    var id = req.params.id;//获取参数
    var obj = req.body; //获取对象

    if (id && obj) {
        Tag.findById(id).populate('author').exec(function (err, result) {
            if (err) {
                return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
            }
            if (!result) {
                return core.resJson(res, {type: 0, message: '查询对象不存在'});
            }

            // 权限判断
            /*var isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
             var isAuthor = result.author && ((result.author._id + '') === req.session.user._id);
             if (!(isAdmin && isAuthor)) {
             return core.resJson(res, {type: 0, message: '没有权限'});
             }*/


            _.extend(result, obj);

            funEditTag(result, res, '修改');

        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }
};

/**
 * 列表 Tag beiwp on 2016/9/9
 * @param req
 * @param res
 */
exports.listTag = function (req, res) {
    console.log(req.method + '======Tag controller list ======' + new Date());
    var condition = {};

    if (req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }

    //分页查询参数 暂时根据用户名 姓名模糊匹配查询
    //{'$or':[{'username':new RegExp('test')}
    //{'username':new RegExp('tes'),'name':new RegExp('呵呵')}
    var nameParams = req.query.name;
    if (nameParams) {
        condition.name = new RegExp(nameParams);
    }
    Tag.count(condition, function (err, total) {
        console.log("Tag总数==" + total);
        if (err) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        var query = Tag.find(condition).populate('author');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        pageInfo.countItems = total;
        console.log('Tag============分页参数============');
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
 * 查询所有 Tag  beiwp on 2016/9/9
 * @param req
 * @param res
 */
exports.listAllTag = function (req, res) {
    var condition = {};

    if (req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }

    Tag.count(condition, function (err, total) {
        Tag.find(condition).populate('author').exec(function (err, results) {
            //返回结果
            var obj = {
                type: 1,
                message: '查询成功',
                count: total,
                rows: results
            };
            core.resJson(res, obj);
        });
    })
};

/**
 * 查看  Tag beiwp on 2016/9/9
 * @param req
 * @param res
 */
exports.viewTag = function (req, res) {
    console.log(req.method + '======Tag controller viewTag ======' + new Date());

    var id = req.params.id;//获取参数
    if (id) {
        Tag.findById(id).populate('author').exec(function (err, result) {
            if (err) {
                return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
            }
            if (!result) {
                return core.resJson(res, {type: 0, message: '查询对象不存在'});
            }

            //权限判断
            /*var isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
             var isAuthor = result.author && (( result.author._id + '' ) === req.session.user._id);
             if (!( isAdmin && isAuthor)) {
             return core.resJson(res, {type: 0, message: '没有权限'})
             }*/

            core.resJson(res, {type: 1, data: result});
        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }

};

