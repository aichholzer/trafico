const Trafico = require('../lib');
const express = require('express');
const chai = require('chai');
const sinon = require('sinon');

const { expect } = chai;

let sandbox;
describe('➔ Trafico', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Start (error without Express)', (done) => {
    let traffic;
    try {
      traffic = new Trafico();
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.be.a('string');
      expect(error.message).to.equal(
        "Trafico requires Express; Cannot read property 'Router' of undefined"
      );
    }

    done();
    return traffic;
  });

  it('Start (without routers nor controllers, skip routing)', (done) => {
    const traffic = new Trafico({ express });
    expect(traffic).to.be.an('object');
    traffic.route();

    done();
  });

  it('Start (with routers and controllers, do not skip routing)', (done) => {
    const traffic = new Trafico({
      express,
      routes: `${__dirname}/routes`,
      controllers: `${__dirname}/controllers`
    });
    expect(traffic).to.be.an('object');
    traffic.route();

    done();
  });

  it('Patch (without options)', (done) => {
    const traffic = new Trafico({
      express,
      routes: `${__dirname}/routes`,
      controllers: `${__dirname}/controllers`
    });
    expect(traffic).to.be.an('object');
    traffic.patch();

    done();
  });

  it('Patch (with options)', (done) => {
    const traffic = new Trafico({
      express,
      routes: `${__dirname}/routes`,
      controllers: `${__dirname}/controllers`
    });
    expect(traffic).to.be.an('object');
    traffic.patch([{ use: (req, res, next) => next() }, { render: (req, res, next) => next() }]);

    done();
  });

  it('Patch (error, call after route())', (done) => {
    const traffic = new Trafico({
      express,
      routes: `${__dirname}/routes`,
      controllers: `${__dirname}/controllers`
    });
    expect(traffic).to.be.an('object');

    try {
      traffic.route();
      traffic.patch([{ use: (req, res, next) => next() }]);
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.be.a('string');
      expect(error.message).to.equal('"patch()" must be called before "route()"');
    }

    done();
  });

  it('Can not set controllers and routes in the proxy', (done) => {
    const traffic = new Trafico({
      express,
      routes: `${__dirname}/routes`,
      controllers: `${__dirname}/controllers`
    });
    expect(traffic).to.be.an('object');
    traffic.routes = '/new/path';
    expect(traffic.routes).to.be.a('string');
    expect(traffic.routes).to.include('trafico/test/routes');

    done();
  });

  it('Set invalid (string) notFound function in the proxy', (done) => {
    const traffic = new Trafico({
      express,
      routes: `${__dirname}/routes`,
      controllers: `${__dirname}/controllers`
    });

    traffic.on('error', (error) => {
      expect(error).to.be.an('error');
      expect(error.message).to.be.a('string');
      expect(error.message).to.equal(
        'A function with at least two parameters (req, res) is expected.'
      );
      expect(traffic.notFound).to.be.a('function');

      done();
    });

    expect(traffic).to.be.an('object');
    traffic.notFound = '/new/path';
  });

  it('Set invalid (one parameter) notFound function in the proxy', (done) => {
    const traffic = new Trafico({
      express,
      routes: `${__dirname}/routes`,
      controllers: `${__dirname}/controllers`
    });

    traffic.on('error', (error) => {
      expect(error).to.be.an('error');
      expect(error.message).to.be.a('string');
      expect(error.message).to.equal(
        'A function with at least two parameters (req, res) is expected.'
      );
      expect(traffic.notFound).to.be.a('function');

      done();
    });

    expect(traffic).to.be.an('object');
    traffic.notFound = (req) => req.params;
  });

  it('Set valid notFound function in the proxy', (done) => {
    const traffic = new Trafico({
      express,
      routes: `${__dirname}/routes`,
      controllers: `${__dirname}/controllers`
    });

    expect(traffic).to.be.an('object');
    traffic.notFound = (req, res) => {
      res.send({ error: 'fromTheTest' });
    };
    expect(traffic.notFound).to.be.a('function');

    done();
  });
});
