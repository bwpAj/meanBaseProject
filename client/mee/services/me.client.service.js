/**
 * Created by beiwp on 2016/6/2.
 */
'use strict';

angular.module('me').factory('Me',['$resource',
    function($resource){
        return $resource('/admin/me/:userId',{
            userId: '@_id'
        },{
           findOne:{
              method:'GET',
              url:'/admin/me/edit'
           },
           update:{
              method:'PUT',
              url:'/admin/me/edit'
           },
           update_pwd:{
              method:'PUT',
              url:'/admin/me/updatepwd'
           }
            /*query:{
              method: 'GET',
              isArray: false
           }*/
        });
    }
]);