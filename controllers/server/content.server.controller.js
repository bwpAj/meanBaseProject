/**
 * Created by beiwp on 2016/9/8.
 */
'use strict';

var mongoose = require('mongoose'),
    Content = mongoose.model('Content'),
    core = require('../../libs/core'),
    config = require('../../config/config'),
    _ = require('underscore');


/**
 * 删除对象 Content beiwp on 2016/9/8
 */
var funDelContent = function (obj, res, mess) {
    obj.remove(function (err) {
        if (err) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        core.resJson(res, {type: 1, message: '删除成功'});
    });
};

/**
 * 新增更新对象 Content beiwp on 2016/9/8
 */
var funEditContent = function (obj, res, mess) {
    obj.save(function (err, result) {
        if (err || !result) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        core.resJson(res, {type: 1, message: mess + '成功', data: result});
    });
};


/**
 * 新增 Content beiwp on 2016/9/8
 * @param req
 * @param res
 */
exports.addContent = function (req, res) {
    console.log(req.method + '======Content controller addContent ======' + new Date());

    var obj = req.body;
    if (obj) {
        var Content = new Content(obj);

        funEditContent(Content, res);
    }
};

/**
 * 删除 Content beiwp on 2016/9/8
 * @param req
 * @param res
 */
exports.delContent = function (req, res) {
    console.log(req.method + '======Content controller delContent ======' + new Date());

    var id = req.params.id;//获取参数
    if (id) {
        Content.findById(id).populate('author').exec(function (err, result) {
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

            funDelContent(result, res);

        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }

};


/**
 * 修改 Content beiwp on 2016/9/8
 * @param req
 * @param res
 */
exports.editContent = function (req, res) {
    console.log(req.method + '======Content controller editContent ======' + new Date());

    var id = req.params.id;//获取参数
    var obj = req.body; //获取对象

    if (id && obj) {
        Content.findById(id).populate('author').exec(function (err, result) {
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

            funEditContent(result, res);

        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }
};

/**
 * 列表 Content beiwp on 2016/9/8
 * @param req
 * @param res
 */
exports.listContent = function (req, res) {
    console.log(req.method + '======Content controller list ======' + new Date());
    var condition = {};

    //分页查询参数 暂时根据用户名 姓名模糊匹配查询
    //{'$or':[{'username':new RegExp('test')}
    //{'username':new RegExp('tes'),'name':new RegExp('呵呵')}
    var nameParams = req.query.name;
    if (nameParams) {
        condition.name = new RegExp(nameParams);
    }
    Content.count(condition, function (err, total) {
        console.log("Content总数==" + total);
        if (err) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        var query = Content.find(condition).populate('author');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        pageInfo.countItems = total;
        console.log('Content============分页参数============');
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
 * 查看  Content beiwp on 2016/9/8
 * @param req
 * @param res
 */
exports.viewContent = function (req, res) {
    console.log(req.method + '======Content controller viewContent ======' + new Date());

    var id = req.params.id;//获取参数
    if (id) {
        Content.findById(id).populate('author').exec(function (err, result) {
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

            core.resJson(res, result);
        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }

};

