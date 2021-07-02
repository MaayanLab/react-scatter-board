import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'

/*
 * We load the geometry from an SVG -- only works if
 *  there is only one.
 */
export default function loadSvgSingularGeometry(src) {
  return new Promise((resolve, reject) => {
    const loader = new SVGLoader()
    loader.load(
      src,
      data => {
        let width = 1, height = 1
        const viewBox = data.xml.getAttribute('viewBox')
        if (viewBox !== null) {
          const [_left, _top, _right, _bottom] = viewBox.split(' ')
          const _width = (_right - _left)|0
          if (_width > 0) width = _width
          const _height = (_bottom - _top)|0
          if (_height > 0) height = _height
        } else {
          const _width = data.xml.getAttribute('width')|0
          if (_width > 0) width = _width
          const _height = data.xml.getAttribute('height')|0
          if (_height > 0) height = _height
        }
        const paths = data.paths
        if (paths.length !== 1) throw new Error('NotSupported')
        for (let i = 0; i < paths.length; i++) {
          const svgShapes = SVGLoader.createShapes(paths[i])
          if (svgShapes.length !== 1) throw new Error('NotSupported')
          for (let j = 0; j < svgShapes.length; j++) {
            const geometry = new THREE.ShapeGeometry(svgShapes[j])
            resolve({
              geometry,
              scale: [1 / width, 1 / height, 1],
            })
          }
        }
      },
      _ => { },
      err => reject(err)
    )
  })
}