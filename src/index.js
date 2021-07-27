const Koa = require('koa')
const app = new Koa()
const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')
const WebSocket = require('ws')
const http = require('http')
const apiRouter = require('./router/apiRouter')
const wsRouter = require('./router/wsRouter')
const {
  getLocationIp,
  checkPort
} = require('./utils/promiseCMD.js')
// global variable
const globalData = {
  port: ''
}
// http
const router = new Router()
app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
apiRouter(router, globalData)
// ws
const server = http.createServer(app.callback())
const wss = new WebSocket.Server({ // 同一个端口监听不同的服务
  server
})
wsRouter(wss, globalData)

getLocationIp().then(async ip => {
  const port = await checkPort()
  if (!port) return console.log('3000～3009端口均不可用, 无法运行')
  server.listen(port, function () {
    globalData.port = port
    console.log(`项目运行在: http://${ip}:${port}`)
  })
}).catch(err => console.log(err.message || err))
