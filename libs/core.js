/**
 * Created by beiwp on 2016/5/26.
 */

var fs = require('fs');
var path = require('path');
var config = require('../config');
var _ = require('underscore');

/**
 * 文件路径遍历
 * @param modulesPath
 * @param excludeDir
 * @param callback
 */
var walk = function (modulesPath, excludeDir, callback) {
    //返回当前路径下的所有文件和文件夹
    var dirs = fs.readdirSync(modulesPath);
    dirs.forEach(function (file) {
        //join 拼接路径
        var newPath = path.join(modulesPath, file);
        //文件对象
        var stat = fs.statSync(newPath);
        if (stat.isFile() && /(.*)\.(js|cooffee)/.test(file)) {
            callback(newPath);
        } else if (stat.isDirectory() && file !== excludeDir) {
            walk(newPath, excludeDir, callback)
        }
    });
};
exports.walk = walk;

/**
 * 包装admin路径
 * @param p
 */
exports.translateAdminDir = function (p) {
    var newPath = (config.admin.dir ? '/' + config.admin.dir : '') + (p || '');
    return newPath;
};

/**
 * 获取访问主机的ip
 * @param req
 * @returns {*}
 */
exports.getIp = function (req) {
    //console.log(req.connection.socket.remoteAddress); //会报错
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress || req.ip;
};

/**
 * 获取角色信息
 * @param user
 * @returns {Array}
 */
exports.getRoles = function (user) {
    var result = [];
    if (user && user.roles) {
        user.roles.forEach(function (role) {
            result.push(role.name);
        });
    }
    return result;
};

/**
 * 获取权限
 * @param user
 * @returns {Array}
 */
exports.getActions = function (user) {
    var result = [];
    if (user && user.roles) {
        user.roles.forEach(function (role) {
            result = result.concat(role.actions);
        });
    }

    return result;
};

/**
 * 序列化 输出对象
 * @param res
 * @param obj
 * @param type
 */
exports.resJson = function (res, obj, type) {
    var temp_obj = {
        //token:res.locals.token
    };
    temp_obj = _.extend(temp_obj, obj);
    temp_obj = type == 'list' ? obj : temp_obj; //列表集合就直接输出
    res.json(temp_obj);
};


/**
 * 错误消息
 * @param err
 * @returns {*}
 */
var getErrorMessage = function (err) {
    if (err.errors) {
        for (var errName in err.errors) {
            if (err.errors[errName].message) {
                return err.errors[errName].message;
            }
        }
    } else if (err.message) {
        return err.message;
    } else {
        return 'Unkown server error';
    }
};

exports.getErrorMessage = getErrorMessage;

exports.createPage = function (req, total, pageSize) {

    if (!req) {
        console.log('分页错误');
        return;
    }
    var query = req.query || {};                              //请求分页参数
    var pageSize = query.itemsPerPage ? query.itemsPerPage | 0 : 10; //每页多少条
    var page = query.currentPage ? query.currentPage : 0;    //当前页
    var totalPage = Math.max(Math.ceil(total / pageSize), 1); //总页数
    var currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page; //当前页数
    var start = pageSize * (currentPage - 1);                 //计算开始的位置

    return {
        start: start,
        pageSize: pageSize,
        totalPage: totalPage,
        currentPage: currentPage,
        query: query
    };
};