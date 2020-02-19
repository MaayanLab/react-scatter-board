import React from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import _ from 'underscore'
import { Texture, symbolTypes } from './texture'
import * as utils from './utils'
import { ScatterData, ScatterDataSubset } from './ScatterData.js'
import PropTypes from 'prop-types'

class PointsGeometry {
  constructor(args) {
    this.model = args.model
    this.geometry = null

    this.createGeometry()
  }

  createGeometry() {
    const geometry = new THREE.BufferGeometry()

    const model = this.model

    geometry.setIndex(new THREE.BufferAttribute(model.indices, 1))
    geometry.addAttribute(
      'position',
      new THREE.BufferAttribute(model.positions, 3)
    )
    // this is used for tracking the original orders of the data objects in the entire ScatterData
    geometry.userData = { index: model.getAttr('index') }

    geometry.computeBoundingSphere()

    this.geometry = geometry
  }
}

/**
 * The 3d canvas view underyling the scatterBoard
 */
export class Scatter3dView extends React.Component {
  constructor(props) {
    super(props)
    const is3d = this.props.is3d
    this.state = {
      isLoading: false,
      isLoaded: false,
      url: this.props.url,
      data: this.props.data,
      model: null,
      WIDTH: this.props.width || 1400,
      HEIGHT: this.props.height || 800,
      DPR: this.props.DPR || 2,
      labelKeys: this.props.labelKeys, // which metaKey to use as labels
      colorKey: this.props.colorKey, // which metaKey to use as colors
      shapeKey: this.props.shapeKey,
      pointSize: is3d ? 0.5 : 12, // the size of the points
      is3d: is3d, // 3d or 2d
      colorScale: this.props.colorScale,
      shapeScale: this.props.shapeScale,
      shapeLabels: this.props.shapeLabels
    }
    // events
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onClick = this.onClick.bind(this)
  }

  componentDidMount() {
    // fetch data from url
    if (this.props.url) {
      // url is given
      this.setState({ isLoading: true })
      fetch(this.props.url)
        .then(response => {
          if (response.ok) {
            return response.json()
          } else {
            throw new Error('Something went wrong when fetching data ...')
          }
        })
        .then(data => {
          this.setState({
            data: data,
            model: new ScatterData(data), // init model
            isLoading: false,
            isLoaded: true
          })
          this.makeMaterial()
          this.setUpStage()
          this.shapeBy(this.state.shapeKey)
          this.renderScatter()
        })
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!this.props.url) {
      // only trigger rendering when url is not set directly to prop
      // data is set via parent compoent
      if (
        prevState.data === null &&
        prevProps.data === null &&
        this.props.data !== null &&
        this.state.data === null
      ) {
        this.makeMaterial()
        this.setUpStage()
      } else if (this.props.data !== null && this.props.shapeScale !== null) {
        this.shapeBy(this.props.shapeKey) // will update state shapeScale etc.
        this.renderScatter()
        if (this.state.is3d) {
          this.startAnimate()
        } else {
          // sometimes the canvas doesn't show
          setTimeout(() => this.renderScatter(), 500)
        }
      } else if (this.props.colorKey !== prevProps.colorKey) {
        // colorKey changed through parent state passed as prop
        this.renderScatter()
      }
    }
  }
  componentWillUnmount() {
    if (this.animateId) {
      this.stopAnimate()
    }
  }

  render() {
    return (
      <div
        ref={ref => (this.mount = ref)}
        onMouseMove={e => this.onMouseMove(e)}
        onClick={e => this.onClick(e)}
      />
    )
  }

