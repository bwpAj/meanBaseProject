/**
 * Created by beiwp on 2016/5/26.
 */

var appPath = process.cwd();

var config = {
    port: 7000,
    env: 'development',
    mongodb: {
        uri: 'mongodb://localhost:/interface',
        options:{}
    },

    admin: {
        dir: 'admin',
        role: { //默认角色
            admin: 'admin',
            user: 'user'
        }
    }

};


module.exports = config;