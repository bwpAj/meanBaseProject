/**
 * Created by beiwp on 2016/5/26.
 */
'use strict';
var crypto = require('crypto');
var _= require('underscore');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String
    },
    gender: {
      type: String,
      enum: ['男','女','保密']
    },
    birthday:{
        type: Date,
        default: Date.now
    },
    address: {
      type: String
    },
    roles: [{
        type: Schema.ObjectId,
        ref: 'Role'
    }],
    file:{
      type:Schema.ObjectId,
      ref:'File'
    },
    last_login_date: Date,
    last_login_ip: String,
    position: {
        type: Array,
        index: '2dsphere'
    },
    req_ip: String,//注册ip
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    status: {
        type: Number,
        default: 0
    },
    forget: {
        hash: String,
        till: Date
    },
    salt: String,
    hashed_password: String,
    any: Schema.Types.Mixed
});


UserSchema.virtual('password').set(function(password){
   this._password = password;
   this.salt = this.makeSalt();
   this.hashed_password = this.hashPassword(password);
}).get(function(){
    return this._password;
});


UserSchema.path('name').validate(function(name) {
    return (typeof name === 'string' && name.length >= 1 && name.length <= 50);
},'名字在1-50字之间');

UserSchema.path('email').validate(function(email) {
    return (typeof email === 'string' && email.length > 0);
}, 'Email不能为空');

UserSchema.path('username').validate(function(username) {
    return (typeof username === 'string' && username.length >= 4 && username.length <= 20);
}, '用户名为4-20个字符');
UserSchema.path('username').validate(function(username) {
    return /^\w+$/.test(username);
}, '用户名只能为a-zA-Z0-9_');


UserSchema.methods = {

    /**
     * 盐值
     * @returns {string}
     */
    makeSalt: function(){
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    authenticate: function(plainText){
        return this.hashPassword(plainText) === this.hashed_password;
    },

    /**
     * 密码hash
     * @param password
     * @returns {*}
     */
    hashPassword: function(password){
        if(!password) return '';
        var encrypred;
        try {
            encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
            return encrypred;
        } catch (err) {
            return '';
        }
    }
};

mongoose.model('User',UserSchema);
