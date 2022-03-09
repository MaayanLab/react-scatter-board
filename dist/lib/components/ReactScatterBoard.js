import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _slicedToArray from "@babel/runtime/helpers/slicedToArray";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

import React from 'react';
import Suspense from './Suspense';
import { shapes } from '../shapes';
import computeFacets from '../utils/computeFacets';
import objectFilter from '../utils/objectFilter';
import html2canvas from 'html2canvas';
var ReactScatterPlot = /*#__PURE__*/React.lazy(function () {
  return new Promise(function (resolve) {
    (function () {
      resolve(require('./ReactScatterPlot'));
    })();
  });
});
var ReactColorbar = /*#__PURE__*/React.lazy(function () {
  return new Promise(function (resolve) {
    (function () {
      resolve(require('./ReactColorbar'));
    })();
  });
});
var ReactLegend = /*#__PURE__*/React.lazy(function () {
  return new Promise(function (resolve) {
    (function () {
      resolve(require('./ReactLegend'));
    })();
  });
});
var ReactSelect = /*#__PURE__*/React.lazy(function () {
  return new Promise(function (resolve) {
    (function () {
      resolve(require('./ReactSelect'));
    })();
  });
});
var ReactSwitch = /*#__PURE__*/React.lazy(function () {
  return new Promise(function (resolve) {
    (function () {
      resolve(require('./ReactSwitch'));
    })();
  });
});
var ReactGroupSelect = /*#__PURE__*/React.lazy(function () {
  return new Promise(function (resolve) {
    (function () {
      resolve(require('./ReactGroupSelect'));
    })();
  });
});
export default function ReactScatterBoard(_ref) {
  var data = _ref.data,
      init3d = _ref.is3d,
      toggle3d = _ref.toggle3d,
      initFacets = _ref.facets,
      initShapeKey = _ref.shapeKey,
      shapeKeys = _ref.shapeKeys,
      initColorKey = _ref.colorKey,
      colorKeys = _ref.colorKeys,
      initLabelKeys = _ref.labelKeys,
      initSearchKeys = _ref.searchKeys,
      initSelectValue = _ref.selectValue,
      scale = _ref.scale,
      _ref$defaultColor = _ref.defaultColor,
      defaultColor = _ref$defaultColor === void 0 ? '#002288' : _ref$defaultColor;
  var threeRef = React.useRef();
  var scatterboardRef = React.useRef();
  if (toggle3d === undefined) toggle3d = init3d;

  var _React$useState = React.useState(initFacets || {}),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      facets = _React$useState2[0],
      setFacets = _React$useState2[1];

  React.useEffect(function () {
    if (initFacets === undefined) setFacets(computeFacets(data));else setFacets(initFacets);
  }, [data, initFacets]);

  var _React$useState3 = React.useState(init3d === true),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      is3d = _React$useState4[0],
      setIs3d = _React$useState4[1];

  React.useEffect(function () {
    if (init3d === undefined) setIs3d(false);else setIs3d(init3d);
  }, [init3d]);

  var _React$useState5 = React.useState(initShapeKey),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      shapeKey = _React$useState6[0],
      setShapeKey = _React$useState6[1];

  var shapeFacets = React.useMemo(function () {
    return objectFilter(facets, function (facet, k) {
      return facet.shapeScale !== undefined && (shapeKeys === undefined || shapeKeys.indexOf(k) !== -1);
    });
  }, [facets, shapeKeys]);

  var _React$useState7 = React.useState(initColorKey),
      _React$useState8 = _slicedToArray(_React$useState7, 2),
      colorKey = _React$useState8[0],
      setColorKey = _React$useState8[1];

  var colorFacets = React.useMemo(function () {
    return objectFilter(facets, function (facet, k) {
      return facet.colorScale !== undefined && (colorKeys === undefined || colorKeys.indexOf(k) !== -1);
    });
  }, [facets, colorKeys]);

  var _React$useState9 = React.useState([]),
      _React$useState10 = _slicedToArray(_React$useState9, 2),
      labelKeys = _React$useState10[0],
      setLabelKeys = _React$useState10[1];

  React.useEffect(function () {
    if (initLabelKeys === undefined) setLabelKeys(Object.keys(facets));else setLabelKeys(initLabelKeys);
  }, [initLabelKeys, facets]);

  var _React$useState11 = React.useState(initSelectValue),
      _React$useState12 = _slicedToArray(_React$useState11, 2),
      selectValue = _React$useState12[0],
      setSelectValue = _React$useState12[1];

  var _React$useState13 = React.useState([]),
      _React$useState14 = _slicedToArray(_React$useState13, 2),
      searchKeys = _React$useState14[0],
      setSearchKeys = _React$useState14[1];

  React.useEffect(function () {
    if (initSearchKeys === undefined) setSearchKeys(Object.keys(facets).filter(function (facet) {
      return Object.keys(facets[facet].values).length > 1 && Object.keys(facets[facet].values).length <= 10;
    }));else setSearchKeys(initSearchKeys);
  }, [initSearchKeys, facets]);
  var searchFacets = React.useMemo(function () {
    return (searchKeys || []).reduce(function (F, searchKey) {
      return facets[searchKey] !== undefined ? _objectSpread(_objectSpread({}, F), {}, _defineProperty({}, searchKey, facets[searchKey])) : F;
    }, {});
  }, [facets, searchKeys]);
  var meta = React.useMemo(function () {
    return data.map(function (_datum) {
      var datum = {};

      if (_datum.opacity !== undefined) {
        datum.opacity = _datum.opacity;
      } else if (is3d === false) {
        datum.opacity = 1.0;
      } else {
        datum.opacity = 0.8;
      }

      datum.label = (labelKeys || []).filter(function (labelKey) {
        return _datum[labelKey] !== undefined && _datum[labelKey] !== null && (typeof _datum[labelKey] !== 'number' || !isNaN(_datum[labelKey]));
      }).map(function (labelKey) {
        return "".concat(labelKey, ": ").concat(_datum[labelKey]);
      }).join('\n');

      if (shapeKey !== undefined && shapeKey in _datum && shapeKey in facets && 'shapeScale' in facets[shapeKey]) {
        datum.shape = facets[shapeKey].shapeScale(_datum[shapeKey]);
      } else {
        datum.shape = 'circle';
      }

      if (colorKey !== undefined && colorKey in _datum && colorKey in facets && 'colorScale' in facets[colorKey]) {
        datum.color = facets[colorKey].colorScale(_datum[colorKey]);
      } else {
        datum.color = defaultColor;
      }

      if (datum.size === undefined) {
        datum.size = 1.;
      }

      if (selectValue !== undefined && _datum[selectValue.key] == selectValue.value) {
        datum.size = datum.size * 2.5;
      } else if (_datum[colorKey] !== undefined) {
        datum.size = datum.size * 2;
      } else {
        datum.size = datum.size * 0.5;
      }

      return datum;
    });
  }, [data, is3d, facets, shapeKey, colorKey, selectValue, labelKeys]);
  return /*#__PURE__*/React.createElement("div", {
    ref: scatterboardRef,
    style: {
      flex: '1 1 auto',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(Suspense, null, /*#__PURE__*/React.createElement(ReactScatterPlot, {
    ref: threeRef,
    is3d: is3d,
    scale: scale,
    data: data,
    meta: meta
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: 1,
      width: '100%',
      height: '100%',
      display: 'flex',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, shapeKey !== undefined && shapeKey in shapeFacets ? /*#__PURE__*/React.createElement(Suspense, null, /*#__PURE__*/React.createElement(ReactLegend, {
    label: "Shape",
    facet: shapeFacets[shapeKey]
  }, function (_ref2) {
    var value = _ref2.value,
        count = _ref2.count;
    var Shape = shapes[shapeFacets[shapeKey].shapeScale(value)];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(Shape, {
      width: 32,
      height: 32
    }), /*#__PURE__*/React.createElement("span", null, "\xA0", value, "\xA0 (", count, ")"));
  })) : null, colorKey !== undefined && colorKey in colorFacets ? /*#__PURE__*/React.createElement(Suspense, null, 'colorbar' in colorFacets[colorKey] ? /*#__PURE__*/React.createElement(ReactColorbar, {
    label: "Color",
    facet: colorFacets[colorKey]
  }) : /*#__PURE__*/React.createElement(ReactLegend, {
    label: "Color",
    facet: colorFacets[colorKey]
  }, function (_ref3) {
    var value = _ref3.value,
        count = _ref3.count;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 16,
        height: 16,
        backgroundColor: colorFacets[colorKey].colorScale(value)
      }
    }, "\xA0"), "\xA0", /*#__PURE__*/React.createElement("span", null, value, "\xA0 (", count, ")"));
  })) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 auto'
    }
  }, "\xA0"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement(Suspense, null, Object.keys(shapeFacets).length > 0 ? /*#__PURE__*/React.createElement(ReactSelect, {
    label: "Shape By...",
    facets: shapeFacets,
    current: shapeKey in shapeFacets ? shapeKey : undefined,
    onChange: function onChange(_ref4) {
      var value = _ref4.value;
      return setShapeKey(value);
    }
  }) : null, Object.keys(colorFacets).length > 0 ? /*#__PURE__*/React.createElement(ReactSelect, {
    label: "Color By...",
    facets: colorFacets,
    current: colorKey in colorFacets ? colorKey : undefined,
    onChange: function onChange(_ref5) {
      var value = _ref5.value;
      return setColorKey(value);
    }
  }) : null, searchKeys.length > 0 ? /*#__PURE__*/React.createElement(ReactGroupSelect, {
    label: "Search...",
    facets: searchFacets,
    current: selectValue,
    onChange: function onChange(evt) {
      return setSelectValue(evt);
    }
  }) : null, toggle3d ? /*#__PURE__*/React.createElement(ReactSwitch, {
    off: "2D",
    on: "3D",
    current: is3d,
    onChange: function onChange(value) {
      return setIs3d(value);
    }
  }) : null, data && data.length > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      margin: 10,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      border: 0,
      backgroundColor: 'inherit',
      pointerEvents: 'auto',
      cursor: 'pointer',
      color: '#0088aa'
    },
    onClick: function onClick() {
      threeRef.current.gl.domElement.getContext('webgl', {
        preserveDrawingBuffer: true
      });
      threeRef.current.gl.render(threeRef.current.scene, threeRef.current.camera);
      html2canvas(scatterboardRef.current).then(function (canvas) {
        var a = document.createElement('a');
        a.href = canvas.toDataURL();
        a.download = 'canvas.png';
        a.click();
      }, 'image/png', 1.0);
      threeRef.current.gl.domElement.getContext('webgl', {
        preserveDrawingBuffer: false
      });
    }
  }, "Download as PNG")) : null))));
}