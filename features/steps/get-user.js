'use strict';

var sinon = require('sinon');
var request = require('request');
var helpers = require('../../lib/helpers');

module.exports = function() {
  var _seen = false;
  var _fullUser;
  var _requestPostMock;

  this.Given(/^the user has( not)? been seen before$/, function(not) {
    if(not) {
      _seen = false;
    } else {
      _seen = true;
    }
  });

  this.Given(/^the network is (up|down)$/, function(status) {
    var err = null;
    var body = null;

    if(status === 'up') {
      body = JSON.stringify({
        ok: true,
        user: {
          id: 'id',
          team_id: 'team id',
          name: 'screen name',
          real_name: 'Real Name™'
        }
      })
    } else {
      err = new Error('Some network error');
    }

    _requestPostMock = sinon.stub(request, 'post').yieldsAsync(err, null, body);
  });

  this.When('I ask for the full user', function(done) {
    var fin = function(fullUser) {
      _fullUser = fullUser;
      done();
    };

    helpers.getUser('some-id').then(function(fullUser) {
      if(_seen) {
        helpers.getUser('some-id').then(fin);
      } else {
        fin(fullUser);
      }
    }).catch(function() {
      fin('Error');
    });
  });

  this.Then('I receive a complete user object', function() {
    if(_fullUser && _fullUser.real_name) {
      return true;
    } else {
      throw new Error('Did not receive a complete user object as expected');
    }
  });

  this.Then('I receive an error', function() {
    if(_fullUser === 'Error') {
      return true;
    } else {
      throw new Error('Did not receive an error');
    }
  });

  this.After(function() {
    if(_requestPostMock) {
      _requestPostMock.restore();
      _requestPostMock = null;
    }
  })
};
