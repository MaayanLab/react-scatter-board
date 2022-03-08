import _extends from "@babel/runtime/helpers/extends";
import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _slicedToArray from "@babel/runtime/helpers/slicedToArray";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

import React from 'react';
import * as THREE from 'three';
import { shapes, useShapeMaterial } from '../shapes';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
export default function THREEScatterPlot(_ref) {
  var name = _ref.name,
      scale = _ref.scale,
      is3d = _ref.is3d,
      data = _ref.data,
      meta = _ref.meta;
  var pointsRef = React.useRef();

  var _React$useState = React.useState({}),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      pointsProps = _React$useState2[0],
      setPointsProps = _React$useState2[1];

  var shapeMaterials = useShapeMaterial();
  React.useEffect(function () {
    if (data.length === 0 || meta.length === 0) {
      setPointsProps({});
      return;
    }

    var groups = {};
    var color = new THREE.Color();
    var pointScale = 10 * scale / Math.log10(scale) / Math.log10(data.length) / Math.log(8) / (is3d ? 15 : 1);

    for (var i = 0; i < data.length; i++) {
      var d = _objectSpread(_objectSpread({}, data[i]), meta[i]);

      var shape = void 0;

      if (!(d.shape in shapes)) {
        console.warn("Invalid shape: ".concat(d.shape));
        shape = 'circle';
      } else {
        shape = d.shape;
      }

      if (!(shape in groups)) groups[shape] = {
        n: 0,
        index: [],
        labels: [],
        positions: [],
        colors: [],
        sizes: []
      };
      groups[shape].index.push(i);
      groups[shape].labels.push(d.label);
      groups[shape].positions.push(d.x);
      groups[shape].positions.push(d.y);
      groups[shape].positions.push(is3d ? d.z : 0);
      color.set(d.color || '#002288');
      groups[shape].colors.push(color.r);
      groups[shape].colors.push(color.g);
      groups[shape].colors.push(color.b);
      groups[shape].colors.push(d.opacity);
      groups[shape].sizes.push(pointScale * (d.size || 1));
      groups[shape].n++;
    }

    var geometries = [];
    var materials = [];
    var index = [];
    var labels = [];

    for (var _shape in groups) {
      var geometry = new THREE.BufferGeometry();
      index.push.apply(index, _toConsumableArray(groups[_shape].index));
      labels.push.apply(labels, _toConsumableArray(groups[_shape].labels));
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(groups[_shape].positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(groups[_shape].colors, 4));
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(groups[_shape].sizes, 1));
      geometry.computeBoundingSphere();
      geometries.push(geometry);
      materials.push(shapeMaterials[_shape]);
    }

    var mergedGeometries = BufferGeometryUtils.mergeBufferGeometries(geometries, true);
    mergedGeometries.userData.index = index;
    mergedGeometries.userData.labels = labels;
    mergedGeometries.dynamic = true;
    setPointsProps({
      geometry: mergedGeometries,
      material: materials
    });
  }, [is3d, data]);
  React.useEffect(function () {
    if (!pointsRef || !pointsRef.current || !meta || meta.length === 0 || pointsRef.current.geometry === undefined || pointsRef.current.geometry.attributes === undefined || !('color' in pointsRef.current.geometry.attributes)) return;
    var geom = pointsRef.current.geometry;
    var pointScale = 10 * scale / Math.log10(scale) / Math.log10(data.length) / Math.log(8) / (is3d ? 15 : 1);
    var color = new THREE.Color();

    for (var i = 0; i < geom.userData.index.length; i++) {
      var j = geom.userData.index[i];

      var d = _objectSpread(_objectSpread({}, data[j]), meta[j]);

      color.set(d.color || '#002288');
      color.convertSRGBToLinear();
      geom.attributes.color.array[i * 4 + 0] = color.r;
      geom.attributes.color.array[i * 4 + 1] = color.g;
      geom.attributes.color.array[i * 4 + 2] = color.b;
      geom.attributes.color.array[i * 4 + 3] = d.opacity;
      geom.attributes.size.array[i] = pointScale * (d.size || 1);
    }

    geom.attributes.color.needsUpdate = true;
    geom.attributes.size.needsUpdate = true;
  }, [pointsRef.current, scale, meta]);
  return /*#__PURE__*/React.createElement("points", _extends({
    ref: pointsRef,
    name: name
  }, pointsProps));
}