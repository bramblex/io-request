/**
 * Created by wolfman on 16-12-12.
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = require('./utils');

var nextClientId = utils.generateCounter();
var nextMessageId = utils.generateCounter();

var IORequestError = require('./error');

module.exports = function () {
  function IORequestServer(io) {
    var _this = this;

    _classCallCheck(this, IORequestServer);

    this.io = io;

    this.sockets = {};
    this.methods = {};
    this.unresponsed = {};

    this.io.on('connection', function (socket) {

      socket.on('io-connect', function () {
        var client_id = nextClientId();
        socket.emit('io-connect', { client_id: client_id });
        socket.client_id = client_id;
        _this.sockets[client_id] = socket;
      });

      socket.on('io-request', function (_ref) {
        var message_id = _ref.message_id,
            method = _ref.method,
            data = _ref.data;

        var handler = _this.methods[method];
        if (handler) {
          handler({ socket: socket, data: data,
            response: function response(_data) {
              return socket.emit('io-response', { success: true, message_id: message_id, data: _data });
            },
            reject: function reject(error) {
              return socket.emit('io-response', { success: false, message_id: message_id, data: error });
            }
          });
        } else {
          socket.emit('io-response', { success: false, message_id: message_id, data: IORequestError['NOT_FOUND'] });
        }
      });

      socket.on('io-response', function (_ref2) {
        var success = _ref2.success,
            message_id = _ref2.message_id,
            data = _ref2.data;

        var promise = _this.unresponsed[message_id];
        if (promise) {
          clearTimeout(promise.timer);
          if (success) {
            promise.resolve(data);
          } else {
            promise.reject(new IORequestError(data));
          }
          delete _this.unresponsed[message_id];
        }
      });

      socket.on('disconnect', function () {
        var client_id = socket.client_id;
        if (client_id) {
          delete _this.sockets[client_id];
        }
      });

      socket.ioRequest = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _this.ioRequest.apply(_this, [socket].concat(args));
      };
    });
  }

  _createClass(IORequestServer, [{
    key: 'handle',
    value: function handle(method, handler) {
      this.methods[method] = handler;
      return this;
    }
  }, {
    key: 'remove',
    value: function remove(method) {
      delete this.methods[method];
      return this;
    }
  }, {
    key: 'ioRequest',
    value: function ioRequest(socket, _ref3) {
      var _this2 = this;

      var method = _ref3.method,
          _ref3$data = _ref3.data,
          data = _ref3$data === undefined ? null : _ref3$data,
          _ref3$timeout = _ref3.timeout,
          timeout = _ref3$timeout === undefined ? 0 : _ref3$timeout;

      var message_id = nextMessageId();
      return new Promise(function (resolve, reject) {
        socket.emit('io-request', { message_id: message_id, method: method, data: data });
        var result = { resolve: resolve, reject: reject };

        if (timeout) {
          result.timer = setTimeout(function () {
            // @TODO error
            reject(new IORequestError(IORequestError['TIMEOUT']));
            delete _this2.unresponsed[message_id];
          }, timeout);
        }
        _this2.unresponsed[message_id] = result;
      });
    }
  }]);

  return IORequestServer;
}();