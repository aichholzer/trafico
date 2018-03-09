<p align="center">
  <img src="https://raw.githubusercontent.com/aichholzer/trafico/master/assets/cover.png" alt="Tráfico" />
</p>

[![npm version](https://badge.fury.io/js/trafico.svg)](https://badge.fury.io/js/trafico)
[![Downloads](https://img.shields.io/npm/dt/trafico.svg)](https://www.npmjs.com/package/trafico)
[![Build Status](https://travis-ci.org/aichholzer/trafico.svg?branch=master)](https://travis-ci.org/aichholzer/trafico)
[![Coverage Status](https://coveralls.io/repos/github/aichholzer/trafico/badge.svg?branch=master)](https://coveralls.io/github/aichholzer/trafico?branch=master)
[![codebeat badge](https://codebeat.co/badges/05bcb301-f614-4c2c-892a-557253770e85)](https://codebeat.co/projects/github-com-aichholzer-trafico-master)
[![Dependency Status](https://gemnasium.com/badges/github.com/aichholzer/trafico.svg)](https://gemnasium.com/github.com/aichholzer/trafico)

##### 🚥 Awesome -zero dependency- router for Express.

`Tráfico` will map routes to controllers and enable them in your Express application, so you don't have to do it manually and for each one. This provides an easier abstraction and enables a _drop-in-and-use_ route/controller setup.


### Basic use

```js
const express = require('express');
const Trafico = require('trafico');

const app = express();
const trafico = new Trafico({
  express,
  routes: `/path/to/routes`,
  controllers: `/path/to/controllers`
});

app.use(trafico.route());
app.listen(port, () => {
  console.log(`Up on port: ${port}`);
});
```


### Routes

In your `routes` folder (`/path/to/routes`) create the routes you need to be mapped to your application. For example:

```
| path/to/routes
  | home.js
  | user.js
```

The `home.js` route would look similar to this (define your routes as you normally would in your Express application):

```js
module.exports = (router, controller) => {
  router.get('/', controller.index);
  router.get('/date', controller.date);

  return router;
};
```


### Controllers

`Tráfico` will load all routes from the `routes path` you specify and try to look for the controllers to match them. Create your controllers in the `controllers` folder (`/path/to/controllers`). Controllers must be named like their corresponding routes.

```
| path/to/controllers
  | home.js
  | user.js
```

The `home.js` controller would expose the methods mapped in the route:

```js
module.exports = {
  index: (req, res) => {
    res.send({ hello: 'world' });
  },
  
  date: (req, res) => {
    res.send({ date: +new Date() });
  }
};
```


### Working examples

Have a look at the `/test` folder. [ExpressBoilerplate](https://github.com/aichholzer/ExpressBoilerplate) also uses `Tráfico`.


### Contribute
```
fork https://github.com/aichholzer/trafico
```


### License

[MIT](https://github.com/aichholzer/trafico/blob/master/LICENSE)

