/*! angular-thread - v0.1.3 - MIT License - https://github.com/h2non/angular-thread */
angular.module('ngThread', [])

  .constant('$$thread', window.thread)

  .config(['$$thread', function (thread) {
    if (typeof thread !== 'function') {
      throw new Error('thread.js is not loaded')
    }
  }])

  .provider('$thread', ['$$thread', function (thread) {
    function threadProvider() {
      return thread
    }
    threadProvider.$get = threadProvider
    return threadProvider
  }])

  .provider('$threadRun', ['$$thread', function (thread) {
    function runner() {
      var job = this.thread ? this.thread : thread()
      var task = job.run.apply(job, arguments)
      if (!this.thread) {
        task['finally'](function () { job.kill() })
      }
      return task
    }
    runner.$get = function () {
      function run() { return runner.apply(run, arguments) }
      run.thread = null
      return run
    }
    return runner
  }])

  .provider('$threadPool', ['$$thread', function (thread) {
    function poolFactory(num) {
      return thread().pool(num)
    }
    poolFactory.$get = function () { return poolFactory }
    return poolFactory
  }])

  .provider('$threadStore', ['$$thread', function ($$thread) {
    function store() {
      var buf = []
      return {
        get: function () {
          return buf.slice()
        },
        push: function (thread) {
          if (thread && thread instanceof $$thread.Thread)
            if (!this.has(thread)) buf.push(thread)
        },
        remove: function (thread) {
          var index = buf.indexOf(thread)
          if (index >= 0) buf.splice(index, 1)
          return index
        },
        flush: function () {
          buf.splice(0)
        },
        has: function (thread) {
          return buf.indexOf(thread) !== -1
        },
        total: function () {
          return buf.length
        }
      }
    }
    store.$get = store
    return store
  }])
