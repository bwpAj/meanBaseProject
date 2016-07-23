/**
 * Created by beiwp on 2016/5/30.
 */
'use strict';
var mongoose = require('mongoose');
var config = require('../config');
var core = require('../libs/core');
var User = mongoose.model('User');
var RoleServie = require('./role');

/**
 * 注册
 * @param obj
 * @returns {Promise}
 */
exports.register = function(obj){
    return new Promise(function(resolve,reject) {
        if(!obj){
            return reject(null)
        }
        RoleServie.read({
            status:202
        },function(err,role){
            console.log('======= user service =======');
            console.log(role);
        })
    });
};


exports.findById = function(id,populates) {
    console.log('=========== user service findById ==============');
    return new Promise(function(resolve,reject){
        var query = User.findById(id);
        if(populates && populates.length > 0 ){
            populates.forEach(function(item) {
                query = query.populate(item);
            });
        }

        query.exec(function(err,result) {
            if(err){
                reject(err);
            } else {
                resolve(result);
            }
        })


    })
};