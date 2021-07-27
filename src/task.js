const STATUS = {
  WAITING: Symbol('status'),
  DOING: Symbol('status'),
  DONE: Symbol('status')
}
const task = {}

module.exports = {
  addRepo (name) {
    if (task[name]) return
    task[name] = {
      repoName: name,
      releaseName: 'master',
      featureList: []
    }
  },
  getAllRepo () {
    return Reflect.ownKeys(task).map(key => task[key])
  }
}
