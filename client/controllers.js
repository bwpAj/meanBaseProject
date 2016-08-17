/**
 *
 * =================================================================================================
 *     Task ID              Date                 Author              Description
 * ----------------+----------------+-------------------+-------------------------------------------
 *     Angularjs          2016年6月22日         beiwp              新建MeController控制器
 */
'use strict';

mainApplicationModule

    .controller('MeController', ['$scope', '$routeParams', '$location', 'Me', 'baseService', '$rootScope', '$timeout', 'fileReader',
        function ($scope, $routeParams, $location, Me, baseService, $rootScope, $timeout, fileReader) {

            //input file onchange
            $scope.getImgFileChange = function (obj) {
                //方式二
                $timeout(function () {
                    $scope.fileSrc = baseService.getFilePath(obj);
                    $scope.disbledFlag = false;
                }, 100);
                //方式二
                /*setTimeout(function(){
                     $scope.$apply(function(){
                     $scope.fileSrc = $rootScope.getObjPath(obj);
                     $scope.disbledFlag = false;
                     })
                 },100);*/
            };

            $scope.find = function () {
                var userMe = Me.get(function (res) {
                    $scope.userMe = userMe;
                    $scope.fileSrc = userMe.user.file ? userMe.user.file.url :'';
                });
            };

            $scope.findOne = function () {
                var user = Me.findOne(function (res) {
                    $scope.user = user;
                });
            };

            $scope.update = function () {
                $scope.user.$update(function (res) {
                        jsUtil.alert(res.message);
                        if (res.type == 1) { //修改成功 跳转上一页
                            $scope.user = res.user;
                            $location.path('me/');
                        }
                    },
                    function (err) {
                        jsUtil.alert('修改异常');
                    });
            };

            $scope.updatePwd = function () {
                if (!this.oldpassword) {
                    jsUtil.alert('请输入原始密码');
                    return;
                }
                if (!this.password) {
                    jsUtil.alert('请输入新密码');
                    return;
                }

                if (this.password !== this.repassword) {
                    jsUtil.alert('两次密码不一致');
                    return;
                }
                var user = new Me({
                    oldpassword: this.oldpassword,
                    password: this.password,
                    repassword: this.repassword
                });

                user.$update_pwd(function (res) {
                    $scope.oldpassword = '';
                    $scope.password = '';
                    $scope.repassword = '';
                    jsUtil.alert(res.message);
                    if (res.type == 1) { //修改成功 跳转上一页
                        $location.path('me/');
                    }
                }, function (err) {
                    console.log(err);
                    jsUtil.alert('修改异常');
                })
            };

            $scope.disbledFlag = true; //按钮disabled
            //trigger input file
            $scope.triggerImgFile = function () {
                $("#userFile").click();
                $scope.disbledFlag = true;
            };

            $scope.sendImg = function () {
                var file = document.querySelector('input[type=file]').files[0];
                baseService.uploadUsingHttp('/admin/me/updateHeadImg',file,function(response){
                    if(response.type == 1){
                        $timeout(function(){
                            $scope.fileSrc = response.url;
                            $scope.disbledFlag = true;
                        },100);
                    }
                    jsUtil.alert(response.message);
                },function(err){
                    jsUtil.alert('设置失败');
                })
            };

        }
    ])

    .controller('userController', ['$scope', 'userService', '$routeParams', '$location', function ($scope, userService, $routeParams, $location) {

        /*获取角色名字*/
        $scope.gGetArrName = function (id) {
            for (var i = 0; i < $scope.roles.length; i++) {
                if ($scope.roles[i]["_id"] == id) {
                    return $scope.roles[i]["name"]
                }
            }
        };

        //配置分页基本参数
        $scope.paginationConf = {
            currentPage: 1,
            itemsPerPage: 5
        };

        //分页 列表
        $scope.list = function () {
            var paginationConf = {
                currentPage: $scope.paginationConf.currentPage,
                itemsPerPage: $scope.paginationConf.itemsPerPage,
                username: $scope.user ? $scope.user.username : '',
                name: $scope.user ? $scope.user.name : ''
            };
            userService.query(paginationConf, function (res) {
                if (res.type == 1) {
                    $scope.users = res.rows;
                    $scope.paginationConf.totalItems = res.pages.countItems;
                } else {
                    jsUtil.alert(res.message);
                }
            }, function (err) {
                jsUtil.alert('查询失败');
            });
        };

        /***************************************************************
         当页码和页面记录数发生变化时监控后台查询   页面ng-init 就不需要 注册 list() 方法  否则会调两次后台
         如果把currentPage和itemsPerPage分开监控的话则会触发两次后台事件。
         ***************************************************************/
        $scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', $scope.list);

        //查看
        $scope.findOne = function () {
            userService.get({
                userId: $routeParams.userId
            }, function (res) {
                if (res.type != 1) {
                    jsUtil.alert(res.message);
                    $location.path('/user/list');
                } else {
                    $scope.user = res.data.user;
                    $scope.roles = res.data.roles;
                }
            }, function (err) {
                jsUtil.alert('获取失败');
                $location.path('/user/list');
            });

        };

        //新增
        $scope.add = function () {
            var user = new userService($scope.user);
            user.$save(function (res) {
                jsUtil.alert(res.message);
                if (res.type == 1) {//添加成功
                    $location.path('/user/list');
                }
            }, function (err) {
                jsUtil.alert('系统异常');
            });
        };

        //修改
        $scope.update = function () {
            var user = new userService($scope.user);
            user.$update(function (res) {
                jsUtil.alert(res.message);
                if (res.type == 1) {
                    $location.path('/user/list');
                }
            }, function (err) {
                jsUtil.alert('更新失败');
            });
        };

        //删除
        $scope.del = function (id) {
            var del = userService.delete({userId: id},
                function (res) {
                    jsUtil.alert(res.message);
                    if (res.type == 1) {
                        $location.path('/user/list');
                    }
                }, function (err) {
                    jsUtil.alert('系统异常');
                });
        }

    }])

    .controller('fileController', ['$scope', '$timeout', 'baseService', 'fileService', 'fileReader', 'Upload', '$location', function ($scope, $timeout, baseService, fileService, fileReader, Upload, $location) {

        $scope.submit = function () {
            $scope.upload($scope.file);
        };

        //文件类型判断
        $scope.ifImg = function (typeImg) {
            return typeImg && /\.(jpg|gif|png|bmp|jpeg|gif)/i.test(typeImg) ? true : false;
        };

        /*通过指令 fileModel 获取base64 地址====================== */
        $scope.getFile = function () {
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function (result) {
                    $scope.imgPath = result;
                    $scope.hasFile = true;
                });
        };
        /*通过指令 fileModel 获取base64 地址====================== */


        /*通过按钮触发file表单的change事件 获取file的地址======================*/
        $scope.hasFile = false;
        $scope.getFileSource = function () {
            $("#fileupload").click();
        };
        $scope.getFileChange = function (obj) {
            ///.+(jpg|jpeg|png)+$/.test(obj.value)
            $timeout(function () {
                if (obj.value && /^(\s|\S)+(jpg|jpeg|png)+$/.test(obj.value)) {
                    //图片
                    $scope.imgPath = baseService.getFilePath(obj);
                }
                $scope.hasFile = true;
                $scope.fileName = obj.value;
                $scope.file = obj.value;
            }, 100);
        };
        /*通过按钮触发file表单的change事件 获取file的地址======================*/


        //新增文件
        $scope.addFile = function () {
            var file = document.querySelector('input[type=file]').files[0];
            // 方式一
            /*baseService.uploadUsingHttp('/admin/file/list',file,function(response){
             //上传成功的操作
             if(response.type == 1){
             $location.path('/file/list');
             }
             jsUtil.alert(response.message);
             },function(err){
             jsUtil.alert('上传时系统出错');
             });*/
            // 方式二
            baseService.uploadUsingUpload('/admin/file/list', file, '', function (response) {
                //上传成功的操作
                if (response.data.type == 1) {
                    $location.path('/file/list');
                }
                jsUtil.alert(response.data.message);
            }, function (err) {
                jsUtil.alert('上传时系统出错');
            });
        };

        //配置分页基本参数
        $scope.paginationConf = {
            currentPage: 1,
            itemsPerPage: 3
        };

        //分页 列表
        $scope.list = function () {
            var paginationConf = {
                currentPage: $scope.paginationConf.currentPage,
                itemsPerPage: $scope.paginationConf.itemsPerPage,
                name: $scope.fileSearchName ? $scope.fileSearchName : ''
            };
            fileService.query(paginationConf, function (res) {
                if (res.type == 1) {
                    $scope.files = res.rows;
                    $scope.paginationConf.totalItems = res.pages.countItems;
                } else {
                    jsUtil.alert(res.message);
                }
            }, function (err) {
                jsUtil.alert('查询失败');
            });
        };

        /***************************************************************
         当页码和页面记录数发生变化时监控后台查询   页面ng-init 就不需要 注册 list() 方法  否则会调两次后台
         如果把currentPage和itemsPerPage分开监控的话则会触发两次后台事件。
         ***************************************************************/
        $scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', $scope.list);

        $scope.del = function (id) {
            fileService.delete({fileId: id}, function (response) {
                if (response.type == 1) {
                    $location.path('/file/list');
                }
                jsUtil.alert(response.message);
            }, function (error) {
                jsUtil.alert('删除失败')
            })
        }

    }]);