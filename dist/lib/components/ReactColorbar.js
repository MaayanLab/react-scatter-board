import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import React from 'react';
export default function ReactColorbar(_ref) {
  var label = _ref.label,
      facet = _ref.facet,
      children = _ref.children;

  var _facet$colorbar = _slicedToArray(facet.colorbar, 2),
      min = _facet$colorbar[0],
      max = _facet$colorbar[1];

  var range = max - min;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '200px',
      maxHeight: '50%',
      marginBottom: '10px',
      color: 'black',
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      opacity: 0.8
    }
  }, /*#__PURE__*/React.createElement("b", null, label), "\xA0", min, [0, 1, 2, 3, 4].map(function (i) {
    return facet.colorScale(min + range * i / 4.0);
  }).map(function (c, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        width: 24,
        height: 24,
        backgroundColor: c
      }
    }, "\xA0");
  }), "\xA0", max);
}