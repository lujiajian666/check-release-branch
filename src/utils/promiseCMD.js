const {
  exec,
  spawn,
} = require('child_process');
const { fstat } = require('fs');
const path = require('path');
const DEFAULT_PORT_LIST = [
  3001,
  3002,
  3003,
  3004,
  3005,
  3006,
  3007,
  3008,
  3009,
]

function baseExec(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        // 不能用throw，外层try catch不能捕获。原因未明
        reject(error);
      }
      resolve({
        stdout,
        stderr
      });
    });
  })
}

function execute(cmd) {
  return baseExec(cmd);
}
async function checkPort(portList = DEFAULT_PORT_LIST) {
  let port;
  for (let i = 0, length = portList.length; i < length; i++) {
    try {
      // https://github.com/nodejs/node/issues/14309
      // 加 '|cat' 防止空结果错误
      const {
        stdout
      } = await baseExec(`lsof -i :${portList[i]} | cat`);
      if (stdout === '') {
        port = portList[i];
        break;
      }
    } catch (err) {
      console.log(err);
      continue;
    }
  }
  return port;
}
async function getLocationIp() {
  try {
    const wifiMessage = await baseExec('ifconfig en0');
    let ip = '';
    let locationIpMatchRes = /inet\s(\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3})\snetmask/.exec(wifiMessage.stdout);
    if (locationIpMatchRes && locationIpMatchRes[0]) {
      ip = locationIpMatchRes[1];
    }
    return ip;
  } catch (err) {
    throw err;
  }
}
function access(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, (err) => {
      if (!err) {
        reject(new Error(`${filePath} already exists`));
      }
      resolve();
    });
  })
}
async function gitCloneBare(remote = 'https://git.garena.com/beepos/foms_admin_portal.git', branch = 'master') {
  const cwd = path.resolve(__dirname, '../../bareGit/');
  await access()
  let resolveHandler, rejectHandler;
  const p = new Promise((resolve, reject) => {
    resolveHandler = resolve;
    rejectHandler = reject;
  });

  const command = spawn('git', ['clone', remote, '-b', branch, '--bare', ], { cwd });
  command.stdout.on('data', (data) => {
    console.log(`git clone stdout: ${data}`);
  });
  command.stderr.on('data', (data) => {
    console.error(`git clone stderr: ${data}`);
  });
  command.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) resolveHandler();
    else rejectHandler(new Error('git clone error'));
  });
  return await p;
}

module.exports = {
  execute,
  getLocationIp,
  checkPort,
  gitCloneBare
}