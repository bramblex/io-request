# IORequest

## 介绍

IORequest 是一个基于 socket.io 的双向　request 库。

IORequest 同时支持客户端向服务端发送请求以及服务端向客户端发送请求。

## 安装

node

``` Bash
npm install io-request
```

浏览器

``` HTML
<script src="dist/browser/io-request-client.js"></script>
```

## 用法

服务端

``` JavaScript
const server = require('http').createServer()
const io = require('socket.io')(server)

const {IORequestServer} = require('io-request')

const ioReqServer = new IORequestServer(io)

// 定义服务端 echo 请求的 handler
ioReqServer.handle('echo', ({response, data}) => {
  response(data)
})

io.on('connection', socket => {

  socket.on('io-connect', () => {
    // 向客户端端发送 echo 请求
    socket.ioRequest({method: 'echo', data: 'hello client'})
      .then(data => console.log('客户端返回:' + JSON.stringify(data)))
  })

})

server.listen(8080)

```

客户端

``` JavaScript

const socket = io()
const ioReqClient = new IORequestClient(socket)

// 定义客户端 echo 请求的 handler
ioReqClient.handle('echo', ({response, data}) => {
  response(data)
})

socket.on('io-connect', () => {
  socket.ioRequest({method: 'echo', data: 'hello server'})
    .then(data => console.log('服务端返回:' + data))
})

```
