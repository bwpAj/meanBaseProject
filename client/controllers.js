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
                    $scope.fileSrc = '';//userMe.user.file ? userMe.user.file.url : '';
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
                baseService.uploadUsingHttp('/admin/me/updateHeadImg', file, function (response) {
                    if (response.type == 1) {
                        $timeout(function () {
                            $scope.fileSrc = response.url;
                            $scope.disbledFlag = true;
                        }, 100);
                    }
                    jsUtil.alert(response.message);
                }, function (err) {
                    jsUtil.alert('设置失败');
                })
            };

        }
    ])

    .controller('userController', ['$scope', '$routeParams', '$location', '$timeout', 'baseService', 'userService', function ($scope, $routeParams, $location, $timeout, baseService, userService) {
        //配置分页基本参数
        $scope.paginationConf = {
            currentPage: 1,
            itemsPerPage: 5
        };

        /*获取角色名字*/
        $scope.gGetArrName = function (id) {
            for (var i = 0; i < $scope.roles.length; i++) {
                if ($scope.roles[i]["_id"] == id) {
                    return $scope.roles[i]["name"]
                }
            }
        };

        //新增
        $scope.addUser = function () {
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

        //删除
        $scope.delUser = function (id) {
            userService.delete({userId: id},
                function (res) {
                    jsUtil.alert(res.message);
                    if (res.type == 1) {
                        $scope.listUser();
                    }
                }, function (err) {
                    jsUtil.alert('系统异常');
                }
            );
        };

        //修改
        $scope.updateUser = function () {
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

        //分页 列表
        $scope.listUser = function () {
            var paginationConf = {
                currentPage: $scope.paginationConf.currentPage,
                itemsPerPage: $scope.paginationConf.itemsPerPage,
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
        $scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', $scope.listUser);

        //查看
        $scope.viewUser = function () {
            userService.get({
                userId: $routeParams.userId
            }, function (res) {
                if (res.type != 1) {
                    jsUtil.alert(res.message);
                    $location.path('/user/list');
                } else {
                    $scope.user = res.data.user;
                }
            }, function (err) {
                jsUtil.alert('获取失败');
                $location.path('/user/list');
            });
        };

        $scope.viewMe = function () {
            userService.viewMe(function (res) {
                $scope.user = res.user;
                $scope.acts = res.acts;
                //$scope.fileSrc = res.user.file ? res.user.file.url : '';
            });
        };

        $scope.upBtn = true;//修改我的信息 按钮初始化不可点
        //$watch(watchExpression, listener, objectEquality); objectEquality深度监听
        $scope.$watch('user', function (newValue, oldValue, scope) {
            if (newValue && oldValue && newValue != oldValue) {
                $timeout(function () {
                    $scope.upBtn = false;
                }, 10);
            }
        }, true);

        $scope.editMe = function () {
            var user = new userService($scope.user);
            user.$editMe(function (res) {
                if (res.type == 1) {
                    $scope.user = res.user;
                }
                jsUtil.alert(res.message);
            }, function () {
                jsUtil.alert('修改失败')
            })
        };

        $scope.pwdBtn = true;//修改密码 按钮初始化不可点

        $scope.$watch('oldpassword + password + repassword', function (newValue, oldValue, scope) {
            if (scope.oldpassword && scope.password && (scope.password === scope.repassword)) {
                $timeout(function () {
                    $scope.pwdBtn = false;
                }, 10);
            } else {
                $timeout(function () {
                    $scope.pwdBtn = true;
                }, 10);
            }
        });

        $scope.updatePassword = function () {
            var user = new userService({
                oldpassword:$scope.oldpassword,
                password:$scope.password
            });
            user.$updatePassword(function (res) {
                if (res.type == 1) {
                    $scope.oldpassword = '';
                    $scope.password = '';
                    $scope.repassword = '';
                }
                jsUtil.alert(res.message);
            }, function () {
                jsUtil.alert('修改失败')
            })
        };

        $scope.imgBtn = true; //修改头像 按钮初始化不可点
        //trigger input file
        $scope.triggerImgFile = function () {
            $("#userFile").click();
        };

        //input file onchange
        $scope.getImgFileChange = function (obj) {
            //方式二
            $timeout(function () {
                $scope.user.headImg = baseService.getFilePath(obj);
                $scope.imgBtn = false;
            }, 100);
            //方式二
            /*setTimeout(function(){
             $scope.$apply(function(){
             $scope.fileSrc = $rootScope.getObjPath(obj);
             $scope.disbledFlag = false;
             })
             },100);*/
        };

        $scope.sendImg = function () {
            var file = document.querySelector('input[type=file]').files[0];
            baseService.uploadUsingHttp('/admin/user/updateHeadImg', file, function (response) {
                if (response.type == 1) {
                    $timeout(function () {
                        $scope.user = response.data.user;
                        $scope.imgBtn = true;
                    }, 10);
                }
                jsUtil.alert(response.message);
            }, function (err) {
                jsUtil.alert('设置失败');
            })
        };

    }])

    .controller('fileController', ['$scope', '$routeParams', '$location', '$timeout', 'baseService', 'fileService', function ($scope, $routeParams, $location, $timeout, baseService, fileService) {
        //配置分页基本参数
        $scope.paginationConf = {
            currentPage: 1,
            itemsPerPage: 5
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


        //新增
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

        //删除
        $scope.delFile = function (id) {
            fileService.delete({fileId: id},
                function (res) {
                    jsUtil.alert(res.message);
                    if (res.type == 1) {
                        $scope.listFile();
                    }
                }, function (err) {
                    jsUtil.alert('系统异常');
                }
            );
        };


        //分页 列表
        $scope.listFile = function () {
            var paginationConf = {
                currentPage: $scope.paginationConf.currentPage,
                itemsPerPage: $scope.paginationConf.itemsPerPage,
                name: $scope.file ? $scope.file.name : ''
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
        $scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', $scope.listFile);

    }])


    .controller('roleController', ['$scope', 'roleService', '$routeParams', '$location', function ($scope, roleService, $routeParams, $location) {

        // 过滤权限数组
        var filterActions = function (data, checkData) {
            var targetArr = [];
            angular.forEach(data, function (obj, index) {
                if (obj.actions) {
                    angular.forEach(obj.actions, function (elt, ind) {
                        //新增编辑提交时获取页面勾选值
                        if (elt.isCheck && !checkData) {
                            targetArr.push(elt.value);
                        }

                        //初始化页面时勾选对应的值
                        if (checkData && checkData.length > 0) {
                            angular.forEach(checkData, function (obx, inj) {
                                if (elt.value == obx) {
                                    elt.isCheck = true;
                                }
                            })
                        }

                    })
                }
            });
            if (checkData) {
                return data;
            } else {
                return targetArr;
            }

        };

        //获取 角色列表
        $scope.getRoleActions = function () {
            roleService.getRoleActions(function (res) {
                $scope.actions = res;
            }, function (err) {
                jsUtil.alert('请求失败')
            })
        };

        //新增
        $scope.addRole = function () {
            $scope.role.actions = filterActions($scope.actions);
            var role = new roleService($scope.role);
            role.$save(function (res) {
                jsUtil.alert(res.message);
                if (res.type == 1) {//添加成功
                    $location.path('/role/list');
                }
            }, function (err) {
                jsUtil.alert('系统异常');
            });
        };

        //删除
        $scope.delRole = function (id) {
            roleService.delete({roleId: id}, function (response) {
                if (response.type == 1) {
                    $scope.listRole();
                }
                jsUtil.alert(response.message);
            }, function (error) {
                jsUtil.alert('删除失败')
            })
        };
        //修改
        $scope.updateRole = function () {
            $scope.role.actions = filterActions($scope.actions);
            var role = new roleService($scope.role);
            role.$update(function (res) {
                jsUtil.alert(res.message);
                if (res.type == 1) {
                    $location.path('/role/list');
                }
            }, function (err) {
                jsUtil.alert('更新失败');
            });
        };

        //配置分页基本参数
        $scope.paginationConf = {
            currentPage: 1,
            itemsPerPage: 5
        };

        //分页 列表
        $scope.listRole = function () {
            var paginationConf = {
                currentPage: $scope.paginationConf.currentPage,
                itemsPerPage: $scope.paginationConf.itemsPerPage,
                name: $scope.role ? $scope.role.name : ''
            };
            roleService.query(paginationConf, function (res) {
                if (res.type == 1) {
                    $scope.roles = res.rows;
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
        $scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', $scope.listRole);

        //查看
        $scope.viewRole = function () {
            roleService.get({
                roleId: $routeParams.roleId
            }, function (res) {
                if (res.type != 1) {
                    jsUtil.alert(res.message);
                    $location.path('/role/list');
                } else {
                    $scope.role = res.data;
                    $scope.actions = filterActions($scope.actions, res.data.actions);
                }
            }, function (err) {
                jsUtil.alert('获取失败');
                $location.path('/role/list');
            });
        };
    }])
;