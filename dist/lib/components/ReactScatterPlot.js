import React, { useEffect } from 'react';
import * as THREE from 'three';
import EventEmitter from 'events';
import { Canvas, useThree } from '@react-three/fiber';
import { GizmoHelper, GizmoViewport, MapControls, OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import useDataDimensions from '../hooks/useDataDimensions';
import useFrameSlow from '../hooks/useFrameSlow';
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
var THREERef = /*#__PURE__*/React.forwardRef(function (_ref, ref) {
  var is3d = _ref.is3d,
      points = _ref.points,
      onClick = _ref.onClick,
      onHover = _ref.onHover;
  ref.current = {
    three: useThree(),
    events: new EventEmitter(),
    closestPoint: undefined
  }; // maintain closestPoint

  var point3 = new THREE.Vector3();
  var point2 = new THREE.Vector2();
  useFrameSlow(0.1, function (_ref2, delta) {
    var scene = _ref2.scene,
        camera = _ref2.camera,
        mouse = _ref2.mouse;
    // get relevant nodes from scene
    var pointsNode = scene.getObjectByName(points);
    if (pointsNode === undefined) return;
    if (pointsNode.geometry === undefined || pointsNode.geometry.attributes === undefined || !('position' in pointsNode.geometry.attributes)) return; // actually test points

    var pointPositions = pointsNode.geometry.attributes.position.array;
    var closestPoint = undefined;
    var closestDist = undefined;
    var i = 0;

    while (pointPositions[i] !== undefined) {
      var pointIndex = i / 3 | 0;
      var _ref3 = [pointPositions[i++], pointPositions[i++], pointPositions[i++]],
          x = _ref3[0],
          y = _ref3[1],
          z = _ref3[2];
      point3.set(x, y, z);
      point3.project(camera);
      point2.set(point3.x, point3.y);
      var dist = point2.distanceToSquared(mouse);

      if (dist < Math.min(1.0, 1 / (camera.zoom * camera.zoom * (is3d ? 25 : 1))) && (closestDist === undefined || dist < closestDist)) {
        closestPoint = {
          index: pointIndex,
          label: pointsNode.geometry.userData.labels[pointIndex],
          x: x,
          y: y,
          z: z
        };
        closestDist = dist;
      }
    } // update


    if ((ref.current.closestPoint || {}).index !== (closestPoint || {}).index) {
      ref.current.closestPoint = closestPoint;
      ref.current.events.emit('hover', closestPoint);
    }
  });
  useEffect(function () {
    if (onHover === undefined) return;
    ref.current.events.on('hover', onHover);
    return function () {
      ref.current.events.off('hover', onHover);
    };
  }, [onHover]);
  useEffect(function () {
    if (onClick === undefined) return;
    ref.current.events.on('click', onClick);
    return function () {
      ref.current.events.off('click', onClick);
    };
  }, [onClick]);
  return null;
});
var ReactScatterPlot = /*#__PURE__*/React.forwardRef(function (_ref4, ref) {
  var is3d = _ref4.is3d,
      scale = _ref4.scale,
      data = _ref4.data,
      meta = _ref4.meta,
      onHover = _ref4.onHover,
      onClick = _ref4.onClick;

  var _useDataDimensions = useDataDimensions({
    is3d: is3d,
    data: data
  }),
      center = _useDataDimensions.center,
      size = _useDataDimensions.size;

  if (scale === undefined) scale = Math.max(size.x, size.y, size.z);
  return /*#__PURE__*/React.createElement(Canvas, null, /*#__PURE__*/React.createElement(THREERef, {
    ref: ref,
    points: "three-scatter-points",
    is3d: is3d,
    onClick: onClick,
    onHover: onHover
  }), /*#__PURE__*/React.createElement(THREEScatterPlot, {
    name: "three-scatter-points",
    is3d: is3d,
    scale: scale,
    data: data,
    meta: meta,
    onClick: function onClick(evt) {
      evt.stopPropagation();
      ref.current.events.emit('click', ref.current.closestPoint);
    }
  }), /*#__PURE__*/React.createElement(THREEScatterPlotTooltip, {
    threeRef: ref,
    name: "three-closest-point-controller"
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