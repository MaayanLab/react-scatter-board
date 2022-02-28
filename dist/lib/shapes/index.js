import _extends from "@babel/runtime/helpers/extends";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _objectWithoutProperties from "@babel/runtime/helpers/objectWithoutProperties";
import _typeof from "@babel/runtime/helpers/typeof";
var _excluded = ["style"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

import React from 'react';
import circle from './circle.png';
import cross from './cross.png';
import diamond from './diamond.png';
import square from './square.png';
import star from './star.png';
import triangle from './triangle.png';
import wye from './wye.png';
var rcs = {
  circle: circle,
  cross: cross,
  diamond: diamond,
  square: square,
  star: star,
  triangle: triangle,
  wye: wye
};

function extractSrc(mod) {
  if (_typeof(mod) === 'object' && 'src' in mod) {
    return mod.src;
  } else if (typeof mod === 'string') {
    return mod;
  } else {
    throw new Error("Unrecognized image type: ".concat(JSON.stringify(mod)));
  }
}

function ImageFactory(src) {
  function Image(_ref) {
    var style = _ref.style,
        props = _objectWithoutProperties(_ref, _excluded);

    return /*#__PURE__*/React.createElement("img", _extends({
      src: src,
      style: _objectSpread({
        filter: 'invert(100%)'
      }, style)
    }, props));
  }

  return Image;
}

export var shapes = {};

for (var shape in rcs) {
  shapes[shape] = ImageFactory(extractSrc(rcs[shape]));
}

import { useAsset } from 'use-asset';
import loadMaterial from '../loaders/loadMaterial';
export function useShapeMaterial() {
  var materials = {};

  for (var _shape in rcs) {
    materials[_shape] = useAsset(loadMaterial, extractSrc(rcs[_shape]));
  }

  return materials;
}