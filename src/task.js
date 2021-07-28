const STATUS = {
  WAITING: 'waiting',
  CHECKING: 'checking',
  MERGED: 'merged',
  NOT_MERGED: 'not merged'
}
const task = {}

module.exports = {
  addRepo (name, initBranches = []) {
    if (task[name]) return
    task[name] = {
      repoName: name,
      releaseName: 'master',
      featureList: initBranches.map((branchName) => ({
        name: branchName,
        status: STATUS.WAITING
      }))
    }
  },
  getAllRepo () {
    return Reflect.ownKeys(task).map(key => task[key])
  },
  getRepo (repoName) {
    return task[repoName]
  },
  addFeatureBranch (repoName, branchName) {
    task[repoName].featureList.push({
      name: branchName,
      status: STATUS.CHECKING
    })
  },
  changeReleaseBranch (repoName, branchName) {
    if (task[repoName]) {
      task[repoName].releaseName = branchName
    }
  },
  setBranchStatus (repoName, mergedBranchNames) {
    const featureList = task[repoName].featureList
    for (let i = 0, length = featureList.length; i < length; i++) {
      const currentBranch = featureList[i]
      if (mergedBranchNames.includes(currentBranch.name)) {
        currentBranch.status = STATUS.MERGED
      } else {
        currentBranch.status = STATUS.NOT_MERGED
      }
    }
  }
}
