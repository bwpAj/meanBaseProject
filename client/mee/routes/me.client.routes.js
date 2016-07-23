/**
 * Created by beiwp on 2016/6/2.
 */
'use strict';


angular.module('me').config(['$routeProvider',function($routeProvider){
    $routeProvider
        .when('/me',{
            templateUrl: '../me/views/me.client.view.html',
        }).
        when('/me/edit',{
            templateUrl: '../me/views/me.client.edit.html'
        })
}]);

