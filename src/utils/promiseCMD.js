const {
  exec,
  spawn
} = require('child_process')
const fs = require('fs')
const path = require('path')
const task = require('../task')
const {
  execResultToArray
} = require('./regExp')
const DEFAULT_PORT_LIST = [
  3001,
  3002,
  3003,
  3004,
  3005,
  3006,
  3007,
  3008,
  3009
]

function baseExec (cmd, options) {
  return new Promise((resolve, reject) => {
    exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        // 不能用throw，外层try catch不能捕获。原因未明
        reject(error)
      }
      resolve({
        stdout,
        stderr
      })
    })
  })
}

function execute (cmd) {
  return baseExec(cmd)
}
async function checkPort (portList = DEFAULT_PORT_LIST) {
  let port
  for (let i = 0, length = portList.length; i < length; i++) {
    try {
      // https://github.com/nodejs/node/issues/14309
      // 加 '|cat' 防止空结果错误
      const {
        stdout
      } = await baseExec(`lsof -i :${portList[i]} | cat`)
      if (stdout === '') {
        port = portList[i]
        break
      }
    } catch (err) {
      console.log(err)
      continue
    }
  }
  return port
}
async function getLocationIp () {
  const wifiMessage = await baseExec('ifconfig en0')
  let ip = ''
  const locationIpMatchRes = /inet\s(\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3})\snetmask/.exec(wifiMessage.stdout)
  if (locationIpMatchRes && locationIpMatchRes[0]) {
    ip = locationIpMatchRes[1]
  }
  return ip
}

function access (filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, (err) => {
      if (!err) {
        const err = new Error(`${filePath} already exists`)
        err.from = 'access'
        reject(err)
      }
      resolve()
    })
  })
}
async function gitClone (remote = 'https://git.garena.com/beepos/foms_admin_portal.git', branch = 'master') {
  const cwd = getCwd(remote)
  try {
    await access(cwd)
    await clone({ remote, branch })
  } catch (err) {
    if (err.from !== 'access') throw err
  }
}
function findCloneFolderName (remote) {
  const regExp = /.*\/(\S*?)\.git/
  const matchRes = execResultToArray(regExp, remote)
  if (!matchRes[1]) throw new Error('仓库地址不正确')
  return matchRes[1]
}

function clone ({ remote, branch, cwd }) {
  return new Promise((resolve, reject) => {
    const command = spawn('git', ['clone', remote, '-b', branch], {
      cwd: path.resolve(__dirname, '../../bareGit')
    })
    command.stdout.on('data', (data) => {
      console.log(`git clone stdout: ${data}`)
    })
    command.stderr.on('data', (data) => {
      console.error(`git clone stderr: ${data}`)
    })
    command.on('error', (err) => {
      reject(err)
    })
    command.on('close', (code) => {
      console.log(`child process exited with code ${code}`)
      if (code === 0) resolve()
      else reject(new Error('git clone error'))
    })
  })
}

async function gitCheckout (repoName, branchName) {
  return new Promise((resolve, reject) => {
    const cwd = getCwd(repoName)
    const command = spawn('git', ['checkout', '-b', branchName, `origin/${branchName}`], {
      cwd
    })
    let errMsg = ''
    command.stdout.on('data', (data) => {
      console.log(`git checkout stdout: ${data}`)
    })
    command.stderr.on('data', (data) => {
      errMsg = data
      console.error(`git checkout stderr: ${data}`)
    })
    command.on('error', (err) => {
      reject(err)
    })
    command.on('close', (code) => {
      console.log(`child process exited with code ${code}`)
      if (code === 0) resolve()
      else reject(new Error(errMsg))
    })
  })
}
async function findMergedBranch (repoName) {
  const cwd = getCwd(repoName)
  const releaseBranch = task.getRepo(repoName).releaseName
  await baseExec(`git checkout ${releaseBranch}`, {
    cwd
  })
  await baseExec('git pull', {
    cwd
  })
  const res = await baseExec('git branch --merged', {
    cwd
  })
  const mergedList = branchMessageToArray(res.stdout)
  return mergedList
}
async function getLocalGitBranch (repoName) {
  const cwd = getCwd(repoName)
  const str = await baseExec('git branch', {
    cwd
  })
  return branchMessageToArray(str.stdout)
}
async function deleteGitBranch (repoName, branchName) {
  const cwd = getCwd(repoName)
  await baseExec(`git branch -D ${branchName}`, {
    cwd
  })
}
async function fetchOrigin (repoName) {
  const cwd = getCwd(repoName)
  await baseExec('git fetch origin', {
    cwd
  })
}
function getCwd (repoName) {
  const cloneFolderPath = findCloneFolderName(repoName)
  return path.resolve(__dirname, `../../bareGit/${cloneFolderPath}`)
}
function branchMessageToArray (str) {
  return str.trim().replace(/\n/g, ',').replace('*', '').split(',').map((str) => str.trim())
}

module.exports = {
  execute,
  getLocationIp,
  checkPort,
  gitClone,
  gitCheckout,
  findMergedBranch,
  getLocalGitBranch,
  deleteGitBranch,
  fetchOrigin
}
