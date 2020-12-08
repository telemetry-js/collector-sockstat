'use strict'

const test = require('tape')
const path = require('path')
const collector = require('.')
const sockstatPath = path.join(__dirname, 'sockstat_fixture')

test('emits all metrics by default', function (t) {
  t.plan(2)

  const c = collector({ sockstatPath })
  const metrics = []
  const common = { unit: 'count', resolution: 60, tags: {} }
  const expect = (name, value) => Object.assign({ name, value }, common)

  c.on('metric', metrics.push.bind(metrics))

  c.ping((err) => {
    t.ifError(err, 'no ping error')
    t.same(metrics.map(simplify), [
      expect('telemetry.sockstat.tcp.inuse.count', 30426),
      expect('telemetry.sockstat.tcp.orphan.count', 55),
      expect('telemetry.sockstat.tcp.time_wait.count', 337),
      expect('telemetry.sockstat.tcp.alloc.count', 30430),
      expect('telemetry.sockstat.tcp.mem.count', 21042)
    ])
  })
})

test('can filter metrics with wildcard', function (t) {
  t.plan(2)

  const c = collector({ sockstatPath, metrics: ['telemetry.sockstat.tcp.alloc.*', '*.time_wait.count'] })
  const metrics = []
  const common = { unit: 'count', resolution: 60, tags: {} }
  const expect = (name, value) => Object.assign({ name, value }, common)

  c.on('metric', metrics.push.bind(metrics))

  c.ping((err) => {
    t.ifError(err, 'no ping error')
    t.same(metrics.map(simplify), [
      // Order is dictated by pattern order
      expect('telemetry.sockstat.tcp.alloc.count', 30430),
      expect('telemetry.sockstat.tcp.time_wait.count', 337)
    ])
  })
})

test('can filter metrics with single name', function (t) {
  t.plan(2)

  const c = collector({ sockstatPath, metrics: ['telemetry.sockstat.tcp.orphan.count'] })
  const metrics = []
  const common = { unit: 'count', resolution: 60, tags: {} }
  const expect = (name, value) => Object.assign({ name, value }, common)

  c.on('metric', metrics.push.bind(metrics))

  c.ping((err) => {
    t.ifError(err, 'no ping error')
    t.same(metrics.map(simplify), [
      expect('telemetry.sockstat.tcp.orphan.count', 55)
    ])
  })
})

function simplify (metric) {
  delete metric.date
  delete metric.statistic

  return metric
}
