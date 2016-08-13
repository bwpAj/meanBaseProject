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