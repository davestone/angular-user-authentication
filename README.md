# angular-user-authentication

Authenticate users via your API for Angular.js applications.

NOTE: I've used this on Angular app in production, however consider it a work in progress.

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

Configure, for example:

```javascript
.config(['UserAuthenticationProvider', function(UserAuthenticationProvider) {
  UserAuthenticationProvider.set('remember', true);
  UserAuthenticationProvider.set('path', '/');
  UserAuthenticationProvider.set('cookieName', '_session');
  UserAuthenticationProvider.set('cookieDomain', 'domain.com');
  UserAuthenticationProvider.set('cookieExpiration', 1209600000);
  UserAuthenticationProvider.set('sessionRequiredPath', '/');
  UserAuthenticationProvider.set('noSessionRequiredPath', '/');

  UserAuthenticationProvider.set('authenticate', function(login, password) {
    return {
      method: 'POST',
      url: 'https://api.domain.com/session',
      withCredentials: true,
      data: { "login" : login, "password" : password }
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

### Continuous Integration

...

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