  setUpStage() {
    // set up THREE.js visualization components
    const { WIDTH, HEIGHT, DPR } = this.state
    const aspectRatio = WIDTH / HEIGHT

    // set up scene, camera, renderer
    const scene = new THREE.Scene()
    // set the id for this object
    this.id = scene.uuid

    const renderer = new THREE.WebGLRenderer()
    renderer.setClearColor(0xffffff)
    renderer.setPixelRatio(DPR)
    renderer.setSize(WIDTH, HEIGHT)

    // 2d
    const ORTHO_CAMERA_FRUSTUM_HALF_EXTENT = 10.5
    let left = -ORTHO_CAMERA_FRUSTUM_HALF_EXTENT
    let right = ORTHO_CAMERA_FRUSTUM_HALF_EXTENT
    let bottom = -ORTHO_CAMERA_FRUSTUM_HALF_EXTENT
    let top = ORTHO_CAMERA_FRUSTUM_HALF_EXTENT
    // Scale up the larger of (w, h) to match the aspect ratio.
    if (aspectRatio > 1) {
      left *= aspectRatio
      right *= aspectRatio
    } else {
      top /= aspectRatio
      bottom /= aspectRatio
    }
    let camera = new THREE.OrthographicCamera(
      left,
      right,
      top,
      bottom,
      -1000,
      1000
    )
    if (this.state.is3d) {
      camera = new THREE.PerspectiveCamera(70, aspectRatio, 0.01, 1000000)
      camera.position.z = 30
    }

    // Put the renderer's DOM into the container
    renderer.domElement.id = 'renderer-' + this.id
    this.mount.appendChild(renderer.domElement)

    // set up orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)

    controls.enableZoom = true
    controls.screenSpacePanning = true

    if (!this.state.is3d) {
      controls.enableRotate = false
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.RIGHT,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.LEFT
      }
    }

    controls.addEventListener('change', e => {
      this.renderScatter()
    })
    // set up raycaster, mouse
    const raycaster = new THREE.Raycaster()

    if (this.state.raycasterThreshold) {
      raycaster.params.Points.threshold = this.raycasterThreshold
    } else {
      if (this.state.is3d) {
        raycaster.params.Points.threshold = this.state.pointSize / 5
      } else {
        raycaster.params.Points.threshold = this.state.pointSize / 50
      }
    }

    const mouse = new THREE.Vector2()

