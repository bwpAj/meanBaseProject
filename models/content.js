/**
 * Created by beiwp on 2016/5/31.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//内容模块
var ContentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    gallery:[{
        type: Schema.ObjectId,
        ref: 'File'
    }],
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    category: {
        type: Schema.ObjectId,
        ref: 'Tag'
    },
    created: {
        type: Date,
        default: Date.now
    },
    visits: {
        type: Number,
        default: 0
    },
    comments: [{
        type: Schema.ObjectId,
        ref: 'Comment'
    }],
    status: {
        type: Number,
        default: 0
    },
    like: {
        type: Number,
        default: 0
    },
    ding: {
        type: Number,
        default: 0
    },
    zan: {
        type: Number,
        default: 0
    },
    cai: {
        type: Number,
        default: 0
    }


});


ContentSchema.methods = {

};

mongoose.model('Content',ContentSchema);