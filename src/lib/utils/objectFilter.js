export default function objectFilter(obj, cb) {
  const newObj = {}
  for (const k of Object.keys(obj)) {
    if (cb(obj[k], k)) newObj[k] = obj[k]
  }
  return newObj
}