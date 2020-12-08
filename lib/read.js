'use strict'

const fs = require('fs')

module.exports = function (sockstatPath, callback) {
  fs.readFile(sockstatPath, 'utf8', (err, data) => {
    if (err) return callback(err)

    const lines = data.trim().split(/\r?\n+/)
    const result = {}

    for (const line of lines) {
      const pos = line.indexOf(':')
      if (pos <= 0) continue

      const protocol = line.slice(0, pos)
      const columns = line.slice(pos + 1).trim().split(' ')
      const group = result[protocol] = {}

      for (let i = 0; i < columns.length; i += 2) {
        const key = columns[i]
        const value = columns[i + 1]

        group[key] = value
      }
    }

    callback(null, result)
  })
}
