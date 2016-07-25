/**
 *
 * =================================================================================================
 *     Task ID			  Date			     Author		      Description
 * ----------------+----------------+-------------------+-------------------------------------------
 *     文件上传          2016年7月25日         beiwp			   文件上传
 *
 *
 *     文件上传用法
 *     var upload = require('./upload')({maxFileSize: 30000});
 *     upload.post(req, res, callback);
 *
 *     文件目录创建
 *     mkdirp = require('mkdirp');
 *     mkdirp(dir, function(err) {------------});
 */

var _ = require('underscore');
var config = require('../config');
module.exports = function(opts){
    var path = require('path'),
        fs = require('fs'),
        _existsSync = fs.existsSync || path.existsSync,
        mkdirp = require('mkdirp'),
        nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/,
        options = _.extend({}, config.upload, opts);

    function checkExists(dir){
        console.log(dir);
        fs.exists(dir, function(exists){
            if(!exists){
               mkdirp(dir, function(err){
                   if(!err){
                        console.error(err);
                   }else{
                       console.log("默认目录不存在，已自动创建： [" + dir + "]");
                   }
               })
            }
        })
    }

    checkExists(options.tmpDir);
    checkExists(options.uploadDir);

};


