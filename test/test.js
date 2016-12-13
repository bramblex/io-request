/**
 * Created by wolfman on 16-12-12.
 */
"use strict"

const co = require('co')
const assert = require('assert')

const {IORequestServer, IORequestClient, IORequestError} = require('../index')


// server
const server = require('http').createServer()
const io = require('socket.io')(server)

const ioReqServer = new IORequestServer(io)

ioReqServer.handle('echo', ({response, data}) => {
    response(data)
})

ioReqServer.handle('timeout', () => {})

ioReqServer.handle('reject', ({reject, data}) => {
  reject({code: data.code, message: 'rejected'})
})

ioReqServer.handle('testClient', ({socket, response}) => {
  co(function *() {

    console.log('Test client echo data')
    const {message} = yield socket.ioRequest({method: 'echo', data: {message: 'hello'}})
    assert('hello' === message)

    try {
      console.log('Test client request timeout')
      yield  socket.ioRequest({method: 'timeout', timeout: 10})
    } catch (err) {
      assert(err.code === IORequestError.TIMEOUT.code)
    }

    try {
      console.log('Test client not handler found')
      yield socket.ioRequest({method: 'notFound'})
    } catch (err) {
      assert(err.code === IORequestError.NOT_FOUND.code)
    }

    try {
      console.log('Test client reject request')
      yield socket.ioRequest(({method: 'reject', data: {code: 100}}))
    } catch (err) {
      assert(err.code === 100)
    }

    response()

  })
})

server.listen(8080, () => {

  // client
  const client = require('socket.io-client')('http://localhost:8080')
  const ioReqClient = new IORequestClient(client)

  ioReqClient.handle('echo', ({response, data}) => {
    response(data)
  })

  ioReqClient.handle('timeout', () => {})

  ioReqClient.handle('reject', ({reject, data}) => {
    reject({code: data.code, message: 'rejected'})
  })


  client.on('connect', () => {

    co(function *() {

      console.log('Test server echo data')
      const {message} = yield ioReqClient.ioRequest({method: 'echo', data: {message: 'hello'}})
      assert('hello' === message)

      try {
        console.log('Test server request timeout')
        yield  ioReqClient.ioRequest({method: 'timeout', timeout: 10})
      } catch (err) {
        assert(err.code === IORequestError.TIMEOUT.code)
      }

      try {
        console.log('Test server not handler found')
        yield ioReqClient.ioRequest({method: 'notFound'})
      } catch (err) {
        assert(err.code === IORequestError.NOT_FOUND.code)
      }

      try {
        console.log('Test server reject request')
        yield ioReqClient.ioRequest(({method: 'reject', data: {code: 100}}))
      } catch (err) {
        assert(err.code === 100)
      }

      yield ioReqClient.ioRequest({method: 'testClient'})
      console.log('Test accessed')
      process.exit()

    })

  })

})

