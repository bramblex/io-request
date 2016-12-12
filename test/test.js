/**
 * Created by wolfman on 16-12-12.
 */
"use strict"

const co = require('co')

const {IORequestServer, IORequestClient} = require('../index')


// server
const server = require('http').createServer()
const io = require('socket.io')(server)

const ioReqServer = new IORequestServer(io)

ioReqServer.handle('echo', ({response}) => {
  co(function *() {
    response(data)
  })
})


server.listen(8080, () => {

  const client = require('socket.io-client')('http://localhost:8080')
  const ioReqClient = new IORequestClient(client)

  ioReqClient.handle('echoData', ({response}) => {
    response('Hello IORequest!')
  })

  client.on('connect', () => {
    co(function *() {
      const response = yield ioReqClient.ioRequest({method: 'echo'})
      console.log(response)
    })
  })

})

// client
