/**
 * Created by wolfman on 16-12-12.
 */
"use strict";

var generateCounter = function generateCounter() {
  var next_count = 1;
  return function () {
    return next_count++;
  };
};

module.exports = { generateCounter: generateCounter };