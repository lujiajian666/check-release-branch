const {
  gitClone,
  gitCheckout,
  findMergedBranch,
  getLocalGitBranch
} = require('../utils/promiseCMD')
const task = require('../task')
const wsList = []
module.exports = function (wss) {
  wss.on('connection', ws => {
    wsList.push(ws)
    ws.on('message', async message => {
      console.log('received: %s', message)
      const receivedData = JSON.parse(message)
      try {
        const responseData = await handler(receivedData)
        ws.send(JSON.stringify({
          action: receivedData.action,
          status: 'success',
          data: responseData
        }))
      } catch (err) {
        console.log(err)
        ws.send(JSON.stringify({
          action: receivedData.action,
          status: 'error',
          message: err.message
        }))
      }
    })
    ws.send(JSON.stringify({
      action: 'refresh',
      status: 'success',
      data: task.getAllRepo()
    }))
  })
}
async function handler (receivedData) {
  switch (receivedData.action) {
    case 'addRepo':
      return await addRepo(receivedData)
    case 'addBranch':
      return await addBranch(receivedData)
    case 'changeReleaseBranch':
      return await changeReleaseBranch(receivedData)
    default:
      return {}
  }
}
async function addRepo (receivedData) {
  const repoName = receivedData.repoAddress
  await gitClone(repoName)
  const localBranches = await getLocalGitBranch(repoName)
  task.addRepo(repoName, localBranches)
  sendToAll(task.getAllRepo())
}
async function addBranch (receivedData) {
  const repoName = receivedData.repoName
  const branchName = receivedData.branchName
  await gitCheckout(repoName, branchName)
  task.addFeatureBranch(repoName, branchName)
  const mergedList = await findMergedBranch(repoName)
  task.setBranchStatus(repoName, mergedList)
  sendToAll(task.getAllRepo())
}
async function changeReleaseBranch (receivedData) {
  const repoName = receivedData.repoName
  const branchName = receivedData.branchName
  try {
    await gitCheckout(repoName, branchName)
    task.addFeatureBranch(repoName, branchName)
  } catch (err) {
    if (err.message.indexOf('already exists') === -1) {
      throw err
    }
  }
  task.changeReleaseBranch(repoName, branchName)
  const mergedList = await findMergedBranch(repoName)
  task.setBranchStatus(repoName, mergedList)
  sendToAll(task.getAllRepo())
}
function sendToAll (message) {
  wsList.forEach((ws) => {
    ws.send(JSON.stringify({
      action: 'refresh',
      data: message
    }))
  })
}
