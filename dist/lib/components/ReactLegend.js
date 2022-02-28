import React from 'react';
export default function ReactLegend(_ref) {
  var label = _ref.label,
      facet = _ref.facet,
      children = _ref.children;
  var Child = children;
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
  }, /*#__PURE__*/React.createElement("b", null, label), Object.keys(facet.values).map(function (value) {
    return /*#__PURE__*/React.createElement(Child, {
      key: value,
      value: value,
      count: facet.values[value]
    });
  }));
}