/**
 * Created by beiwp on 2016/5/26.
 */

angular.module('user').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/',{
        templateUrl: '../users/views/user.client.login.html'
    })

}]);