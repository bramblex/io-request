/**
 * Created by wolfman on 16-12-12.
 */
"use strict"

const generateCounter = () => {
  let next_count = 1
  return () => next_count++
}

module.exports = {generateCounter}
