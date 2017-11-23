// Modules
const fs = require('fs');
const EventEmitter = require('events');

class Router extends EventEmitter {
  constructor(options = {}) {
    super();
    try {
      this.router = options.express.Router();
    } catch (error) {
      throw new Error(`Trafico requires Express; ${error.message}`);
    }

    if (!options.routes || !options.controllers) {
      this.skipRouting = true;
      this.emit('warning', 'Either routes or controllers have not been set');
    }

    this.isRouted = false;
    this.routes = options.routes || null;
    this.controllers = options.controllers || null;
    this.notFound = (req, res) => res.statusCode(404).send({
      status: 404,
      error: 'Page not found'
    });

    return new Proxy(this, {
      set: (target, property, value) => {
        if (['routes', 'controllers'].includes(property)) {
          return false;
        }

        if (property === 'notFound') {
          if (typeof value === 'function' && value.length >= 2) {
            target[property] = value;
            return true;
          }

          if (typeof value !== 'function' || value.length < 2) {
            this.emit('error', new Error('A function with at least two parameters (req, res) is expected.'));
            return false;
          }
        } else if (property === 'isRouted') {
          target[property] = value;
        }

        return true;
      }
    });
  }

  patch(options = []) {
    if (!options.length) {
      return null;
    }

    if (this.isRouted) {
      throw new Error('"patch()" must be called before "route()"');
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

    /**
     * This will setup the routes, as defined in options.routes.
     * For each route, it will also try to load a corresponding controller, from options.controllers
     * If a controller is not found, then that route will not be available.
     * @returns {Router}
     */
    fs.readdirSync(this.routes).filter(file => file.endsWith('.js')).forEach((file) => {
      try {
        const route = require.call(null, `${this.routes}/${file}`);
        const controller = require.call(null, `${this.controllers}/${file}`);
        this.router = route(this.router, controller);
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