    // bind three js objects to component
    this.scene = scene
    this.renderer = renderer
    this.camera = camera
    this.controls = controls
    this.raycaster = raycaster
    this.mouse = mouse
  }

  onMouseMove(e) {
    const mouse = this.mouse
    const { WIDTH, HEIGHT } = this.state
    mouse.x = (e.nativeEvent.offsetX / WIDTH) * 2 - 1
    mouse.y = -(e.nativeEvent.offsetY / HEIGHT) * 2 + 1
    this.mouse = mouse
    this.renderScatter()
  }

  onClick(evt) {
    this.stopAnimate()
    if (typeof this.props.onClick === 'function') {
      this.props.onClick(evt, this.getPoint())
    }
  }

  makeMaterial() {
    const materials = []
    for (const symbolType of symbolTypes) {
      const textureResult = new Texture(symbolType).load()

      const material = new THREE.PointsMaterial({
        vertexColors: THREE.VertexColors,
        size: this.state.pointSize,
        sizeAttenuation: this.state.is3d,
        map: textureResult,
        alphaTest: 0.2,
        transparent: true,
        opacity: 0.6
      })
      materials.push(material)
    }

    this.materials = materials
  }

  clearScene() {
    const scene = this.scene
    for (const child of scene.children) {
      scene.remove(child)
    }
  }

  shapeBy(metaKey) {
    const model = this.props.model
    const scene = this.scene
    const { scatterDataSubsets } = model.calculateShapeScale(metaKey)

    // Update geometry by merging individual genmetries from each group
    const geometries = []
    for (const key of Object.keys(scatterDataSubsets)) {
      const geometry = new PointsGeometry({
        model: scatterDataSubsets[key]
      })
      geometries.push(geometry.geometry)
    }
    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
    // concat all indices from each geometry
    const arrayOfIndices = geometries.map(g => g.userData.index)
    const indices = arrayOfIndices.reduce((arr1, arr2) => {
      return arr1.concat(arr2)
    })
    let labels = model.getLabels(this.state.labelKeys)
    labels = utils.orderArray(labels, indices)

    mergedGeometry.userData = { index: indices, labels: labels }
    const groupSizes = geometries.map(g => g.index.count)
    // to keep track of the cumulative sums of the group sizes, prepended by -1
    const cumsums = groupSizes.reduce(
      (a, x, i) => [...a, x + (a[i - 1] || 0)],
      []
    )
    cumsums.unshift(-1)

    for (let i = 0; i < geometries.length; i++) {
      mergedGeometry.addGroup(cumsums[i] + 1, groupSizes[i], i)
    }

    const points = new THREE.Points(mergedGeometry, this.materials)
    // clear clouds
    this.clearScene()
    scene.add(points)
    this.points = points

    // set colors
    this.setColors(this.props.colorScale, this.props.colorKey)
  }

  renderScatter() {
    const { is3d } = this.state
    if (is3d) {
      this.renderScatter3d()
    } else {
      this.renderScatter2d()
    }
  }

  renderScatter3d() {
    const { raycaster, mouse, camera, renderer, scene } = this
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera)

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects([this.points])

    // reset colors
    this.resetColors()
    // remove text-label if exists
    const textLabel = document.getElementById('text-label-' + this.id)
    if (textLabel) {
      textLabel.remove()
    }

    // add interactivities if there is intesecting points
    if (intersects.length > 0) {
      // only highlight the closest object
      const intersect = intersects[0]
      const idx = intersect.index
      const geometry = intersect.object.geometry

      // change color of the point
      geometry.attributes.color.needsUpdate = true

      geometry.attributes.color.array[(idx * 3)] = 0.1
      geometry.attributes.color.array[(idx * 3) + 1] = 0.8
      geometry.attributes.color.array[(idx * 3) + 2] = 0.1

      // find the position of the point
      const pointPosition = {
        x: geometry.attributes.position.array[(idx * 3)],
        y: geometry.attributes.position.array[(idx * 3) + 1],
        z: geometry.attributes.position.array[(idx * 3) + 2]
      }
      // add text canvas
      const textCanvas = this.makeTextCanvas(
        geometry.userData.labels[idx],
        pointPosition.x,
        pointPosition.y,
        pointPosition.z,
        this.points.rotation,
        {
          fontsize: 24,
          fontface: 'arial, sans-serif',
          textColor: { r: 0, g: 0, b: 0, a: 0.8 }
        }
      )

      textCanvas.id = 'text-label-' + this.id
      this.mount.appendChild(textCanvas)

      if (typeof this.props.onMouseOver === 'function') {
        const trueIdx = intersect.object.geometry.userData.index[idx]
        const datum = this.props.model.data[trueIdx]
        this.props.onMouseOver(datum)
      }
    }

    renderer.render(scene, camera)
  }

  renderScatter2d() {
    const { raycaster, mouse, camera, renderer, scene } = this
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera)

    // calculate objects intersecting the picking ray
    // const intersects = raycaster.intersectObjects([this.points])
    let closestPoint = undefined
    let closestDist = undefined
    let point = new THREE.Vector3()
    for (const pointIndex of this.points.geometry.index.array) {
      const pointPosition = new THREE.Vector3(
        this.points.geometry.attributes.position.array[pointIndex * 3],
        this.points.geometry.attributes.position.array[pointIndex * 3 + 1],
        this.points.geometry.attributes.position.array[pointIndex * 3 + 2]
      )
      raycaster.ray.closestPointToPoint(pointPosition, point)
      const dist = point.distanceToSquared(pointPosition)
      if (dist < Math.min(1.0, 1/(camera.zoom*camera.zoom)) && (closestDist === undefined || dist < closestDist)) {
        closestPoint = pointIndex
        closestDist = dist
      }
    }

    // reset colors
    this.resetColors()
    // remove text-label if exists
    const textLabel = document.getElementById('text-label-' + this.id)
    if (textLabel) {
      textLabel.remove()
    }

    // add interactivities if there is intesecting points
    if (closestPoint !== undefined) {
      // change color of the point
      this.points.geometry.attributes.color.needsUpdate = true

      this.points.geometry.attributes.color.array[closestPoint * 3] = 0.1
      this.points.geometry.attributes.color.array[closestPoint * 3 + 1] = 0.8
      this.points.geometry.attributes.color.array[closestPoint * 3 + 2] = 0.1

      // find the position of the point
      const pointPosition = {
        x: this.points.geometry.attributes.position.array[closestPoint * 3],
        y: this.points.geometry.attributes.position.array[closestPoint * 3 + 1],
        z: this.points.geometry.attributes.position.array[closestPoint * 3 + 2]
      }
      // add text canvas
      const textCanvas = this.makeTextCanvas(
        this.points.geometry.userData.labels[closestPoint],
        pointPosition.x,
        pointPosition.y,
        pointPosition.z,
        this.points.rotation,
        {
          fontsize: 24,
          fontface: 'arial, sans-serif',
          textColor: { r: 0, g: 0, b: 0, a: 0.8 }
        }
      )

      textCanvas.id = 'text-label-' + this.id
      this.mount.appendChild(textCanvas)

      if (typeof this.props.onMouseOver === 'function') {
        const trueIdx = intersect.object.geometry.userData.index[idx]
        const datum = this.props.model.data[trueIdx]
        this.props.onMouseOver(datum)
      }
    }

    renderer.render(scene, camera)
  }

  makeTextCanvas(message, x, y, z, euler, parameters) {
    if (parameters === undefined) parameters = {}
    const fontface = parameters.hasOwnProperty('fontface')
      ? parameters['fontface']
      : 'arial, sans-serif'
    const fontsize = parameters.hasOwnProperty('fontsize')
      ? parameters['fontsize']
      : 18
    const textColor = parameters.hasOwnProperty('textColor')
      ? parameters['textColor']
      : { r: 0, g: 0, b: 255, a: 0.8 }
    const lineHeight = parameters.hasOwnProperty('lineHeight')
      ? parameters['lineHeight']
      : 20

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    const { WIDTH, HEIGHT } = this.state
    canvas.width = WIDTH
    canvas.height = HEIGHT

    context.font = fontsize + 'px ' + fontface
    context.textBaseline = 'alphabetic'

    context.textAlign = 'left'

    // text color.  Note that we have to do this AFTER the round-rect as it also uses the "fillstyle" of the canvas
    context.fillStyle = utils.getCanvasColor(textColor)

    // calculate the project of 3d point into 2d plain
    const point = new THREE.Vector3(x, y, z).applyEuler(euler)
    const pv = new THREE.Vector3().copy(point).project(this.camera)
    const coords = {
      x: ((pv.x + 1) / 2) * WIDTH, // * this.DPR,
      y: -(((pv.y - 1) / 2) * HEIGHT) // * this.DPR
    }
    // draw the text (in multiple lines)
    const lines = message.split('\n')
    for (let i = 0; i < lines.length; i++) {
      context.fillText(lines[i], coords.x, coords.y + i * lineHeight)
    }

    // styles of canvas element
    canvas.style.left = 0
    canvas.style.top = 0
    canvas.style.position = 'absolute'
    canvas.style.pointerEvents = 'none'

    return canvas
  }

  resetColors() {
    this.setColors(this.props.colorScale, this.props.colorKey)
  }

  setColors(colorScale, metaKey) {
    // Color points by a certain metaKey given colorScale
    const model = this.props.model
    let metas = model.getAttr(metaKey)
    const geometry = this.points.geometry
    const idx = geometry.userData.index
    metas = utils.orderArray(metas, idx)

    const meta = _.findWhere(model.metas, { name: metaKey })
    const dtype = meta.type
    if (dtype !== 'float' && dtype !== 'int' && meta.nUnique > 20) {
      metas = utils.encodeRareCategories(metas, 19)
    }

    // construct colors BufferAttribute
    const colors = new Float32Array(model.n * 3)
    let frequentCategories = { length: 2 }
    if (colorScale.hasOwnProperty('domain')) {
      frequentCategories = colorScale.domain().slice()
    }

    for (let i = metas.length - 1; i >= 0; i--) {
      let color = colorScale(metas[i])
      color = new THREE.Color(color)
      color.toArray(colors, i * 3)
    }

    if (frequentCategories.length > 3) {
      for (let i = metas.length - 1; i >= 0; i--) {
        let color = colorScale(metas[i])
        if (frequentCategories.indexOf(metas[i]) === -1) {
          color = colorScale(utils.RARE)
        }
        color = new THREE.Color(color)
        color.toArray(colors, i * 3)
      }
    }
    geometry.addAttribute('color', new THREE.BufferAttribute(colors.slice(), 3))
  }

  startAnimate() {
    if (!this.animateId) {
      this.animate()
    }
  }
  animate() {
    this.rotate()
    this.animateId = window.requestAnimationFrame(() => this.animate())
  }

  rotate() {
    let time = Date.now() * 0.001
    for (const child of this.scene.children) {
      child.rotation.x = time * 0.05
      child.rotation.y = time * 0.1
    }
    this.renderScatter()
  }

  stopAnimate() {
    window.cancelAnimationFrame(this.animateId)
  }

  highlightQuery(metaKey, query) {
    // To highlight a query result by adding a new PointsGeometry
    // instance to the scene
    this.removeHighlightedPoints()
    // get the reordered data in geometry
    const reorderedData = utils.orderArray(
      this.props.model.data,
      this.points.geometry.userData.index
    )
    // find the matched data points
    const matchedData = reorderedData.filter(rec => {
      return rec[metaKey] === query
    })
    const dataSubset = new ScatterDataSubset(matchedData)
    const highlightCould = this.createHighlightCloud(dataSubset)
    highlightCould.name = 'highlight-' + this.id
    this.scene.add(highlightCould)
    this.renderScatter()
  }

  createHighlightCloud(dataSubset) {
    // dataSubset should be a ScatterDataSubset instance
    const geometryHighlight = new PointsGeometry({ model: dataSubset })
    const material = new THREE.PointsMaterial({
      size: this.state.pointSize * 5,
      sizeAttenuation: this.state.is3d,
      map: this.materials[0].map,
      transparent: true,
      opacity: 0.4,
      color: 0xffff00
    })

    const highlightPoints = new THREE.Points(
      geometryHighlight.geometry,
      material
    )
    // update rotation
    highlightPoints.rotation.x = this.points.rotation.x
    highlightPoints.rotation.y = this.points.rotation.y
    return highlightPoints
  }

  removeHighlightedPoints() {
    const scene = this.scene
    scene.remove(scene.getObjectByName('highlight-' + this.id))
    this.renderScatter()
  }

  getPoint() {
    const { raycaster, mouse, camera } = this
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera)

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects([this.points])
    if (intersects.length > 0) {
      const intersect = intersects[0]
      const idx = intersect.index
      const trueIdx = intersect.object.geometry.userData.index[idx]
      const datum = this.props.model.data[trueIdx]
      return datum
    }
  }
}

