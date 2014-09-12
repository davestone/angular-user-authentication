# Angular.js User Authentication

Authenticate users via your API for Angular.js applications.

[![Build Status](https://travis-ci.org/davestone/angular-user-authentication.png?branch=master)](https://travis-ci.org/davestone/angular-user-authentication)
[![Coverage Status](https://coveralls.io/repos/davestone/angular-user-authentication/badge.png)](https://coveralls.io/r/davestone/angular-user-authentication)

### How to use it

#### Installation

```
bower install angular-user-authentication --save
```

#### Usage

Include the .js (or .min.js) in your application.

```html
<script src="components/angular-user-authentication/angular-user-authentication.js"></script>
```

Add the module ```davestone.userAuthentication``` as a dependency to your app module:

```javascript
angular.module('myApp', ['davestone.userAuthentication']);
```

And config the provider. Here's an example, with comments explaining:

```javascript
.config(['UserAuthenticationProvider', function(UserAuthenticationProvider) {
  UserAuthenticationProvider.set('cookieName', '_session');       // default
  UserAuthenticationProvider.set('cookieDomain', '');             // default
  UserAuthenticationProvider.set('cookiePath', '/');              // default
  UserAuthenticationProvider.set('cookieExpiry', 604800);         // default (1 week)
  UserAuthenticationProvider.set('cookieSecure', false);          // default
  UserAuthenticationProvider.set('identity', {});                 // default (guest model)
  UserAuthenticationProvider.set('caseSensitiveLogin', false);    // default
  UserAuthenticationProvider.set('pathIdentityRequired', '/');    // default
  UserAuthenticationProvider.set('pathNoIdentityRequired', '/');  // default

  UserAuthenticationProvider.set('authenticate', function(login, password) {
    return {
      method: 'POST',
      url: 'https://api.domain.com/session',
      withCredentials: true,
      data: { "login" : login, "password" : password }
    }
  });

  UserAuthenticationProvider.set('deauthenticate', function(persist) { // optional
    return {
      method: 'DELETE',
      url: window.__env.API_URL+'/users/sessions',
      withCredentials: true
    }
  });

  UserAuthenticationProvider.set('identify', function(persist) {
    return {
      method: 'GET',
      url: 'https://api.domain.com/users/'+persist.id,
      headers: {
        Authorization: "Bearer "+persist.access_token
      }
    };
  });
}])
```

##### Controller Helper

The ```UserAuthenticationCtrl``` controller allows you to quickly integrate throughout your application.

###### Authenticate

```html
<form ng-controller="UserAuthenticationCtrl" ng-submit="authenticate(session)">
  <div>
    <label for="session.login">Personal e-mail address:</label>
    <input type="email" id="session.login" ng-model="session.login" required />
  </div>

  <div>
    <label for="session.password">Password:</label>
    <input type="password" id="session.password" ng-model="session.password" required />
  </div>

  <div>
    <button type="submit">Sign in</button>
    <label for="session.remember">
      <input type="checkbox" id="session.remember" ng-model="session.remember" /> Remember me
    </label>
  </div>
</form>
```

###### De-authenticate

```html
<a ng-controller="UserAuthenticationCtrl" ng-show="identified" ng-click="deauthenticate()">Sign Out of {{identity.email}}</a>
```

##### Resolve Helper

The ```IdentityRequired``` and ```NoIdentityRequired``` factories used in a $route's resolve allows you to quickly require that said $route has an identify, or not as the case might be. If a resolve isn't met, the user is redirected to the apt config path, i.e. ```pathIdentityRequired```.

```javascript
$routeProvider.when('/path', {
  templateUrl: '/path.html',
  resolve: {
    acl: ['IdentifyRequired', function(IdentityRequired) { return IdentifyRequired; }]
  }
});
```

##### Events

This events are broadcast's at apt points in time:

```javascript
userAuthentication:authenticated
userAuthentication:deauthenticated
userAuthentication:identity:changed
userAuthentication:error
```

### Contribute

Getting started...

```javascript
$ npm install
$ bower install
$ npm test
```

## Issues, Feature Request

Github Issues are used for managing bug reports and feature requests. If you run into issues, please search the issues and submit new problems. The best way to get quick responses to your issues and swift fixes to your bugs is to submit detailed bug reports, include test cases.

## License

Copyright (c) 2014 Dave Stone. MIT Licensed, see [LICENSE](LICENSE.md) for details.
