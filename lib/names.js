'use strict'

module.exports = new Map([
  ['telemetry.sockstat.tcp.inuse.count', { protocol: 'TCP', column: 'inuse' }],
  ['telemetry.sockstat.tcp.orphan.count', { protocol: 'TCP', column: 'orphan' }],
  ['telemetry.sockstat.tcp.time_wait.count', { protocol: 'TCP', column: 'tw' }],
  ['telemetry.sockstat.tcp.alloc.count', { protocol: 'TCP', column: 'alloc' }],
  ['telemetry.sockstat.tcp.mem.count', { protocol: 'TCP', column: 'mem' }]
])
