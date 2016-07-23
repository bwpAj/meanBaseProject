/**
 * Created by beiwp on 2016/5/31.
 */
'use strict';

var mongoose = require('mongoose');
var Schame = mongoose.Schema;

//分类模块
var CategorySchema = new Schame({
    name: {
        type: String,
        required: true
    },
    flag: {
        type: String,
        unique: true
    },
    author: {
        type: Schame.ObjectId,
        ref: 'User'
    },
    description: String,
    created: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Number,
        default: 0
    },
    parent: {
        type: Schame.ObjectId,
        ref: 'Category'
    }
});

CategorySchema.methods = {

};

mongoose.model('Category', CategorySchema);
