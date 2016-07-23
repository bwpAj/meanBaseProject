/**
 * Created by beiwp on 2016/5/30.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RoleSchema = new Schema({
    name:{
        type:String,
        required: true,
        unique: true
    },
    actions:Array,
    description: String,
    created: {
        type:Date,
        default: Date.now
    },
    author:{
        type: Schema.ObjectId,
        ref: 'User'
    },
    status: {
        type: Number,
        default: 0
    }

});

RoleSchema.methods = {

};

mongoose.model('Role',RoleSchema);