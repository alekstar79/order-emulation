/**
* @param {Number} n
* @returns {Boolean}
*/
export const even = n => !(n % 2)

/**
* @param {{ amount: Number }} request
* @returns {Promise<{ success: Boolean }>}
*/
export function sendRequest(request)
{
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: !!even(request.amount) })
    },1e3)
  })
}

/**
* @param {Object} object
* @param {?Function} replacer
* @param {?Number} space
* @returns {String}
*/
export function stringify(object, replacer = null, space = 2)
{
  return JSON.stringify(
    Object.entries(object).reduce((acc, [k, v]) => {
      return { ...acc, [k]: Number(v) }
    }, ''),

    replacer,
    space
  )
}

/**
* @param {Function} fn
* @param {Number} ms
* @returns {function(...[*]): void}
*/
export function debounce(fn, ms = 300)
{
  let timeout

  return function(...args) {
    timeout && clearTimeout(timeout)

    timeout = setTimeout(() => {
      fn.apply(this, args)
    }, ms)
  }
}
