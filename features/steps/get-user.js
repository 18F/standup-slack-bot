const sinon = require('sinon');
const request = require('request');
const helpers = require('../../lib/helpers');

module.exports = function getUserTests() {
  let fullUser;
  let requestPostMock;
  let postErr = null;
  let postBody = null;

  this.Given(/^the network is (up|down)$/, (status) => {
    postErr = null;
    postBody = null;

    if (status === 'up') {
      postBody = {
        ok: true,
        user: {
          id: 'id',
          team_id: 'team id',
          name: 'screen name',
          real_name: 'Real Name™'
        }
      };
    } else {
      postErr = new Error('Some network error');
    }

    requestPostMock = sinon.stub(request, 'post').yieldsAsync(postErr, null, JSON.stringify(postBody));
  });

  this.Given(/^I have a(n invalid| valid) user ID$/, (valid) => {
    if (valid !== ' valid') {
      postBody.ok = false;
      delete postBody.user;
      requestPostMock.yieldsAsync(postErr, null, JSON.stringify(postBody));
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
    const fin = (fullUserFromSetup) => {
      fullUser = fullUserFromSetup;
      done();
    };

    helpers.getUser('some-id').then(fin).catch(() => {
      fin('Error');
    });
  });

  this.Then('I receive a complete user object', () => {
    if (fullUser && fullUser.real_name) {
      return true;
    }
    throw new Error('Did not receive a complete user object as expected');
  });

  this.Then('I receive an error', () => {
    if (fullUser === 'Error') {
      return true;
    }
    throw new Error('Did not receive an error');
  });

  this.After(() => {
    if (requestPostMock) {
      requestPostMock.restore();
      requestPostMock = null;
    }
  });
};
