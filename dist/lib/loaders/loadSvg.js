import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
/*
 * We load the geometry from an SVG -- only works if
 *  there is only one.
 */

export default function loadSvgSingularGeometry(_x) {
  return _loadSvgSingularGeometry.apply(this, arguments);
}

function _loadSvgSingularGeometry() {
  _loadSvgSingularGeometry = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(src) {
    var data, width, height, viewBox, _viewBox$split, _viewBox$split2, _left, _top, _right, _bottom, _width, _height, _width2, _height2, paths, i, svgShapes, j, geometry;

    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return new Promise( /*#__PURE__*/function () {
              var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(resolve, reject) {
                var loader;
                return _regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        loader = new SVGLoader();
                        _context.t0 = loader;

                        if (!(typeof src === 'function')) {
                          _context.next = 8;
                          break;
                        }

                        _context.next = 5;
                        return src();

                      case 5:
                        _context.t1 = _context.sent;
                        _context.next = 9;
                        break;

                      case 8:
                        _context.t1 = src;

                      case 9:
                        _context.t2 = _context.t1;
                        _context.t3 = resolve;
                        _context.t4 = reject;

                        _context.t0.load.call(_context.t0, _context.t2, _context.t3, _context.t4);

                      case 13:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x2, _x3) {
                return _ref.apply(this, arguments);
              };
            }());

          case 2:
            data = _context2.sent;
            width = 1, height = 1;
            viewBox = data.xml.getAttribute('viewBox');

            if (viewBox !== null) {
              _viewBox$split = viewBox.split(' '), _viewBox$split2 = _slicedToArray(_viewBox$split, 4), _left = _viewBox$split2[0], _top = _viewBox$split2[1], _right = _viewBox$split2[2], _bottom = _viewBox$split2[3];
              _width = _right - _left | 0;
              if (_width > 0) width = _width;
              _height = _bottom - _top | 0;
              if (_height > 0) height = _height;
            } else {
              _width2 = data.xml.getAttribute('width') | 0;
              if (_width2 > 0) width = _width2;
              _height2 = data.xml.getAttribute('height') | 0;
              if (_height2 > 0) height = _height2;
            }

            paths = data.paths;

            if (!(paths.length !== 1)) {
              _context2.next = 9;
              break;
            }

            throw new Error('NotSupported');

          case 9:
            i = 0;

          case 10:
            if (!(i < paths.length)) {
              _context2.next = 24;
              break;
            }

            svgShapes = SVGLoader.createShapes(paths[i]);

            if (!(svgShapes.length !== 1)) {
              _context2.next = 14;
              break;
            }

            throw new Error('NotSupported');

          case 14:
            j = 0;

          case 15:
            if (!(j < svgShapes.length)) {
              _context2.next = 21;
              break;
            }

            geometry = new THREE.ShapeGeometry(svgShapes[j]);
            return _context2.abrupt("return", {
              geometry: geometry,
              scale: [1 / width, 1 / height, 1]
            });

          case 18:
            j++;
            _context2.next = 15;
            break;

          case 21:
            i++;
            _context2.next = 10;
            break;

          case 24:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _loadSvgSingularGeometry.apply(this, arguments);
}