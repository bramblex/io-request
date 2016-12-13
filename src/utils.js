/**
 * Created by wolfman on 16-12-12.
 */
"use strict"

const createPromise = (executor) => {
  let __resolve__ = null, __reject__ = null
  const promise = new Promise((resolve, reject) => {
    __resolve__ = resolve
    __reject__ = reject
    executor(resolve, reject)
  })
  promise.resolve = __resolve__
  promise.reject = __reject__

  return promise
}

const generateCounter = () => {
  let next_count = 1
  return () => next_count++
}

module.exports = {
  generateCounter,
  createPromise
}
