// Ersätter lodash.debounce – det var det enda vi använde av hela lodash (~70 kB i bundlen).
export const debounce = (fn, ms) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
