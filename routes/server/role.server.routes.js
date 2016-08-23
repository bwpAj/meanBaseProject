var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var role = require('../../controllers/server/role.server.controller');

router.use(function (req, res, next) {
    console.log('role routes====' + new Date());
    res.locals.Path = 'role';
    next();
});

//权限判断
router.use(function (req, res, next) {
    if (!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});

router.route('/list').get(role.listRole).post(role.addRole);
router.route('/list/:id').get(role.viewRole).put(role.editRole).delete(role.delRole);
router.route('/getRoleActions').all(role.getRoleActions);


module.exports = function (app) {
    var path = core.translateAdminDir('/role');
    app.use(path, router);
};