Scatter3dView.propTypes = {
  /**
   * ([{x: 0, y: 0, z: 0, ...}]): the json formatted data 
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      z: PropTypes.number,
    })
  ),
  /**
   * ScatterData(data)
   */
  model: PropTypes.any,
  /**
   * (_number_): the width of the component in pixels. Default: 1400.
   */
  width: PropTypes.number,
  /**
   * (_number_): the height of the component in pixels. Default: 800.
   */
  height: PropTypes.number,
  /**
   * (_number_): the device pixel ratio (window.devicePixelRatio)
   */
  DPR: PropTypes.number,
  /**
   * (_string_): the key to color the dots by default.
   */
  colorKey: PropTypes.string,
  /**
   * (_string_): the key to shape the dots by default.
   */
  shapeKey: PropTypes.string,
  /**
   * (_Array_ of strings): the ordered list of keys of attributes to display for the dots when mouse hovers.
   */
  labelKeys: PropTypes.arrayOf(PropTypes.string),
  /**
   * (d3-color-scale): Color scale
   */
  colorScale: PropTypes.any,
  /**
   * (d3-color-scale): Color scale
   */
  shapeScale: PropTypes.any,
  /**
   * (d3-color-scale): Color scale
   */
  shapeLabels: PropTypes.any,
  /**
   * (_boolean_): should the scatter plot in 3-D (true) or 2-D (false).
   */
  is3d: PropTypes.bool,
  /**
   * (_function_): a callback function handling when user click a data point. The input of the function is mouse event and the datum object being clicked.
   */
  onClick: PropTypes.func,
  /**
   * (_function_): a callback function handling when user hovers over a data point. The input of the function is the datum object being clicked.
   */
  onMouseOver: PropTypes.func,

  /// DASH

  /**
   * The ID used to identify this component in Dash callbacks.
   */
  id: PropTypes.string,
  /**
   * Dash-assigned callback that should be called to report property changes
   * to Dash, to make them available for callbacks.
   */
  setProps: PropTypes.func,
}
