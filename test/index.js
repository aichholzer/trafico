const Trafico = require('../lib');
const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;

let sandbox;
describe('➔ Trafico', () => {
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Start', (done) => {
    const traffic = new Trafico();
    expect(traffic).to.be.an('object');
    done();
  });
});
