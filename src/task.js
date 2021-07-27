const STATUS = {
  WAITING: Symbol(),
  DOING: Symbol(),
  DONE: Symbol()
}
const task = {}

module.exports = {
  addRepo(name) {
    if (task[name]) return;
    task[name] = {
      releaseName: 'master',
      featureList: []
    }
  },
  getAllRepo() {
    return Reflect.ownKeys(task).map(key => task[key]);
  }
}