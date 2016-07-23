/**
 * Created by beiwp on 2016/5/25.
 */

var mainApplicationModuleName = 'mean';

var mainApplicationModule = angular.module(mainApplicationModuleName,['ngResource','ngRoute']);


//搜索引擎爬虫 优化
mainApplicationModule.config(['$locationProvider','$routeProvider',
    function($locationProvider,$routeProvider){

        /*$locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });*/
        //$locationProvider.html5Mode(true);//去除url中总是默认带有"#"

        $locationProvider.hashPrefix('!');

        $routeProvider
            .when('/me',{
                templateUrl: '../client/me/me.client.view.html',
                controller: 'MeController'
            })
            .when('/me/edit',{
                templateUrl: '../client/me/me.client.edit.html',
                controller: 'MeController'
            })
            .when('/user/list',{
                templateUrl: '../client/user/user.client.list.html',
                controller: 'userController'
            })
            .when('/user/add',{
                templateUrl: '../client/user/user.client.add.html',
                controller: 'userController'
            })
            .when('/user/:userId/view',{
                templateUrl: '../client/user/user.client.view.html',
                controller: 'userController'
            })
            .when('/user/:userId/edit',{
                templateUrl: '../client/user/user.client.edit.html',
                controller: 'userController'
            })
            .when('/file/list/',{
                templateUrl: '../client/file/list.html',
                controller:'fileContrller'
            })
            .when('/file/add',{
                templateUrl: '../client/file/add.html',
                controller:'fileContrller'
            })
            .otherwise({
                redirectTo:'client/index.html'
            })
    }
]);

mainApplicationModule.factory('CommonUtil',[
   function(){
       this.token = window.token;
       this.user = window.user;
       return {
           token: this.token,
           user: this.user
       }
   }
]);

//facebook 身份验证后 再 OAuth回调中 会在URL的#加 修饰符
if(window.location.hash == '#_=_') window.location.hash = '#!';

angular.element(document).ready(function(){
    angular.bootstrap(document,[mainApplicationModuleName]);
});