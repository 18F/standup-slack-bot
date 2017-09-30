

const sinon = require('sinon');
const request = require('request');
const helpers = require('../../lib/helpers');

module.exports = function () {
  const _seen = false;
  const _validUser = true;
  let _fullUser;
  let _requestPostMock;

  let _postErr = null;
  let _postBody = null;

  this.Given(/^the network is (up|down)$/, (status) => {
    _postErr = null;
    _postBody = null;

    if (status === 'up') {
      _postBody = {
        ok: true,
        user: {
          id: 'id',
          team_id: 'team id',
          name: 'screen name',
          real_name: 'Real Name™'
        }
      };
    } else {
      _postErr = new Error('Some network error');
    }

    _requestPostMock = sinon.stub(request, 'post').yieldsAsync(_postErr, null, JSON.stringify(_postBody));
  });

  this.Given(/^I have a(n invalid| valid) user ID$/, (valid) => {
    if (valid !== ' valid') {
      _postBody.ok = false;
      delete _postBody.user;
      _requestPostMock.yieldsAsync(_postErr, null, JSON.stringify(_postBody));
    }
  });

  this.Given(/^the user has( not)? been seen before$/, (not, done) => {
    if (!not) {
      helpers.getUser('some-id').then(() => {
        done();
      }).catch(() => {
        done();
      });
    } else {
      done();
    }
  });

  this.When('I ask for the full user', (done) => {
    const fin = function (fullUser) {
      _fullUser = fullUser;
      done();
    };

    helpers.getUser('some-id').then(fin).catch(() => {
      fin('Error');
    });
  });

  this.Then('I receive a complete user object', () => {
    if (_fullUser && _fullUser.real_name) {
      return true;
    }
    throw new Error('Did not receive a complete user object as expected');
  });

  this.Then('I receive an error', () => {
    if (_fullUser === 'Error') {
      return true;
    }
    throw new Error('Did not receive an error');
  });

  this.After(() => {
    if (_requestPostMock) {
      _requestPostMock.restore();
      _requestPostMock = null;
    }
  });
};
