/**
 * Created by wolfman on 16-12-12.
 */
"use strict"

const co = require('co')
const assert = require('assert')

const {IORequestServer, IORequestClient} = require('../index')


// server
const server = require('http').createServer()
const io = require('socket.io')(server)

const ioReqServer = new IORequestServer(io)

ioReqServer.handle('echo', ({socket, data, response}) => {
  co(function *() {
    const echo_data = yield socket.ioRequest({method: 'echoData'})
    response(echo_data)
  })
})

server.listen(8080, () => {

  // client
  const client = require('socket.io-client')('http://localhost:8080')
  const ioReqClient = new IORequestClient(client)

  const echo_data = 'Hello IORequest!'
  ioReqClient.handle('echoData', ({response}) => {
    response(echo_data)
  })

  client.on('connect', () => {
    co(function *() {
      const data = yield ioReqClient.ioRequest({method: 'echo'})
      assert(echo_data === data)
    })
  })

})

