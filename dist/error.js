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