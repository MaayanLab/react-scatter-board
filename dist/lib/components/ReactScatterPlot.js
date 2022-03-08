import React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { GizmoHelper, GizmoViewport, MapControls, OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import useDataDimensions from '../hooks/useDataDimensions';
var THREEFog = /*#__PURE__*/React.lazy(function () {
  return new Promise(function (resolve) {
    (function () {
      resolve(require('./THREEFog'));
    })();
  });
});
var THREEScatterPlot = /*#__PURE__*/React.lazy(function () {
  return new Promise(function (resolve) {
    (function () {
      resolve(require('./THREEScatterPlot'));
    })();
  });
});
var THREEScatterPlotTooltip = /*#__PURE__*/React.lazy(function () {
  return new Promise(function (resolve) {
    (function () {
      resolve(require('./THREEScatterPlotTooltip'));
    })();
  });
});
var THREERef = /*#__PURE__*/React.forwardRef(function (_props, ref) {
  ref.current = useThree();
  return null;
});
var ReactScatterPlot = /*#__PURE__*/React.forwardRef(function (_ref, ref) {
  var is3d = _ref.is3d,
      scale = _ref.scale,
      data = _ref.data,
      meta = _ref.meta;

  var _useDataDimensions = useDataDimensions({
    is3d: is3d,
    data: data
  }),
      center = _useDataDimensions.center,
      size = _useDataDimensions.size;

  if (scale === undefined) scale = Math.max(size.x, size.y, size.z);
  return /*#__PURE__*/React.createElement(Canvas, null, /*#__PURE__*/React.createElement(THREERef, {
    ref: ref
  }), /*#__PURE__*/React.createElement(THREEScatterPlot, {
    name: "three-scatter-points",
    is3d: is3d,
    scale: scale,
    data: data,
    meta: meta
  }), /*#__PURE__*/React.createElement(THREEScatterPlotTooltip, {
    name: "three-closest-point-controller",
    points: "three-scatter-points",
    is3d: is3d
  }), is3d ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(THREEFog, {
    color: "#ffffff",
    near: 0,
    far: 2 * Math.max(size.x, size.y, size.z)
  }), /*#__PURE__*/React.createElement(PerspectiveCamera, {
    makeDefault: true,
    fov: 90,
    position: center,
    near: 0.01,
    far: 10 * Math.max(size.x, size.y, size.z),
    zoom: 1
  }), /*#__PURE__*/React.createElement(OrbitControls, {
    enableZoom: true,
    enableDamping: true,
    dampingFactor: 0.25,
    screenSpacePanning: true
  }), /*#__PURE__*/React.createElement(GizmoHelper, {
    alignment: "bottom-right" // widget alignment within scene
    ,
    margin: [80, 80] // widget margins (X, Y)
    ,
    onTarget: function onTarget(evt) {
      return center;
    }
  }, /*#__PURE__*/React.createElement(GizmoViewport, {
    axisColors: ['#ff8888', '#88ff88', '#8888ff'],
    labelColor: "black"
  }))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(OrthographicCamera, {
    makeDefault: true,
    position: center,
    up: [0, 0, 1],
    near: 0.01,
    far: 100,
    zoom: 25
  }), /*#__PURE__*/React.createElement(MapControls, {
    enableZoom: true,
    enableDamping: true,
    dampingFactor: 0.25,
    screenSpacePanning: true,
    maxPolarAngle: 0,
    minPolarAngle: 0
  })));
});
export default ReactScatterPlot;