/**
 * Created by beiwp on 2016/5/31.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    form: { //文章
        type: Schema.ObjectId,
        ref: 'Content'
    },
    reply: { //回复评论
        type: Schema.ObjectId,
        ref: 'Comment'
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    website: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    comment:[{
        type: Schema.ObjectId,
        ref: 'Comment'
    }],
    ip: {
        type: String
    },
    status: {
        type: Number,
        default: 0
    }
});

CommentSchema.methods = {

};

mongoose.model('Comment',CommentSchema);