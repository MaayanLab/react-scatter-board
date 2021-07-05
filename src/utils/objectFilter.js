export default function objectFilter(obj, cb) {
  return Object.keys(obj)
    .filter(k => cb(obj[k], k))
    .reduce((agg, k) =>
      cb(obj[k], k)
        ? {...agg, [k]: obj[k]}
        : agg,
      {}
    )
}