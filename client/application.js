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
                templateUrl: '../client/me/view.html',
                controller: 'MeController'
            })
            .when('/me/edit',{
                templateUrl: '../client/me/edit.html',
                controller: 'MeController'
            })
            .when('/user/list',{
                templateUrl: '../client/user/list.html',
                controller: 'userController'
            })
            .when('/user/add',{
                templateUrl: '../client/user/add.html',
                controller: 'userController'
            })
            .when('/user/:userId/view',{
                templateUrl: '../client/user/view.html',
                controller: 'userController'
            })
            .when('/user/:userId/edit',{
                templateUrl: '../client/user/edit.html',
                controller: 'userController'
            })
            .when('/file/list/',{
                templateUrl: '../client/file/list.html',
                controller:'fileController'
            })
            .when('/file/add',{
                templateUrl: '../client/file/add.html',
                controller:'fileController'
            })
            .otherwise({
                redirectTo:'client/index.html'
            })
    }
]);


//facebook 身份验证后 再 OAuth回调中 会在URL的#加 修饰符
if(window.location.hash == '#_=_') window.location.hash = '#!';

angular.element(document).ready(function(){
    angular.bootstrap(document,[mainApplicationModuleName]);
});