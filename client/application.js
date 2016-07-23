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
                templateUrl: '../me/me.client.view.html',
                controller: 'MeController'
            })
            .when('/me/edit',{
                templateUrl: '../me/me.client.edit.html',
                controller: 'MeController'
            })
            .when('/user/list',{
                templateUrl: '../user/user.client.list.html',
                controller: 'userController'
            })
            .when('/user/list/add',{
                templateUrl: '../user/user.client.add.html',
                controller: 'userController'
            })
            .when('/user/list/:userId/view',{
                templateUrl: '../user/user.client.view.html',
                controller: 'userController'
            })
            .when('/user/list/:userId/edit',{
                templateUrl: '../user/user.client.edit.html',
                controller: 'userController'
            })
            .when('/file/list/',{
                templateUrl: '../file/list.html'
            })
            .when('/file/list/add',{
                templateUrl: '../file/add.html'
            })
            .otherwise({
                redirectTo:'/users/views/user.client.login.html'
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