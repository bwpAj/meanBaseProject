/**
 * Created by beiwp on 2016/8/31.
 */

'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    core = require('./core');

module.exports = function (req, res, next) {
    console.log('=============================================555555555555555555555555555555555==============================');
    if (req.payload && req.payload.username) {
        User.findOne({username: req.payload.username})
            .exec(function (err, user) {
                if (!user) {
                    return core.resJson(res, {type: 0, message: '用户认证失败'});
                }
                else if (err) {
                    return core.resJson(res, {type: 0, message: '用户认证失败'});
                }
                next();
            });
    } else {
        return core.resJson(res, {type: 0, message: '用户认证失败'});
    }
};