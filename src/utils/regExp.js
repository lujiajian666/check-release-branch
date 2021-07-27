module.exports = {
  execResultToArray (regExp, string) {
    const res = regExp.exec(string)
    if (res) return res
    else return []
  }
}
