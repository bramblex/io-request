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