var assert = require('assert');
var request = require('request');
var createApplication = require('./server-fixtures');

describe('REST API authentication', function() {
  var server;
  var app;
  var username = 'feathers';
  var password = 'test';
  var settings = {
    secret: 'feathers-rocks',
    jwtOptions: {
      expiresIn: 1 // Testing token expiration after 1 second.
    }
  };
  var token;

  before(function(done) {
    createApplication(settings, username, password, function(err, obj){
      app = obj.app;
      server = obj.server;
      done();
    });
  });

  after(function(done) {
    server.close(done);
  });

  it('Login works.', function(done) {
    request({
      url: 'http://localhost:8888/api/login',
      method: 'POST',
      form: {
        username: username,
        password: password
      },
      json: true
    }, function(err, res, body) {
      token = body.token;
      assert.ok(body.token, 'POST to /api/login gave us back a token.');
      done();
    });
  });

  it('Requests with an expired token will return an error.', function(done) {
    setTimeout(function(){
      request({
        url: 'http://localhost:8888/api/todos',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      }, function(err, res, body) {
        assert.notEqual(body.indexOf('TokenExpiredError'), -1, 'Got an error string back, not an object/array');
        done();
      });
    }, 1900);
  });



});
