/**
 * Created by beiwp on 2016/6/2.
 */
'use strict';

angular.module('me').controller('MeController',['$scope','$routeParams','$location','Me','CommonUtil',
    function($scope,$routeParams,$location,Me,CommonUtil){
        //$scope.user = CommonUtil.user;
        //console.log(JSON.stringify($scope.user));
        /*$scope.localGender = [
            {name:'贝伟平'},
            {name:'女'},
            {name:'保密'}
        ];*/
        /*$scope.users = [
            {name:'a',id:'1'},
            {name:'b',id:'2'},
            {name:'c',id:'3'}
        ];
        $scope.selected='2';//id的值，区分类型*/

        $scope.find = function(){
            var userMe = Me.get(function(res){
                //console.log(res); res == userMe
                var user = userMe.user;
                $scope.userMe = userMe;
                console.log($scope.userMe);
            });

        };

        $scope.findOne = function(){
            var user = Me.findOne(function(res){
                //console.log(res); res == userMe
                $scope.user = user;
                console.log($scope.user);
            });

        };

        $scope.update = function(){
           $scope.user.$update(function(res){
                   console.log(res);
                   jsUtil.alert(res.message);
                   if(res.type == 1 ){ //修改成功 跳转上一页
                       $scope.user = res.user;
                       $location.path('me/');
                   }
               },
               function(err){
                   console.log(err);
                   jsUtil.alert('修改异常');
               });
        };

        $scope.updatePwd = function(){
            if(!this.oldpassword ){
                jsUtil.alert('请输入原始密码');
                //$('#oldpassword').focus();
                return;
            }
            if(!this.password ){
                jsUtil.alert('请输入新密码');
                return;
            }

            if( this.password !== this.repassword  ){
                jsUtil.alert('两次密码不一致');
                return;
            }

            var user = new Me({
                oldpassword: this.oldpassword,
                password: this.password,
                repassword: this.repassword
            });

            user.$update_pwd(function(res){
                $scope.oldpassword = '';
                $scope.password = '';
                $scope.repassword = '';
                jsUtil.alert(res.message);
                if(res.type == 1 ){ //修改成功 跳转上一页
                    $location.path('me/');
                }
            },function(err){
                console.log(err);
                jsUtil.alert('修改异常');
            })
        };
    }
]);

