'use strict'

const singleMetric = require('@telemetry-js/metric').single
const match = require('@telemetry-js/match-metric-names')
const EventEmitter = require('events').EventEmitter
const names = require('./lib/names')
const read = require('./lib/read')

const ALL_METRICS = Array.from(names.keys())

module.exports = function (options) {
  return new SockstatCollector(options)
}

class SockstatCollector extends EventEmitter {
  constructor (options) {
    if (!options) options = {}
    super()

    this._byProtocol = {}
    this._countOptions = { unit: 'count' }
    this._sockstatPath = options.sockstatPath || '/proc/net/sockstat'

    for (const name of match(ALL_METRICS, options.metrics)) {
      const metadata = names.get(name)
      const protocol = metadata.protocol
      const group = this._byProtocol[protocol] || (this._byProtocol[protocol] = {})

      group[name] = metadata
    }
  }

  // TODO: reuse metric objects between pings
  ping (callback) {
    read(this._sockstatPath, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT' && process.platform === 'win32') {
          return callback()
        } else {
          return callback(err)
        }
      }

      for (const protocol in this._byProtocol) {
        const group = this._byProtocol[protocol]
        const values = data[protocol]

        if (values === undefined) continue

        for (const name in group) {
          const metadata = group[name]
          const value = parseInt(values[metadata.column], 10)

          if (Number.isNaN(value)) continue

          const metric = singleMetric(name, this._countOptions)

          metric.record(value)
          this.emit('metric', metric)
        }
      }

      callback()
    })
  }
}
