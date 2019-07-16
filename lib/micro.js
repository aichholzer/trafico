// Modules
const fs = require('fs');
const EventEmitter = require('events');

const proxy = (targetObject) =>
  new Proxy(targetObject, {
    set: (target, property, value) => {
      let result = true;
      if (['controllers'].includes(property)) {
        result = false;
      }

      if (property === 'notFound' && (typeof value !== 'function' || value.length < 2)) {
        targetObject.emit(
          'error',
          new Error('A function with at least two parameters (req, res) is expected.')
        );
        result = false;
      }

      if (['isRouted', 'notFound'].includes(property)) {
        target[property] = value;
      }

      return result;
    }
  });

class Router extends EventEmitter {
  constructor(options = {}) {
    super();
    try {
      this.router = options.express.Router();
    } catch (error) {
      throw new Error(`Trafico requires Express; ${error.message}`);
    }

    if (!options.controllers) {
      this.skipRouting = true;
      this.emit('warning', new Error('Controllers have not been set.'));
    }

    this.isRouted = false;
    this.controllers = options.controllers || null;
    this.notFound = (req, res, next) => {
      if (req.headers.upgrade !== 'websocket') {
        return res.status(404).send({
          status: 404,
          error: 'Page not found.'
        });
      }

      return next();
    };

    return proxy(this);
  }

  patch(options = []) {
    if (!options.length) {
      return null;
    }

    if (this.isRouted) {
      throw new Error('"patch()" must be called before "route()".');
    }

    options.forEach((option) => {
      const key = Object.keys(option)[0];
      if (key === 'use') {
        this.router.use(option[key]);
      } else {
        this.router[key] = option[key];
      }
    });

    return this.router;
  }

  route() {
    if (this.skipRouting) {
      return this.router;
    }

    fs.readdirSync(this.controllers)
      .filter((file) => file.endsWith('.js'))
      .forEach((file) => {
        try {
          const controller = require.call(null, `${this.controllers}/${file}`);
          this.router = controller(this.router);
        } catch (error) {
          this.emit('error', new Error(`Can't load controller: ${file} -${error.message}`));
        }
      });

    this.router.use(this.notFound);
    this.isRouted = true;
    return this.router;
  }
}

module.exports = Router;
