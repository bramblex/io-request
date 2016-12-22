/**
 * Created by wolfman on 16-12-12.
 */
"use strict"

const utils = require('./utils')

const nextMessageId = utils.generateCounter()
const createPromise = utils.createPromise

const IORequestError = require('./error')

module.exports = class IORequestServer {

  constructor (io) {
    this.io = io

    this.methods = {}
    this.unresponsed = {}

    this.io.on('connection', socket => {

      socket.on('io-request', ({message_id, method, data}) => {
        const handler = this.methods[method]
        if (handler) {
          handler({ socket, data,
            response: (_data) =>
              socket.emit('io-response', {success: true, message_id, data: _data}),
            reject: (error) =>
              socket.emit('io-response', {success: false, message_id, data: error})
          })
        } else {
          socket.emit('io-response', {success: false, message_id, data: IORequestError['NOT_FOUND']})
        }

      })

      socket.on('io-response', ({success, message_id, data}) => {
        const promise = this.unresponsed[message_id]
        if (promise) {
          if (success) {
            this.__resolveResponse__(promise, data)
          } else {
            this.__rejectResponse__(promise, new IORequestError(data))
          }
        }
      })

      socket.ioRequest = (...args) => this.ioRequest(socket, ...args)
    })

  }

  handle (method, handler) {
    this.methods[method] = handler
    return this
  }

  remove (method) {
    delete this.methods[method]
    return this
  }

  ioRequest (socket, {method, data = null, timeout = 0}) {
    const message_id = nextMessageId()
    const promise = createPromise(() => {
        socket.emit('io-request', {message_id, method, data})
    })

    this.__addResponse__(message_id, promise, timeout)

    return promise
  }

  __resolveResponse__ (promise, data) {
    promise.resolve(data)
    this.__removeResponse__(promise)
  }

  __rejectResponse__ (promise, data) {
    promise.reject(data)
    this.__removeResponse__(promise)
  }

  __addResponse__ (message_id, promise, timeout = 0) {
    promise.message_id = message_id
    if (timeout) {
      promise.timer = setTimeout(() => {
        this.__rejectResponse__(promise, new IORequestError(IORequestError['TIMEOUT']))
      }, timeout)
    }
    this.unresponsed[message_id] = promise
  }

  __removeResponse__ (promise) {
    if (promise.timer) {
      clearTimeout(promise.timer)
    }
    delete this.unresponsed[promise.message_id]
  }

}
