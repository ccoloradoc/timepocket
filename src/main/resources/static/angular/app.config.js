/**
 * Created by colorado on 29/03/17.
 */
angular.module('app')
    .config(['$httpProvider', function($httpProvider) {
        // $httpProvider.interceptors.push(function($q, $location,$rootScope) {
        // 	return {
        // 		response: function(response) {
        // 			return response;
        // 		},
        // 		responseError: function(response) {
        // 			console.log('Response: ' );
        // 			console.log(response);
        // 			if (response.status === 401)  {
        // 				$rootScope.message = 'You need to log in.';
        //                 $scope.error = {
        //                     message: 'Invalid username and password.',
        //                     type: 'deep-orange darken-1'
        //                 }
        // 				$location.url('/');
        // 			}
        //
        // 			return $q.reject(response);
        // 		}
        // 	};
        //});
    }])
    .run(['$rootScope', '$location', function ($rootScope, $location) {
        $rootScope.$on('$routeChangeError', function(event, next, current) {
            //console.log(current);
            if(current !== undefined)
                $location.url(current.$$route.originalPath);
            else
                $location.path('/login');
        });
    }])
    .constant('policies',{
        '/login': {
            templateUrl: 'angular/templates/login.html',
            controller: 'LoginController'
        },
        '/signup': {
            templateUrl: 'angular/templates/signup.html',
            controller: 'SignupController'
        },
        '/admin': {
            templateUrl: 'angular/templates/admin.html',
            controller: 'AdminController',
            permissions: ['ADMIN', 'MANAGER']
        },
        '/:id?': {
            templateUrl: 'angular/templates/user.html',
            controller: 'UserController',
            permissions: ['ADMIN', 'MANAGER', 'USER']
        },
        '/:id/timezone/:timezoneId/edit': {
            templateUrl: 'angular/templates/timezone/edit.html',
            controller: 'EditTimeZoneController',
            permissions: ['ADMIN', 'MANAGER', 'USER']
        },
        '/:id/new': {
            templateUrl: 'angular/templates/timezone/new.html',
            controller: 'NewTimeZoneController',
            permissions: ['ADMIN', 'MANAGER', 'USER']
        }
    })
    .config(['$routeProvider', 'policies', function($routeProvider, policies) {
        //Our NOT THAT complex logic for authentification and authorization validation
        var authResolver = function(path) {
            return {
                routingMessage : function(Auth, $q) {
                    var deferred = $q.defer();

                    Auth.hasUserPermissionForView(path)
                        .then(function(msg) {
                            deferred.resolve();
                        }, function() {
                            deferred.reject();
                        });

                    return deferred.promise;
                },
                validatingRoute: function($route) {
                    console.log(path + ' - ' + $route.current.params.id);
                }
            }
        };

        //Configuring Routes and Auth
        for(var path in policies) {
            //Build Route
            var route = {
                templateUrl: policies[path].templateUrl,
                controller: policies[path].controller
            };

            //Sync with server about user status
            route.resolve =  authResolver(path);

            //Register route
            $routeProvider.when(path, route);
        }

        $routeProvider.otherwise({redirectTo: '/'});
    }]);

