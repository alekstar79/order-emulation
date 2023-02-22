export const even = n => !(n % 2)

export function sendRequest(request)
{
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: !!even(JSON.parse(request).qty) })

    },1e3)
  })
}

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
