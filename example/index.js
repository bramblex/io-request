/**
 * Created by wolfman on 16-12-13.
 */

'use strict'

const co = require('co')
const fs = require('mz/fs')
const {IORequestServer} = require('io-request')

const server = require('http').createServer((request, response) => {
  co(function *() {
    if (request.url === "/") {
      const index_file = yield fs.readFile(__dirname + '/index.html')
      response.writeHead(200)
      response.end(index_file)
    } else if (request.url === "/io-request-client.js") {
      const client_js = yield fs.readFile(__dirname + '/../dist/browser/io-request-client.js')
      response.writeHead(200)
      response.end(client_js)
    } else {
      response.writeHead(404)
      response.end('404 NOT FOUND')
    }
  })
})

const io = require('socket.io')(server)
new IORequestServer(io)

let pair = []
let next_home_id = 1

class Game {

  constructor (left, right) {
    co(function *() {
      const home_id = next_home_id++
      left.emit(`msg`, `游戏开始，游戏房间号[${home_id}]，等待你出拳`)
      right.emit(`msg`, `游戏开始，游戏房间号[${home_id}]，等待你出拳`)

      const [l, r] = yield [
        left.ioRequest({method: 'choice'}),
        right.ioRequest({method: 'choice'})
      ]

      const _choices = [null, '布', '剪刀', '石头']
      left.emit('msg', `你出的是[${_choices[l]}], 对方出的是[${_choices[r]}]`)
      right.emit('msg', `你出的是[${_choices[r]}], 对方出的是[${_choices[l]}]`)

      if (Game.compare(l, r)) {
        left.emit('msg', '你赢了')
        right.emit('msg', '你输了')
      } else {
        right.emit('msg', '你赢了')
        left.emit('msg', '你输了')
      }

      right.disconnect()
      left.disconnect()

    })
  }

  // 石头 3 > 剪刀 2 > 布 1
  static compare(l, r) {
    if ( l - r === 1 && l - r === -2) {
      return false
    } else {
      return true
    }
  }
}

io.on('connection', socket => {

  pair.push(socket)
  if (pair.length === 2){
    const [left, right] = pair
    new Game(left, right)
    pair = []
  }

})

server.listen(8080)
