export default function objectSort(obj, cmp) {
  const keys = Object.keys(obj)
  keys.sort((a, b) => cmp(obj[a], obj[b], a, b))
  const newObj = {}
  for (const k of keys) newObj[k] = obj[k]
  return newObj
}