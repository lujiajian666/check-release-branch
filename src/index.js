const Koa = require('koa');
const app = new Koa();
const fs = require('fs');
const path = require('path');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
const {
  execute,
  getLocationIp,
  checkPort
} = require('./utils/promiseCMD.js');

const router = new Router();
app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())

getLocationIp().then(async ip => {
  const port = await checkPort();
  if (!port) return console.log('3000～3009端口均不可用, 无法运行')
  app.listen(port, function () {
    console.log(`项目运行在: http://${ip}:${port}`)
  });
}).catch(err => console.log(err.message || err))

const STATUS = {
  WAITING: Symbol(),
  DOING: Symbol(),
  DONE: Symbol()
}

const taskControl = {
  list: [],
  push(name) {
    this.list.push({
      name,
      status: STATUS.WAITING
    })
    this.checkBranchStatus()
  },
  async checkBranchStatus() {
    const {
      stdout,
      stderr
    } = execute(`git checkout master`).then(() => `git branch --merged`);
    console.debug(stdout, stderr);
  }
}

router.get('/', async ctx => {
  ctx.type = "text/html;charset=utf-8";
  ctx.body = html;
});
router.get('/status', async ctx => {
  ctx.type = "text/html;charset=utf-8";
  ctx.body = 1;
});
router.post('/submit', async ctx => {
  const body = ctx.request.body;
  taskControl.push(body.branch);
});