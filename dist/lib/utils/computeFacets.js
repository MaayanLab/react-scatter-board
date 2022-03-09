import _typeof from "@babel/runtime/helpers/typeof";
import _objectWithoutProperties from "@babel/runtime/helpers/objectWithoutProperties";
var _excluded = ["x", "y", "z"];

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Scale from 'd3-scale';
import objectSort from './objectSort';
import { shapes } from '../shapes';

function validColor(c) {
  var s = new Option().style;
  s.color = c;
  return s.color === c;
}

function cmpNaN(a, b) {
  if (isNaN(a * 1.0) && isNaN(b * 1.0)) return 0;else if (isNaN(a * 1.0)) return 1;else if (isNaN(b * 1.0)) return -1;else return b * 1.0 - a * 1.0;
}

export default function computeFacets(data) {
  // identify key/values in data
  var facets = {};

  var _iterator = _createForOfIteratorHelper(data),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _ref2 = _step.value;

      var x = _ref2.x,
          y = _ref2.y,
          z = _ref2.z,
          d = _objectWithoutProperties(_ref2, _excluded);

      for (var k in d) {
        if (!(k in facets)) facets[k] = {
          type: _typeof(d[k]),
          values: {}
        };
        if (!(d[k] in facets[k].values)) facets[k].values[d[k]] = 0;
        facets[k].values[d[k]] += 1;
      }
    } // produce applicable scales

  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  for (var key in facets) {
    var facet = facets[key];
    if (Object.keys(facet.values).length <= 1) continue;
    facets[key] = computeScale(facet, data);
  }

  return facets;
}
export function computeScale(facet, data) {
  if (facet.type === 'string') {
    facet.values = objectSort(facet.values, function (a, b) {
      return b - a;
    });

    if (Object.keys(facet.values).filter(function (v) {
      return !validColor(v);
    }).length === 0) {
      // if colors are all interpretable as valid colors, passthrough
      facet.colorScale = function (color) {
        return color;
      };
    } else if (Object.keys(facet.values).length <= d3ScaleChromatic.schemeCategory10.length) {
      // if there are enough colors for all the catagories, map them to the chromatic scale
      var colorScale = d3Scale.scaleOrdinal().domain(Object.keys(facet.values)).range(d3ScaleChromatic.schemeCategory10);

      facet.colorScale = function (v) {
        return colorScale(v + '');
      };
    } else if (Object.keys(facet.values).length <= data.length * 0.1) {
      var N = Object.keys(facet.values).length;

      var _colorScale = d3Scale.scaleOrdinal().domain(Object.keys(facet.values)).range(Object.keys(facet.values).map(function (_, ind) {
        return d3ScaleChromatic.interpolateSinebow(ind / (N - 1));
      }));

      facet.colorScale = function (v) {
        return _colorScale(v + '');
      };
    }

    if (Object.keys(facet.values).filter(function (k) {
      return shapes[k] === undefined;
    }).length === 0) {
      // if the shapes are interpretable as valid shapes, passthrough
      facet.shapeScale = function (shape) {
        return shape;
      };
    } else if (Object.keys(facet.values).length <= Object.keys(shapes).length) {
      // if there are enough shapes for the categories, map them to the shapes
      var shapeScale = d3Scale.scaleOrdinal().domain(Object.keys(facet.values)).range(Object.keys(shapes));

      facet.shapeScale = function (v) {
        return shapeScale(v + '');
      };
    }
  }

  if (facet.type === 'bigint' || facet.type === 'number') {
    if (facet.type === 'bigint' && Object.keys(facet.values).length <= d3ScaleChromatic.schemeCategory10.length) {
      facet.values = objectSort(facet.values, function (_a, _b, a, b) {
        return cmpNaN(a, b);
      }); // if there are enough colors for the categories, map them to the chromatic scale

      var _colorScale2 = d3Scale.scaleOrdinal().domain(Object.keys(facet.values)).range(d3ScaleChromatic.schemeCategory10);

      facet.colorScale = function (v) {
        return _colorScale2(v + '');
      };
    }

    if (Object.keys(facet.values).length <= Object.keys(shapes).length) {
      facet.values = objectSort(facet.values, function (_a, _b, a, b) {
        return cmpNaN(a, b);
      }); // if there are enough shapes for the categories, map them to the shapes

      var _shapeScale = d3Scale.scaleOrdinal().domain(Object.keys(facet.values)).range(Object.keys(shapes));

      facet.shapeScale = function (v) {
        return _shapeScale(v + '');
      };
    } else {
      // not enough categorical colors -- treat number as linearly interpolated
      var domain = [Object.keys(facet.values).map(function (v) {
        return v * 1.0;
      }).reduce(function (m, v) {
        return isNaN(v) ? m : Math.min(m, v);
      }), Object.keys(facet.values).map(function (v) {
        return v * 1.0;
      }).reduce(function (m, v) {
        return isNaN(v) ? m : Math.max(m, v);
      })];

      if (!isNaN(domain[0]) && !isNaN(domain[1])) {
        facet.colorbar = domain;

        var _colorScale3 = d3Scale.scaleLinear().domain(domain).range(['grey', 'red']);

        facet.colorScale = function (v) {
          return isNaN(v * 1.0) ? 'lightgrey' : _colorScale3(v * 1.0);
        };
      }
    }
  }

  return facet;
}