function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

import React from 'react';
import * as THREE from 'three';
export default function useDataDimensions(_ref) {
  var is3d = _ref.is3d,
      data = _ref.data;
  return React.useMemo(function () {
    var minX, minY, minZ, maxX, maxY, maxZ;

    var _iterator = _createForOfIteratorHelper(data),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _step.value,
            x = _step$value.x,
            y = _step$value.y,
            z = _step$value.z;
        minX = minX === undefined ? x : Math.min(minX, x);
        maxX = maxX === undefined ? x : Math.max(maxX, x);
        minY = minY === undefined ? y : Math.min(minY, y);
        maxY = maxY === undefined ? y : Math.max(maxY, y);

        if (is3d === true) {
          minZ = minZ === undefined ? z : Math.min(minZ, z);
          maxZ = maxZ === undefined ? z : Math.max(maxZ, z);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    var spanX, spanY, spanZ;
    spanX = maxX - minX;
    spanY = maxY - minY;
    if (is3d) spanZ = maxZ - minZ;
    var centerX, centerY, centerZ;
    centerX = (maxX - minX) / 2 | 0;
    centerY = (maxY - minY) / 2 | 0;

    if (is3d === true) {
      centerZ = (maxZ - minZ) / 2 | 0;
    }

    return {
      center: new THREE.Vector3(centerX, centerY, is3d ? centerZ : 1),
      size: new THREE.Vector3(spanX, spanY, is3d ? spanZ : 1)
    };
  }, [is3d, data]);
}