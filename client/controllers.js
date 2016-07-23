/**
 *  *
 * =================================================================================================
 *     Task ID			  Date			     Author		      Description
 * ----------------+----------------+-------------------+-------------------------------------------
 *     重构4.1          2016年6月22日         beiwp			  新建MeController控制器
 */
'use strict';

mainApplicationModule

    .controller('MeController', ['$scope', '$routeParams', '$location', 'Me', 'CommonUtil','$rootScope','$timeout','fileReader',
        function ($scope, $routeParams, $location, Me, CommonUtil,$rootScope,$timeout,fileReader) {
            //$scope.user = CommonUtil.user;
            //console.log(JSON.stringify($scope.user));
            /*$scope.localGender = [
             {name:'贝伟平'},
             {name:'男'},
             {name:'保密'}
             ];*/
            /*$scope.users = [
             {name:'a',id:'1'},
             {name:'b',id:'2'},
             {name:'c',id:'3'}
             ];
             $scope.selected='2';//id的值，区分类型*/

            $rootScope.getObjPath = function(obj){
                if (obj) {
                    //IE
                    if(window.navigator.userAgent.indexOf("MSIE 6.0")>=1){
                        return obj.value;
                    } else if (window.navigator.userAgent.indexOf("MSIE") >= 1) {
                        obj.select();
                        obj.blur();
                        // IE下取得图片的本地路径
                        return document.selection.createRange().text;
                    }
                    //firefox
                    else if (window.navigator.userAgent.indexOf("Firefox") >= 1) {
                        if (obj.files) {
                            // Firefox下取得的是图片的数据
                            var value = "";
                            try{
                                value = window.URL.createObjectURL(obj.files[0]);
                            }catch(e){
                                value = obj.files[0].getAsDataURL();
                            }
                            return value;
                        }
                    } else if (window.navigator.userAgent.indexOf("Chrome") >= 1) {
                        return window.URL.createObjectURL(obj.files[0]);

                    }
                    return obj.value;
                }
            };
            $scope.getFile = function () {
                fileReader.readAsDataUrl($scope.file, $scope)
                    .then(function(result) {
                            $scope.imageSrc = result;
                    });
            };

            $scope.disbledFlag = true; //按钮disabled
            //trigger input file
            $scope.triggerImgFile = function(){
                $("#userFile").click();
                $scope.disbledFlag = true;
            };
            //input file onchange
            $scope.getImgFileChange = function(obj){
                //方式二
                $timeout(function(){
                    $scope.fileSrc = $rootScope.getObjPath(obj);
                    $scope.disbledFlag = false;
                },100);
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
                    //console.log(res); res == userMe
                    $scope.userMe = userMe;
                });
            };

            $scope.findOne = function () {
                var user = Me.findOne(function (res) {
                    //console.log(res); res == userMe
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

            $scope.upImage = function(){

            }
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

    }]);