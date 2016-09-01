/**
 * Created by beiwp on 2016/5/16.
 */

/**
 * ���ؼ������
 * @type {Passport|exports|module.exports}
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('mongoose').model('User');

module.exports = function () {
    console.log('=======passport local======');
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function (username, password, done) {
        console.log('=======' + username + '======' + password);
        User.findOne({
            username: username
        }).populate('roles').populate('file').exec(function (err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, {message: '�û�������'});
            }
            if (!user.authenticate(password)) {
                return done(null, false, {message: '�������!'});
            }
            return done(null, user);
        });
    }))
};

