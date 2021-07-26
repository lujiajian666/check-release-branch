const { exec } = require('child_process');
function execute(cmd) {
  return new Promise(() => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
      resolve({ stdout, stderr });
    });
  })
}
module.exports = {
  execute
}