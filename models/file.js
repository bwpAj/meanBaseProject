/**
 * Created by beiwp on 2016/5/31.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FileSchema = new Schema({
   name: {
       type: String
   },
   url: {
       type: String
   },
   md_url: {
       type: String
   },
   sm_url: {
       type: String
   },
   size: Number,
   type: String,
   description: String,
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
   }

});

FileSchema.methods = {

};

mongoose.model('File',FileSchema);