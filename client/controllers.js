/**
 *
 * =================================================================================================
 *     Task ID			  Date			     Author		      Description
 * ----------------+----------------+-------------------+-------------------------------------------
 *     Angularjs          2016年6月22日         beiwp			  新建MeController控制器
 */
'use strict';

mainApplicationModule

    .controller('MeController', ['$scope', '$routeParams', '$location', 'Me','baseService','$rootScope','$timeout','fileReader',
        function ($scope, $routeParams, $location, Me,baseService,$rootScope,$timeout,fileReader) {

            // 公用方法可以通过服务来处理  baseService
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
                    $scope.fileSrc = baseService.getFilePath(obj);
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

    }])

    .controller('fileController',['$scope','$timeout','baseService','fileService','$http','fileReader','Upload',function($scope,$timeout,baseService,fileService,$http,fileReader,Upload){

        $scope.submit = function () {
            $scope.upload($scope.file);
        };

        /*通过指令 fileModel 获取base64 地址====================== */
        $scope.getFile = function () {
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function(result) {
                    $scope.imgPath = result;
                    $scope.hasFile = true;
                });
        };
        /*通过指令 fileModel 获取base64 地址====================== */


        /*通过按钮触发file表单的change事件 获取file的地址======================*/
        $scope.hasFile = false;
        $scope.getFileSource = function(){
            $("#fileupload").click();
        };
        $scope.getFileChange = function(obj){
            ///.+(jpg|jpeg|png)+$/.test(obj.value)
            $timeout(function(){
                if(obj.value && /^(\s|\S)+(jpg|jpeg|png)+$/.test(obj.value)){
                    //图片
                   $scope.imgPath = baseService.getFilePath(obj);
                }
                $scope.hasFile = true;
                $scope.fileName = obj.value;
                $scope.file = obj.value;
            },100);
        };
        /*通过按钮触发file表单的change事件 获取file的地址======================*/


        //新增文件
        $scope.addFile = function(file,resumable){

            file = document.querySelector('input[type=file]').files[0];
            console.log($scope.file);
            uploadUsingUpload(file, resumable);

        };

        $scope.save = function() {
            var fd = new FormData();
            var file = document.querySelector('input[type=file]').files[0];
            fd.append('files', file);
            $http({
                method:'POST',
                url:"/admin/file/list",
                data: fd,
                headers: {'Content-Type':undefined},
                transformRequest: angular.identity
            })
                .success( function ( response )
                {
                    //上传成功的操作
                    alert("uplaod success");
                });

        }


        function uploadUsingUpload(file, resumable) {
            file.upload = Upload.upload({
                url: '/admin/file/list' + $scope.getReqParams(),
                resumeSizeUrl: resumable ? '/admin/file/list?name=' + encodeURIComponent(file.name) : null,
                resumeChunkSize: resumable ? $scope.chunkSize : null,
                headers: {'Content-Type': 'multipart/form-data'},
                data: {file: file}
            });
            file.upload.then(function (response) {
                if(response.data.type == 1){

                }
                jsUtil.alert(response.data.message);

            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                //file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });

            file.upload.xhr(function (xhr) {
                // xhr.upload.addEventListener('abort', function(){console.log('abort complete')}, false);
            });
        }

        $scope.getReqParams = function () {
            return $scope.generateErrorOnServer ? '?errorCode=' + $scope.serverErrorCode +
            '&errorMessage=' + $scope.serverErrorMsg : '';
        };




    }]);