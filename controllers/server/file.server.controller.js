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
    config = require('../../config'),
    core = require('../../libs/core');

var uploader = require('../../libs/uploader')(config.upload);


