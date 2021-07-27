const fs = require('fs')
const path = require('path')
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8')
function responseJSON (ctx, body) {
  ctx.type = 'application/json'
  ctx.body = JSON.stringify(body)
}
module.exports = function (router, globalSet) {
  router.get('/', async ctx => {
    ctx.type = 'text/html;charset=utf-8'
    ctx.body = html
  })
}
