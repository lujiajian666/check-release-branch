const {
  exec
} = require('child_process');
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

module.exports = {
  execute,
  getLocationIp,
  checkPort
}