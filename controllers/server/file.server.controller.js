/**
 * Created by beiwp on 2016/8/24.
 */
'use strict';

var mongoose = require('mongoose'),
    File = mongoose.model('File'),
    core = require('../../libs/core'),
    config = require('../../config/config'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    multiparty = require('multiparty'),
    uploader = require('../../libs/uploader')(config.upload);


/**
 * 删除对象 File beiwp on 2016/8/24
 */
var funDelFile = function (obj, res, mess) {
    obj.remove(function (err) {
        if (err) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        core.resJson(res, {type: 1, message: '删除成功'});
    });
};

/**
 * 新增更新对象 File beiwp on 2016/8/24
 */
var funEditFile = function (obj, res, mess) {
    obj.save(function (err, result) {
        if (err || !result) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        core.resJson(res, {type: 1, message: mess + '成功'});
    });
};


/**
 * 新增 File beiwp on 2016/8/24
 * @param req
 * @param res
 */
exports.addFile = function (req, res) {
    console.log(req.method + '======File controller addFile ======' + new Date());

    uploader.processFileUpload(req, '', function (result) {
        if (!result) {
            return core.resJson(res, {message: '上传失败', type: 0});
        }
        if (req.session.user) {
            result.author = req.session.user._id;
        }
        var file = new File(result);
        funEditFile(file, res, '上传');

    });
};

/**
 * 删除 File beiwp on 2016/8/24
 * @param req
 * @param res
 */
exports.delFile = function (req, res) {
    console.log(req.method + '======File controller delFile ======' + new Date());

    var id = req.params.id;//获取参数
    if (id) {
        File.findById(id).populate('author').exec(function (err, result) {
            if (err) {
                return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
            }
            if (!result) {
                return core.resJson(res, {type: 0, message: '查询对象不存在'});
            }

            if (result.url) {
                var tempUrl = path.join(process.cwd(), 'public/' + result.url);
                fs.unlink(tempUrl, function (err) {
                    if (!err) {
                        console.log('旧图片 删除成功  ' + path.basename(result.url));
                    }
                    funDelFile(result, res);
                });
            } else {
                funDelFile(result, res);
            }
            // 权限判断
            /*var isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
             var isAuthor = result.author && ((result.author._id + '') === req.session.user._id);
             if (!(isAdmin && isAuthor)) {
             return core.resJson(res, {type: 0, message: '没有权限'});
             }*/

            //funDelFile(result, res);

        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }

};


/**
 * 修改 File beiwp on 2016/8/24
 * @param req
 * @param res
 */
exports.editFile = function (req, res) {
    console.log(req.method + '======File controller editFile ======' + new Date());

    var id = req.params.id;//获取参数
    var obj = req.body; //获取对象

    if (id && obj) {
        File.findById(id).populate('author').exec(function (err, result) {
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

            funEditFile(result, res);

        });
    } else {
        core.resJson(res, {type: 0, message: '参数获取失败'});
    }
};

/**
 * 列表 File beiwp on 2016/8/24
 * @param req
 * @param res
 */
exports.listFile = function (req, res) {
    console.log(req.method + '======File controller list ======' + new Date());
    var condition = {};

    //分页查询参数 暂时根据用户名 姓名模糊匹配查询
    //{'$or':[{'username':new RegExp('test')}
    //{'username':new RegExp('tes'),'name':new RegExp('呵呵')}
    var nameParams = req.query.name;
    if (nameParams) {
        condition.name = new RegExp(nameParams);
    }
    File.count(condition, function (err, total) {
        console.log("File总数==" + total);
        if (err) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        var query = File.find(condition).populate('author');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        pageInfo.countItems = total;
        console.log('File============分页参数============');
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
 * 查看  File beiwp on 2016/8/24
 * @param req
 * @param res
 */
exports.viewFile = function (req, res) {
    console.log(req.method + '======File controller viewFile ======' + new Date());

    var id = req.params.id;//获取参数
    if (id) {
        File.findById(id).populate('author').exec(function (err, result) {
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

