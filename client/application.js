/**
 * Created by beiwp on 2016/5/25.
 */

var mainApplicationModuleName = 'mean';

var mainApplicationModule = angular.module(mainApplicationModuleName, ['ngResource', 'ngRoute', 'ngFileUpload']);


//搜索引擎爬虫 优化
mainApplicationModule.config(['$locationProvider', '$routeProvider',
    function ($locationProvider, $routeProvider) {

        /*$locationProvider.html5Mode({
         enabled: true,
         requireBase: false
         });*/
        //$locationProvider.html5Mode(true);//去除url中总是默认带有"#"

        $locationProvider.hashPrefix('!');

        $routeProvider
            .when('/user/list', {
                templateUrl: '../client/user/list.html',
                controller: 'userController'
            })
            .when('/user/add', {
                templateUrl: '../client/user/add.html',
                controller: 'userController'
            })
            .when('/user/:userId/view', {
                templateUrl: '../client/user/view.html',
                controller: 'userController'
            })
            .when('/user/:userId/edit', {
                templateUrl: '../client/user/edit.html',
                controller: 'userController'
            })

            .when('/user/viewMe', {
                templateUrl: '../client/user/viewMe.html',
                controller: 'userController'
            })
            .when('/user/viewMe/:userId/edit', {
                templateUrl: '../client/user/editMe.html',
                controller: 'userController'
            })


            .when('/file/list', {
                templateUrl: '../client/file/list.html',
                controller: 'fileController'
            })
            .when('/file/add', {
                templateUrl: '../client/file/add.html',
                controller: 'fileController'
            })

            .when('/role/list', {
                templateUrl: '../client/role/list.html',
                controller: 'roleController'
            })
            .when('/role/add', {
                templateUrl: '../client/role/add.html',
                controller: 'roleController'
            })
            .when('/role/:roleId/view', {
                templateUrl: '../client/role/view.html',
                controller: 'roleController'
            })
            .when('/role/:roleId/edit', {
                templateUrl: '../client/role/edit.html',
                controller: 'roleController'
            })

            .when('/content/list',{
                templateUrl: '../client/content/list.html',
                controller: 'contentController'
            })
            .when('/content/add',{
                templateUrl: '../client/content/add.html',
                controller: 'contentController'
            })
            .when('/content/:contentId/view',{
                templateUrl: '../client/content/view.html',
                controller: 'contentController'
            })
            .when('/content/:contentId/edit',{
                templateUrl: '../client/content/edit.html',
                controller: 'contentController'
            })

            .when('/category/list',{
                templateUrl: '../client/category/list.html',
                controller: 'categoryController'
            })
            .when('/category/add',{
                templateUrl: '../client/category/add.html',
                controller: 'categoryController'
            })
            .when('/category/:categoryId/view',{
                templateUrl: '../client/category/view.html',
                controller: 'categoryController'
            })
            .when('/category/:categoryId/edit',{
                templateUrl: '../client/category/edit.html',
                controller: 'categoryController'
            })

            .when('/tag/list',{
                templateUrl: '../client/tag/list.html',
                controller: 'tagController'
            })
            .when('/tag/add',{
                templateUrl: '../client/tag/add.html',
                controller: 'tagController'
            })
            .when('/tag/:tagId/view',{
                templateUrl: '../client/tag/view.html',
                controller: 'tagController'
            })
            .when('/tag/:tagId/edit',{
                templateUrl: '../client/tag/edit.html',
                controller: 'tagController'
            })

            .otherwise({
                templateUrl: '../client/index.html'
            })
    }
]);

mainApplicationModule.run(['$rootScope', function ($rootScope) {
    $rootScope.countData = JSON.parse(window.data)
}]);

//facebook 身份验证后 再 OAuth回调中 会在URL的#加 修饰符
if (window.location.hash == '#_=_') window.location.hash = '#!';

angular.element(document).ready(function () {
    angular.bootstrap(document, [mainApplicationModuleName]);
});