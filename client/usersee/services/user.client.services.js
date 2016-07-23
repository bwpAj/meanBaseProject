/**
 * Created by beiwp on 2016/5/26.
 */

angular.module('user').factory('userService',['$resource', function ($resource) {
    return $resource('user/login')
}]);