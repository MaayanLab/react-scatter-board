import React from 'react'; // shapes as react components

export var shapes = {
  circle: /*#__PURE__*/React.lazy(function () {
    return new Promise(function (resolve) {
      (function () {
        resolve(require('./circle.svg?svgr'));
      })();
    });
  }),
  cross: /*#__PURE__*/React.lazy(function () {
    return new Promise(function (resolve) {
      (function () {
        resolve(require('./cross.svg?svgr'));
      })();
    });
  }),
  diamond: /*#__PURE__*/React.lazy(function () {
    return new Promise(function (resolve) {
      (function () {
        resolve(require('./diamond.svg?svgr'));
      })();
    });
  }),
  square: /*#__PURE__*/React.lazy(function () {
    return new Promise(function (resolve) {
      (function () {
        resolve(require('./square.svg?svgr'));
      })();
    });
  }),
  star: /*#__PURE__*/React.lazy(function () {
    return new Promise(function (resolve) {
      (function () {
        resolve(require('./star.svg?svgr'));
      })();
    });
  }),
  triangle: /*#__PURE__*/React.lazy(function () {
    return new Promise(function (resolve) {
      (function () {
        resolve(require('./triangle.svg?svgr'));
      })();
    });
  }),
  wye: /*#__PURE__*/React.lazy(function () {
    return new Promise(function (resolve) {
      (function () {
        resolve(require('./wye.svg?svgr'));
      })();
    });
  })
};
import { useAsset } from 'use-asset';
import loadMaterial from '../loaders/loadMaterial';
export function useShapeMaterial() {
  return {
    circle: useAsset(loadMaterial, require('./circle.png')["default"]),
    cross: useAsset(loadMaterial, require('./cross.png')["default"]),
    diamond: useAsset(loadMaterial, require('./diamond.png')["default"]),
    square: useAsset(loadMaterial, require('./square.png')["default"]),
    star: useAsset(loadMaterial, require('./star.png')["default"]),
    triangle: useAsset(loadMaterial, require('./triangle.png')["default"]),
    wye: useAsset(loadMaterial, require('./wye.png')["default"])
  };
}