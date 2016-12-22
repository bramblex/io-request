/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by wolfman on 16-12-13.
	 */

	// export
	IORequestClient = __webpack_require__(1)


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by wolfman on 16-12-12.
	 */
	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var utils = __webpack_require__(2);

	var nextMessageId = utils.generateCounter();
	var createPromise = utils.createPromise;

	var IORequestError = __webpack_require__(3);

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

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Created by wolfman on 16-12-12.
	 */
	"use strict";

	var createPromise = function createPromise(executor) {
	  var __resolve__ = null,
	      __reject__ = null;
	  var promise = new Promise(function (resolve, reject) {
	    __resolve__ = resolve;
	    __reject__ = reject;
	    executor(resolve, reject);
	  });
	  promise.resolve = __resolve__;
	  promise.reject = __reject__;

	  return promise;
	};

	var generateCounter = function generateCounter() {
	  var next_count = 1;
	  return function () {
	    return next_count++;
	  };
	};

	module.exports = {
	  generateCounter: generateCounter,
	  createPromise: createPromise
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * Created by wolfman on 16-12-13.
	 */
	"use strict";

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var IORequestError = function (_Error) {
	  _inherits(IORequestError, _Error);

	  function IORequestError(_ref) {
	    var code = _ref.code,
	        message = _ref.message;

	    _classCallCheck(this, IORequestError);

	    var _this = _possibleConstructorReturn(this, (IORequestError.__proto__ || Object.getPrototypeOf(IORequestError)).call(this, 'CODE: ' + code + ', MSG: ' + message));

	    _this.code = code;
	    return _this;
	  }

	  return IORequestError;
	}(Error);

	[['TIMEOUT', 1, 'Request time out'], ['NOT_FOUND', 2, 'Cannot find handler']].forEach(function (_ref2) {
	  var _ref3 = _slicedToArray(_ref2, 3),
	      type = _ref3[0],
	      code = _ref3[1],
	      message = _ref3[2];

	  IORequestError[type] = { code: code, message: message };
	});

	module.exports = IORequestError;

/***/ }
/******/ ]);