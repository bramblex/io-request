/**
 * Created by wolfman on 16-12-12.
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = require('./utils');

var nextMessageId = utils.generateCounter();
var createPromise = utils.createPromise;

var IORequestError = require('./error');

module.exports = function () {
  function IORequestClient(socket) {
    var _this = this;

    _classCallCheck(this, IORequestClient);

    this.socket = socket;
    this.unresponsed = {};
    this.methods = {};

    socket.on('io-response', function (_ref) {
      var success = _ref.success,
          message_id = _ref.message_id,
          data = _ref.data;

      var promise = _this.unresponsed[message_id];
      if (promise) {
        if (success) {
          _this.__resolveResponse__(promise, data);
        } else {
          _this.__rejectResponse__(promise, new IORequestError(data));
        }
      }
    });

    socket.on('io-request', function (_ref2) {
      var message_id = _ref2.message_id,
          method = _ref2.method,
          data = _ref2.data;

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

    socket.ioRequest = function () {
      return _this.ioRequest.apply(_this, arguments);
    };
  }

  _createClass(IORequestClient, [{
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
    value: function ioRequest(_ref3) {
      var method = _ref3.method,
          _ref3$data = _ref3.data,
          data = _ref3$data === undefined ? null : _ref3$data,
          _ref3$timeout = _ref3.timeout,
          timeout = _ref3$timeout === undefined ? 0 : _ref3$timeout;

      var socket = this.socket;
      var message_id = socket.id + '_' + nextMessageId();

      var promise = createPromise(function () {
        socket.emit('io-request', { message_id: message_id, method: method, data: data });
      });

      this.__addResponse__(message_id, promise, timeout);
      return promise;
    }
  }, {
    key: '__resolveResponse__',
    value: function __resolveResponse__(promise, data) {
      promise.resolve(data);
      this.__removeResponse__(promise);
    }
  }, {
    key: '__rejectResponse__',
    value: function __rejectResponse__(promise, data) {
      promise.reject(data);
      this.__removeResponse__(promise);
    }
  }, {
    key: '__addResponse__',
    value: function __addResponse__(message_id, promise) {
      var _this2 = this;

      var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      promise.message_id = message_id;
      if (timeout) {
        promise.timer = setTimeout(function () {
          _this2.__rejectResponse__(promise, new IORequestError(IORequestError['TIMEOUT']));
        }, timeout);
      }
      this.unresponsed[message_id] = promise;
    }
  }, {
    key: '__removeResponse__',
    value: function __removeResponse__(promise) {
      if (promise.timer) {
        clearTimeout(promise.timer);
      }
      delete this.unresponsed[promise.message_id];
    }
  }]);

  return IORequestClient;
}();