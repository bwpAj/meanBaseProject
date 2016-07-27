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
        console.log(_existsSync);

    function checkExists(dir){
        fs.exists(dir, function(exists){
            if(!exists){
               mkdirp(dir, function(err){
                   if(err){
                       console.log("++"+err);
                   }else{
                       console.log("默认目录不存在，已自动创建： [" + dir + "]");
                   }
               })
            }
        })
    }

    //判断文件合法性
    function validate(files){
        var error = '';
        if (options.minFileSize && options.minFileSize > file.size) {
            error = 'File is too small';
        } else if (options.maxFileSize && options.maxFileSize < file.size) {
            error = 'File is too big';
        } else if (!options.acceptFileTypes.test(file.name)) {
            error = 'Filetype not allowed';
        }
        return !error;
    }

    //已上传的文件防重名
    function nameCountFunc(s, index, ext) {
        return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
    };
    function safeName(name) {
        // Prevent directory traversal and creating hidden system files:
        //path.basename('/foo/bar/baz/asdf/quux.html') return 'quux.html'
        var name = path.basename(name).replace(/^\.+/, '');
        // Prevent overwriting existing files:
        while (_existsSync(options.uploadDir + '/' + name)) {
            name = name.replace(nameCountRegexp, nameCountFunc);
        }
        return name;
    };

    //构造文件url
    function initUrls(host, name) {
        var baseUrl = (options.useSSL ? 'https:' : 'http:') +
            '//' + host + options.uploadUrl;
        var url = baseUrl + encodeURIComponent(name);
        return url;
    };
    //判断文件临时路径是否存在
    checkExists(options.tmpDir);
    checkExists(options.uploadDir);

    var client = null;

    var Uploader = {};
    Uploader.post = function(req, res, callback){
        console.log('=================');
        console.log(req.body);
        var files = [];//req.files.files;
        var len = files.length;
        if(len > 1){
            return;
        }
        var resulte = [];
        if(options.storage.type === 'local'){
            //本地存储
            files.forEach(function(file){
                if(!validate(file)){
                    //删除文件
                    fs.unlink(file.path);
                    return;
                }
                var sName = safeName(file.name);
                fs.renameSync(file.path, options.uploadDir + '/' + sName);
                result.push({
                    url: initUrls(req.headers.host, sName),
                    name: sName,
                    size: file.size,
                    type: file.type
                });
            });
            callback.call(null, {
                files: result
            });
        }
    }

    return Uploader;
};


