export default function objectSort(obj, cmp) {
  var keys = Object.keys(obj);
  keys.sort(function (a, b) {
    return cmp(obj[a], obj[b], a, b);
  });
  var newObj = {};

  for (var _i = 0, _keys = keys; _i < _keys.length; _i++) {
    var k = _keys[_i];
    newObj[k] = obj[k];
  }

  return newObj;
}