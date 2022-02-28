import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import * as THREE from 'three'; // some magic to keep textures facing the camera
// this lets us use merged point geometries since we
//  no longer have to worry about rotating the drawing
//  to face the camera

export default function loadMaterial(_x) {
  return _loadMaterial.apply(this, arguments);
}

function _loadMaterial() {
  _loadMaterial = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(src) {
    var texture, material;
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
                        loader = new THREE.TextureLoader();
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
            texture = _context2.sent;
            material = new THREE.PointsMaterial({
              alphaMap: texture,
              vertexColors: true,
              transparent: true
            }); // patch the pointMaterial fragment shader to use per-point opacity

            material.onBeforeCompile = function (shader, renderer) {
              shader.fragmentShader = shader.fragmentShader.replace('	#include <alphatest_fragment>', [
              /* Do alphatest (0.99) directly on texture to eliminate white outline */
              '	#include <alphatest_fragment>', '	if (texture2D( alphaMap, uv ).g < 0.5) discard;'].join('\n'));
              shader.vertexShader = shader.vertexShader.replace('uniform float size', 'attribute float size');
            };

            return _context2.abrupt("return", material);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _loadMaterial.apply(this, arguments);
}