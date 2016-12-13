/**
 * Created by wolfman on 16-12-13.
 */
"use strict";

class IORequestError extends Error {
  constructor ({code, message}) {
    super(`CODE: ${code}, MSG: ${message}`)
    this.code = code
  }
}

[
  ['TIMEOUT', 1, 'Request time out'],
  ['NOT_FOUND', 2, 'Cannot find handler']

].forEach(([type, code, message]) => {
  IORequestError[type] = {code, message}
})

module.exports = IORequestError
