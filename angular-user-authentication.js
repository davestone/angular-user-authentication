(function () {
  'use strict';

  angular.module('davestone.userAuthentication', [])
    .provider('UserAuthentication', function() {

      /*
       * Config
       */

      // Defaults
      this.cookieExpiry = 604800; // 1 week
      this.cookieName = '_session';
      this.cookieSecure = false;
      this.cookieDomain = '';
      this.cookiePath = '/';
      this.caseSensitiveLogin = false;
      this.identity = {};
      this.pathIdentityRequired = '/';
      this.pathNoIdentityRequired = '/';

      // Overload
      this.set = function(key, value) {
        this[key] = value;
      };

      /*
       * Service
       */

      this.$get = ['$rootScope', '$q', '$http', function($rootScope, $q, $http) {
        var service = {};
        service.config = this;
        service.identity = service.config.identity;
        service.identified = false;

        service.authenticate = function(login, password, remember) {

          if (service.identified === true) return;

          if (service.config.caseSensitiveLogin === false) { // TEST
            login = angular.lowercase(login);
          }

          if (typeof service.config.authenticate === 'function') {
            $http(service.config.authenticate(login, password)).success(function(data) {
              service.setCookie({
                domain: service.config.cookieDomain,
                expirySeconds: (remember ? service.config.cookieExpiry : 0), // TEST
                path: service.config.cookiePath,
                secure: service.config.cookieSecure,
                value: data
              });

              $rootScope.$broadcast('userAuthentication:authenticated');

              service.identify();
            }).error(function(data) {
              $rootScope.$broadcast('userAuthentication:error', { code: 'authentication-failed' });
            });
          }
        };

        service.deauthenticate = function() {
          if (service.identified === false) return;

          if (typeof service.config.deauthenticate === 'function') {
            $http(service.config.deauthenticate(service.getCookie())).success(function(data) {
              $rootScope.$broadcast('userAuthentication:deauthenticated');
            }).error(function(data) {
              $rootScope.$broadcast('userAuthentication:error', { code: 'deauthentication-failed' });
            });
          }

          service.unidentify();
        };

        service.identify = function() {
          var promise = $q.defer();

          if (service.hasCookie() === false) {
            promise.resolve();
          } else {
            $http(service.config.identify(service.getCookie())).success(function(data) {
              service.identified = true;
              service.identity = data;

              // event
              $rootScope.$broadcast('userAuthentication:identity:changed', service.identity);

              promise.resolve();
            }).error(function(data) {
              // event
              $rootScope.$broadcast('userAuthentication:error', { code: 'identification-failed' });

              promise.reject();
            });
          }

          return promise.promise;
        };

        service.unidentify = function() {
          service.identity = service.config.identity;
          service.identified = false;

          service.setCookie({
            expirySeconds: 0,
            secure: service.config.cookieSecure,
            domain: service.config.cookieDomain,
            path: service.config.cookiePath,
            value: {}
          });

          // event
          $rootScope.$broadcast('userAuthentication:identity:changed', service.identity);
        };

        service.hasCookie = function() { // TEST
          return Boolean(Object.keys(service.getCookie()).length);
        };

        service.getCookie = function() { // TEST
        	var cookies = document.cookie.split('; ');
        	for (var i=0; i<cookies.length; i++) {
        		var cookie = cookies[i].split('=');

        		if(cookie[0] === service.config.cookieName) {
        			return JSON.parse(unescape(cookie[1]));
        		}
        	}
          return {};
        };

        service.setCookie = function(options) { // TEST
          var cookie = service.config.cookieName + '=' + escape(JSON.stringify(options.value)) + '; ';

          // calculate an expiry date
          if (options.expirySeconds <= 0) {
            options.expires = false;
          } else {
            var expiryDateTime = new Date(),
                time = expiryDateTime.getTime() + (options.expirySeconds * 1000);
            expiryDateTime.setTime(time);
            options.expires = expiryDateTime.toUTCString();
          }

          angular.forEach(['domain', 'expires', 'path', 'secure'], function(name, i) {
            if (typeof options[name] === 'boolean' && options[name] === true) {
              cookie += name+'; ';
            } else if (typeof options[name] !== 'boolean') {
              cookie += name+'='+options[name]+'; ';
            }
          });

        	document.cookie = cookie;
          return cookie;
        };

        // Got Cookie? Let's try it...
        if (service.hasCookie() === true) {
          service.identify();
        }

        return service;
      }];
    })

    /*
     * Controller Helper
     */

    .controller('UserAuthenticationCtrl', ['$scope', 'UserAuthentication', function($scope, UserAuthentication) {

      $scope.identity = UserAuthentication.identity;
      $scope.identified = UserAuthentication.identified;

      $scope.$on('userAuthentication:identity:changed', function(event, identity) {
        $scope.identity = UserAuthentication.identity;
        $scope.identified = UserAuthentication.identified;
      });

      $scope.authenticate = function(session) {
        UserAuthentication.authenticate(session.login, session.password, session.remember);
      };

      $scope.deauthenticate = function() {
        UserAuthentication.deauthenticate();
      };

    }])

    /*
     * Route Resolve Helpers
     */

    .factory('IdentityRequired', ['$location', 'UserAuthentication', function($location, UserAuthentication) {
      UserAuthentication.identify().then(function() {
        if (UserAuthentication.identified === false) {
          $location.path(UserAuthentication.config.pathIdentityRequired);
        }
      });
    }])

    .factory('NoIdentityRequired', ['$location', 'UserAuthentication', function($location, UserAuthentication) {
      UserAuthentication.identify().then(function() {
        if (UserAuthentication.identified === true) {
          $location.path(UserAuthentication.config.pathNoIdentityRequired);
        }
      });
    }]);

}());
