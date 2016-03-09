'use strict';

var sinon = require('sinon');
var request = require('request');
var helpers = require('../../lib/helpers');

module.exports = function() {
  var _seen = false;
  var _validUser = true;
  var _fullUser;
  var _requestPostMock;

  var _postErr = null
  var _postBody = null;

  this.Given(/^the network is (up|down)$/, function(status) {
    _postErr = null;
    _postBody = null;

    if(status === 'up') {
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

  this.Given(/^I have a(n invalid| valid) user ID$/, function(valid) {
    if(valid !== ' valid') {
      _postBody.ok = false;
      delete _postBody.user;
      _requestPostMock.yieldsAsync(_postErr, null, JSON.stringify(_postBody));
    }
  });

  this.Given(/^the user has( not)? been seen before$/, function(not, done) {
    if(!not) {
      helpers.getUser('some-id').then(function() {
        done();
      }).catch(function() {
        done();
      });
    } else {
      done();
    }
  });

  this.When('I ask for the full user', function(done) {
    var fin = function(fullUser) {
      _fullUser = fullUser;
      done();
    };

    helpers.getUser('some-id').then(fin).catch(function() {
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
