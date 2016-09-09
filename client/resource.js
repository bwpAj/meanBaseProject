/**
 * Created by beiwp on 2016/9/9.
 */
'use strict';

mainApplicationModule

    .factory('userService', ['$resource',
        function ($resource) {
            return $resource('/admin/user/list/:userId', {
                userId: '@_id'
            }, {
                //扩展的update方法
                update: {
                    method: 'PUT'
                },
                query: {
                    isArray: false
                },
                viewMe: {
                    url: '/admin/user/viewMe'
                },
                editMe: {
                    url: '/admin/user/editMe',
                    method: 'PUT'
                },
                updatePassword: {
                    url: '/admin/user/updatePassword',
                    method: 'PUT'
                }
            })
        }
    ])

    .factory('fileService', ['$resource',
        function ($resource) {
            return $resource('/admin/file/list/:fileId', {
                fileId: '@_id'
            }, {
                //扩展的update方法
                update: {
                    method: 'PUT'
                },
                query: {
                    isArray: false
                }
            })
        }
    ])

    .factory('roleService', ['$resource',
        function ($resource) {
            return $resource('/admin/role/list/:roleId', {
                roleId: '@_id'
            }, {
                //扩展的update方法
                update: {
                    method: 'PUT'
                },
                query: {
                    isArray: false
                },
                getRoleActions: {
                    url: '/admin/role/getRoleActions'
                }
            })
        }
    ])

    .factory('contentService', ['$resource',
        function ($resource) {
            return $resource('/admin/content/list/:contentId', {
                contentId: '@_id'
            }, {
                //扩展的update方法
                update: {
                    method: 'PUT'
                },
                query: {
                    isArray: false
                }
            })
        }
    ])

    .factory('categoryService', ['$resource',
        function ($resource) {
            return $resource('/admin/category/list/:categoryId', {
                categoryId: '@_id'
            }, {
                //扩展的update方法
                update: {
                    method: 'PUT'
                },
                query: {
                    isArray: false
                },
                queryAll: {
                    url: '/admin/category/listAll'
                }
            })
        }
    ])

    .factory('tagService', ['$resource',
        function ($resource) {
            return $resource('/admin/tag/list/:tagId', {
                tagId: '@_id'
            }, {
                //扩展的update方法
                update: {
                    method: 'PUT'
                },
                query: {
                    isArray: false
                },
                queryAll: {
                    url: '/admin/tag/listAll'
                }
            })
        }
    ])