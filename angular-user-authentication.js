(function () {
  'use strict';

  angular.module('davestone.userAuthentication', [])
    .provider('UserAuthentication', function() {
      // Config
      this.cookieExpiration = 0;
      this.cookieName = '_session';
      this.cookieSecure = false;
      this.cookieDomain = '';
      this.cookiePath = '/';
      this.user = { user: 'guest' };
      this.path = '/';
      this.remember = false;
      this.sessionRequiredPath = '/sign_in';
      this.noSessionRequiredPath = '/';

      this.set = function(key, value) {
        this[key] = value;
      };

      // Service
      this.$get = ['$rootScope', '$cookieStore', '$http', '$q', function($rootScope, $cookieStore, $http, $q) {
        var service = {};
        service.config = this;
        service.user = service.config.user;
        service.store = $cookieStore;
        service.isSignedIn = false;

        service.deauthenticate = function() {
          this.forget();

          if (this.config.deauthenticate !== undefined) {
            $http(this.config.deauthenticate).
              success(function(data, status, headers, config) {
                $rootScope.$broadcast('session:destroyed', {
                  status: status,
                  data: data,
                  headers: headers,
                  config: config
                });
              }).
              error(function(data, status, headers, config) {
                $rootScope.$broadcast('session:error:deauthenticate', {
                  status: status,
                  data: data,
                  headers: headers,
                  config: config
                });
              });
          } else {
            $rootScope.$broadcast('session:destroyed', {});
          }
        };

        service.authenticate = function(login, password) {
          $http(this.config.authenticate(angular.lowercase(login), password)).
            success(function(data, status, headers, config) {
              var options = {
                expires: service.config.cookieExpiration,
                secure: service.config.cookieSecure,
                domain: service.config.cookieDomain,
                path: service.config.cookiePath
              };

              if (service.config.remember === false) {
                delete options.expires;
              }

              service.store.put( service.config.cookieName, data, options);

              service.identify();
            }).
            error(function(data, status, headers, config) {
              $rootScope.$broadcast('session:error:authenticate', {
                status: status,
                data: data,
                headers: headers,
                config: config
              });
            });
        };

        service.identify = function() {
          var promise = $q.defer();

          if (this.isSoftSignedIn() === false) {
            promise.reject();
            return promise.promise;
          }

          $http(this.config.identify(this.getCookie())).
            success(function(data, status, headers, config) {
              service.isSignedIn = true;
              service.user = data;
              // resolve
              promise.resolve();
              // events
              $rootScope.$broadcast('session:created', {
                status: status,
                data: data,
                headers: headers,
                config: config
              });
            }).
            error(function(data, status, headers, config) {
              service.forget();
              // resolve
              promise.reject();
              // events
              $rootScope.$broadcast('session:error:identify', {
                status: status,
                data: data,
                headers: headers,
                config: config
              });
            });
          return promise.promise;
        };

        service.forget = function() {
          this.user = service.config.user;
          this.isSignedIn = false;
          this.store.put( this.config.cookieName, {}, {
            expires: 0,
            secure: service.config.cookieSecure,
            domain: service.config.cookieDomain,
            path: service.config.cookiePath
          });
        };

        service.recall = function() {
          if (Object.keys(this.getCookie()).length > 0) {
            this.config.remember = true; // this user obviously wants to be remembered
            this.identify();
          }
        };

        service.getCookie = function() {
          return this.store.get( this.config.cookieName ) || {};
        };

        service.isSoftSignedIn = function() {
          var cookie = this.getCookie();
          if (Object.keys(cookie).length > 0) return true;
          return false;
        };

        return service;
      }];
    })

    // Controller Helper
    .controller('SessionHelper', ['$scope', 'Session', function($scope, Session) {

      $scope.Session = Session;
      $scope.remember = Session.config.remember;

      $scope.signIn = function() {
        Session.authenticate($scope.login, $scope.password);
        Session.config.remember = !!$scope.remember;
      };

      $scope.signOut = function() {
        Session.deauthenticate();
      };

    }])

    // Route resolve Helpers
    .factory('SessionRequired', ['$location', 'Session',
      function($location, Session) {
        return function() {
          return Session.identify().then(function() {
            // pass
          }, function() {
            Session.config.path = $location.path();
            $location.path(Session.config.sessionRequiredPath);
          });
        };
      }
    ])

    .factory('NoSessionRequired', ['$location', 'Session',
      function($location, Session) {
        return function(path) {
          return Session.identify().then(function() {
            $location.path(path || Session.config.noSessionRequiredPath);
          }, function() {
            // pass
          });
        };
      }
    ]);
}());
