const { gitCloneBare } = require('../utils/promiseCMD');
const task = require('../task');
module.exports = function(wss) {
  wss.on('connection', ws => {
    ws.on('message', async message => {
        console.log('received: %s', message);
        const receivedData = JSON.parse(message);
        try {
          const responseData = await handler(receivedData);
          ws.send(JSON.stringify({
            action: receivedData.action,
            status: 'success',
            data: responseData
          }));
        } catch(err) {
          ws.send(JSON.stringify({
            action: receivedData.action,
            status: 'error',
            message: err.message
          }));
        }
    });
  });
}
async function handler(receivedData) {
  switch(receivedData.action) {
    case 'addRepo':
      return await addRepo(receivedData);
    default:
      return {};
  }
}
async function addRepo(receivedData) {
  await gitCloneBare(receivedData.repoAddress);
  task.addRepo(receivedData.repoAddress);
  return task.getAllRepo();
}