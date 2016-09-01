/**
 * Created by beiwp on 2016/5/26.
 */

/**
 * 配置mongoose
 * @type {exports|module.exports}
 */
var config = require('./config');
var mongoose = require('mongoose');
var core = require('./../libs/core');
var appPath = process.cwd();

module.exports = function(){
    var db = mongoose.connect(config.mongodb.uri);

    var db_connection = db.connection;
    db_connection.on('error',console.error.bind(console,'mongoose connection error'));
    db_connection.once('open', function () {
        console.log('===========mongoose connection success=======')
    });
    //appPath E:\ysc_myworkspace\interface-managerment
    core.walk(appPath + '/models',null,function(path){
        require(path);
    });


    return db;
};