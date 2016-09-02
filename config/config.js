/**
 * Created by beiwp on 2016/5/26.
 */

var appPath = process.cwd();

var config = {
    port: 7000,
    env: 'development',
    jwtSecret:'ReadingClubSecret',
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
    },
    upload:{
        tmpDir:  appPath + '/public/uploaded/tmp',
        uploadDir: appPath + '/public/uploaded/files',
        userImgDir: appPath + '/public/uploaded/users',
        uploadUrl:  '/uploaded/files/',
        userImgUrl:  '/uploaded/users/',
        maxPostSize: 100 * 1024 * 1024, // 100M
        minFileSize: 1,
        maxFileSize: 50 * 1024 * 1024, // 50M
        acceptFileTypes:  /.+/i,
        storage: {
            type: 'local',//保存类型，如果保存到本地可省略或local, 目前支持7牛：qiniu
            options: {
                accessKey: 'your key',
                secretKey: 'your secret',
                bucket: 'your bucket',
                domain: 'your domain',
                timeout: 3600000, // default rpc timeout: one hour, optional
            }
        }
    }

};


module.exports = config;