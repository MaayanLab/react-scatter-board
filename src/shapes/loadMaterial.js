import * as THREE from 'three'

// some magic to keep textures facing the camera
// this lets us use merged point geometries since we
//  no longer have to worry about rotating the drawing
//  to face the camera
export default async function loadMaterial(src) {
  const texture = await new Promise(async (resolve, reject) => {
    const loader = new THREE.TextureLoader()
    loader.load(typeof src === 'function' ? (await src()) : src, resolve, reject)
  })
  const material = new THREE.PointsMaterial({
    alphaMap: texture,
    vertexColors: true,
    transparent: true,
  })
  // patch the pointMaterial fragment shader to use per-point opacity
  material.onBeforeCompile = (shader, renderer) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '	#include <alphatest_fragment>',
      [ /* Do alphatest (0.99) directly on texture to eliminate white outline */
        '	#include <alphatest_fragment>',
        '	if (texture2D( alphaMap, uv ).g < 0.9) discard;',
      ].join('\n'),
    )
  }
  return material
}
