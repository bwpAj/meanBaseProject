/**
 *
 * =================================================================================================
 *     Task ID              Date                 Author              Description
 * ----------------+----------------+-------------------+-------------------------------------------
 *     文件上传          2016年7月25日         beiwp               文件上传Controller
 *
 */
'use strict';
var mongoose = require('mongoose'),
    fs = require('fs'),
    path = require('path'),
    File = mongoose.model('File'),
    _ = require('underscore'),
    multiparty = require('multiparty'),
    config = require('../../config'),
    core = require('../../libs/core'),
    uploader = require('../../libs/uploader')(config.upload);


exports.add = function (req, res) {
    console.log(req.method + '======file controller add ======' + new Date());
    if (req.method === 'POST') {
        uploader.processFileUpload(req, function (result) {
            if (!result) {
                return core.resJson(res, {message: '上传失败', type: 0});
            }
            if (req.session.user) {
                result.author = req.session.user._id;
            }
            var file = new File(result);
            file.save(function (err, obj) {
                if (err || !obj) {
                    return core.resJson(res, {message: '上传失败', type: 0});
                }
                core.resJson(res, {message: '上传成功', type: 1})
            });

        });
    }
};

/**
 * 列表
 * @param req
 * @param res
 */
exports.list = function (req, res) {
    console.log(req.method + '======file controller list ======' + new Date());
    var condition = {};


    //分页查询参数 暂时根据用户名 姓名模糊匹配查询
    //{'$or':[{'username':new RegExp('test')}
    //{'username':new RegExp('tes'),'name':new RegExp('呵呵')}
    var name = req.query.name;
    if (name) {
        condition.name = new RegExp(name);
    }
    File.count(condition, function (err, total) {
        console.log("总数==" + total);
        if (err) {
            return core.resJson(res, {type: 0, message: '查询失败'});
        }
        var query = File.find(condition).populate('author');
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
            //console.log(obj);
            core.resJson(res, obj, 'list');
        });
    });
};

/**
 * 删除
 * @param req
 * @param res
 */
exports.del = function (req, res) {
    var id = req.params.fileId;//获取参数
    console.log(req.method + '======file controller del ======' + (id || new Date()));
    var delHandle = function (file) {
        file.remove(function (err) {
            if (err) {
                core.resJson(res, {type: 0, message: '删除失败'});
            }
            core.resJson(res, {type: 1, message: '删除成功'});
        })
    };

    File.findById(id).populate('author').exec(function (err, result) {
        if (err) {
            return core.resJson(res, {type: 0, message: core.getErrorMessage(err)});
        }
        if (!result) {
            return core.resJson(res, {type: 0, message: '不存在此文件'});
        }

        var isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

        if (!isAuthor) {
            return core.resJson(res, {type: 0, message: '没有权限'});
        }
        delHandle(result);
    })
};