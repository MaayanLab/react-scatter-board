export default function objectFilter(obj, cb) {
  var newObj = {};

  for (var _i = 0, _Object$keys = Object.keys(obj); _i < _Object$keys.length; _i++) {
    var k = _Object$keys[_i];
    if (cb(obj[k], k)) newObj[k] = obj[k];
  }

  return newObj;
}