/**
 * Created by beiwp on 2016/5/30.
 */

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Role = mongoose.model('Role');
var Content = mongoose.model('Content');
var Category = mongoose.model('Category');
var Comment = mongoose.model('Comment');
var File = mongoose.model('File');
var core = require('../../libs/core');
var config = require('../../config');


exports.index = function(req, res, next){
    console.log('index controller index==='+new Date());
    if(req.session.user){
        var obj = {};
        var filter = {};
        if(req.Roles && req.Roles.indexOf('admin') < 0 ){
            filter = {author: req.session.user._id}
        }
        //result 返回的数量
        Content.find(filter).count().exec().then(function(result){
            obj.content = result;
            return Category.find(filter).count().exec()
        }).then(function(result){
            obj.category = result;
            return Comment.find(filter).count().exec();
        }).then(function(result){
            obj.comment = result;
            return User.find(filter).count().exec();
        }).then(function(result){
            obj.user = result;
            return Role.find(filter).count().exec();
        }).then(function(result){
            obj.role = result;
            return File.find(filter).count().exec();
        }).then(function(result){
            obj.file = result;
            console.log(obj);
            res.render('server/index',{title:'管理台', data: obj});
        });

    }else{
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
};

/**
 * 项目初始化校验
 * @param req
 * @param res
 * @param next
 */
exports.install = function(req, res, next){
    console.log('======index install====='+new Date());
    if(req.session.user){
        var path = core.translateAdminDir('');
        res.redirect(path);
    }


    User.find({},function(err, results){
        if(err) return;
        if(results.length < 1){
            if(req.method === 'GET'){
                res.render('server/user/install',{
                    title: '初始化'
                });
            }else if (req.method === 'POST' ){
                var createUser = function(obj) {
                    var user = new User(obj);
                    user.save(function(err,user){
                        if(err){
                            var errMsg = core.getErrorMessage(err);
                            res.render('info',{
                                message: '初始化失败 '+errMsg
                            })
                        } else if (user){
                            res.render('info',{
                                message: '初始化完成'
                            });
                        }

                    });
                };

                var obj = req.body;
                obj.status = 101;

                Role.find({status: 201},function(err, roles){
                    console.log('查找role',err, roles);
                    if(roles.length < 1){
                        console.log('没有角色' + config.admin.role.admin);
                        var role = new Role({
                            name: config.admin.role.admin,
                            actions:[],
                            status: 201 //系统默认管理员角色
                        });

                        role.save(function(err,result){
                            console.log('role result',result);
                            obj.roles = [role._id];
                            createUser(obj);
                        });

                        //管理员也是用户
                        new Role({
                            name: config.admin.role.user,
                            actions: [],
                            status: 202 //系统默认用户角色
                        }).save();
                    }else {
                        obj.roles = [roles[0]._id];
                        createUser(obj);
                    }

                })
            }
        } else {
            var path = core.translateAdminDir('');
            res.redirect(path);

        }
    });

};

