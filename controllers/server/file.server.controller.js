/**
 *
 * =================================================================================================
 *     Task ID			  Date			     Author		      Description
 * ----------------+----------------+-------------------+-------------------------------------------
 *     文件上传          2016年7月25日         beiwp			   文件上传Controller
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
    core = require('../../libs/core');

var uploader = require('../../libs/uploader')(config.upload);


exports.add = function(req,res){
    if(req.method === 'POST'){
        console.log(req.query);
        console.log(req.body);
        console.log(req.params);
        var form = new multiparty.Form({uploadDir: config.upload.uploadDir});

         //上传完成后处理
        form.parse(req, function(err, fields, fileName) {
            console.log(fields);
            console.log(fileName);
            var filesTmp = JSON.stringify(fields, null, 2);

            if (err) {
                console.log('parse error: ' + err);
            } else {
                console.log('parse files: ' + filesTmp);
                var inputFile = fileName.inputFile[0];
                var uploadedPath = inputFile.path;
                var dstPath = config.upload.uploadDir + inputFile.originalFilename;
                //重命名为真实文件名
                fs.rename(uploadedPath, dstPath, function (err) {
                    if (err) {
                        console.log('rename error: ' + err);
                    } else {
                        console.log('rename ok');
                    }
                });
            }
        })
        /*uploader.post(req,res,function(result){
            console.log(result);
        })*/
    }
};