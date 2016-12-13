/**
 * Created by wolfman on 16-12-12.
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = require('./utils');

var nextMessageId = utils.generateCounter();

var IORequestError = require('./error');

module.exports = function () {
  function IORequestClient(socket) {
    var _this = this;

    _classCallCheck(this, IORequestClient);

    this.socket = socket;
    this.id = null;
    this.unresponsed = {};
    this.methods = {};

    socket.on('io-connect', function (_ref) {
      var client_id = _ref.client_id;

      _this.id = client_id;
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

    socket.on('io-request', function (_ref3) {
      var message_id = _ref3.message_id,
          method = _ref3.method,
          data = _ref3.data;

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

    socket.emit('io-connect');
  }

  _createClass(IORequestClient, [{
    key: 'ioRequest',
    value: function ioRequest(_ref4) {
      var _this2 = this;

      var method = _ref4.method,
          _ref4$data = _ref4.data,
          data = _ref4$data === undefined ? null : _ref4$data,
          _ref4$timeout = _ref4.timeout,
          timeout = _ref4$timeout === undefined ? 0 : _ref4$timeout;

      var socket = this.socket;
      var message_id = this.id + '_' + nextMessageId();
      return new Promise(function (resolve, reject) {
        socket.emit('io-request', { message_id: message_id, method: method, data: data });
        var result = { resolve: resolve, reject: reject };

        if (timeout) {
          result.timer = setTimeout(function () {
            reject(new IORequestError(IORequestError['TIMEOUT']));
            delete _this2.unresponsed[message_id];
          }, timeout);
        }

        _this2.unresponsed[message_id] = result;
      });
    }
  }, {
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
  }]);

  return IORequestClient;
}();