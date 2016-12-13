/**
 * Created by wolfman on 16-12-12.
 */
"use strict"

const utils = require('./utils')

const nextMessageId = utils.generateCounter()
const createPromise = utils.createPromise

const IORequestError = require('./error')

module.exports = class IORequestClient {

  constructor (socket) {
    this.socket = socket
    this.id = null
    this.unresponsed = {}
    this.methods = {}

    socket.on('io-connect', ({client_id}) => {
      this.id = client_id
    })

    socket.on('io-response', ({success, message_id, data}) => {
      const promise = this.unresponsed[message_id]
      if (promise) {
        clearTimeout(promise.timer)
        if (success) {
          promise.resolve(data)
        } else {
          promise.reject(new IORequestError(data))
        }
        delete this.unresponsed[message_id]
      }
    })

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

    socket.emit('io-connect')
    socket.ioRequest = (...args) => this.ioRequest(...args)
  }

  handle (method, handler) {
    this.methods[method] = handler
    return this
  }

  remove (method) {
    delete  this.methods[method]
    return this
  }

  ioRequest ({method, data = null, timeout = 0}) {
    const socket = this.socket
    const message_id = `${this.id}_${nextMessageId()}`

    const promise = createPromise(() => {
      socket.emit('io-request', {message_id, method, data})
    })

    if (timeout) {
      promise.timer = setTimeout(() => {
        promise.reject(new IORequestError(IORequestError['TIMEOUT']))
        delete this.unresponsed[message_id]
      }, timeout)
    }

    this.unresponsed[message_id] = promise
    promise.message_id = message_id

    return promise
  }
}