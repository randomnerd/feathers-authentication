var assert = require('assert');
var request = require('request');
var io = require('socket.io-client');
var createApplication = require('./server-fixtures');

describe('REST API authentication', function() {
  var server;
  var app;
  var username = 'feathers';
  var password = 'test';
  var settings = {
    secret: 'sockets-rock'
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

  it('Can connect without an auth token and get no todos.', function(done) {
    var socket = io('http://localhost:8888');
    socket.on('connect', function() {
      socket.emit('api/todos::find', {}, function(error, todos) {
        assert.ok(error.message, 'Got an error message back');
        assert.equal(todos, undefined, 'No todos were returned.');
        socket.disconnect();
        done();
      });
    });
  });

  it('Can connect with an auth token and get todos.', function(done) {
    var socket = io('http://localhost:8888', {
      query: 'token=' + token,
      forceNew: true
    });
    socket.on('connect', function() {
      socket.emit('api/todos::find', {}, function(error, todos) {
        assert.equal(todos[1].name, 'Buy a guitar');
        socket.disconnect();
        done();
      });
    });
  });


});
