import React from 'react'
import d3 from 'd3'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import _ from 'underscore'
import Texture from './texture'
import * as utils from './utils'

class ScatterDataSubset {
  // "model" for PointsGeometry
  constructor(data) {
    this.data = data
    this.n = data.length
    const { indices, positions } = this.getIndicesAndPositions(data)
    this.indices = indices
    this.positions = positions
  }

  getIndicesAndPositions(data) {
    const n = this.n
    const indices = new Uint32Array(n)
    const positions = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      indices[i] = i
      positions[i * 3] = data[i].x
      positions[i * 3 + 1] = data[i].y
      positions[i * 3 + 2] = data[i].z || 0
    }
    return { indices: indices, positions: positions }
  }

  getAttr(metaKey) {
    return this.data.map(record => record[metaKey])
  }
}

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

class ScatterData {
  constructor(data) {
    this.data = data
    this.n = data.length
    this.metas = []
    this.parse()
    const { indices, positions } = this.getIndicesAndPositions()
    this.indices = indices
    this.positions = positions
  }

  parse() {
    // extract the meta data `metas` in the array of object
    const data = this.data
    const xyz = ['x', 'y', 'z']
    for (const key of Object.keys(data[0])) {
      if (xyz.indexOf(key) === -1) {
        const values = data.map(o => o[key])
        const nUnique = [...new Set(values)].length
        const type = utils.getDataType(data[0][key])
        this.metas.push({
          name: key,
          nUnique: nUnique,
          type: type
        })
      }
    }
  }

  getIndicesAndPositions() {
    const n = this.n
    const indices = new Uint32Array(n)
    const positions = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      indices[i] = i
      positions[i * 3] = this.data[i].x
      positions[i * 3 + 1] = this.data[i].y
      positions[i * 3 + 2] = this.data[i].z || 0
      // add index to the object
      this.data[i].index = i
    }
    return { indices: indices, positions: positions }
  }

  getLabels(labelKeys) {
    // return an array of label texts given a list of labelKeys
    const n = this.n
    const labels = new Array(n)
    let i = 0
    for (const record of this.data) {
      let label = ''
      for (const labelKey of labelKeys) {
        if (labelKey === 'Time') {
          label += labelKey + ': ' + record[labelKey] + ' hours\n'
        } else if (labelKey === 'Dose') {
          label += labelKey + ': ' + record[labelKey] + ' μM\n'
        } else {
          label += labelKey + ': ' + record[labelKey] + ' \n'
        }
      }
      labels[i] = label
      i++
    }
    return labels
  }

  groupBy(metaKey) {
    // group by a metaKey and return an object of _ScatterDataSubset objects keyed by metaKey
    const dataSubsets = _.groupBy(this.data, metaKey)
    const scatterDataSubsets = _.mapObject(dataSubsets, (records, key) => {
      return new ScatterDataSubset(records)
    })
    return scatterDataSubsets
  }

  binBy(metaKey, nbins) {
    const dataSubsets = utils.binBy(this.data, metaKey, nbins)
    const scatterDataSubsets = _.mapObject(dataSubsets, (records, key) => {
      return new ScatterDataSubset(records)
    })
    return scatterDataSubsets
  }

  binBy2(metaKey, domain) {
    const dataSubsets = utils.binBy2(this.data, metaKey, domain)
    const scatterDataSubsets = _.mapObject(dataSubsets, (records, key) => {
      return new ScatterDataSubset(records)
    })
    return scatterDataSubsets
  }

  getAttr(metaKey) {
    return this.data.map(record => record[metaKey])
  }

  setAttr(key, values) {
    for (let i = 0; i < this.n; i++) {
      const rec = this.data[i]
      rec[key] = values[i]
      this.data[i] = rec
    }
    // add meta data of this new attr
    this.metas.push({
      name: key,
      nUnique: [...new Set(values)].length,
      type: utils.getDataType(values[0])
    })
  }

  getColorOptions() {
    let colorOptions = this.metas.filter(meta => {
      return meta.nUnique < this.n && meta.nUnique > 1
    })
    colorOptions = colorOptions.map(meta => {
      return { value: meta.name, label: meta.name }
    })
    return colorOptions
  }

  getShapeOptions() {
    let shapeOptions = this.metas.filter(meta => {
      return meta.type !== 'float' && (meta.nUnique < 7 && meta.nUnique > 1)
    })
    shapeOptions = shapeOptions.map(meta => {
      return { value: meta.name, label: meta.name }
    })
    return shapeOptions
  }

  calculateColorScale(metaKey) {
    // Color points by a certain metaKey
    // update colorKey
    let metas = this.getAttr(metaKey)

    const meta = _.findWhere(this.metas, { name: metaKey })
    const dtype = meta.type

    if (dtype !== 'float' && dtype !== 'int' && meta.nUnique > 20) {
      metas = utils.encodeRareCategories(metas, 19)
    }
    let uniqueCats = new Set(metas)
    const nUniqueCats = uniqueCats.size
    uniqueCats = Array.from(uniqueCats)
    // Make unknown to be gray
    if (uniqueCats.indexOf('unknown') !== -1) {
      if (uniqueCats.length > 7) {
        const idx = uniqueCats.indexOf('unknown')
        let greyIdx = 7
        if (uniqueCats.length === 20) {
          greyIdx = 15
        }
        const elem = uniqueCats[greyIdx]
        uniqueCats[greyIdx] = 'unknown'
        uniqueCats[idx] = elem
      }
    }
    // Make RARE to be grey
    if (uniqueCats.indexOf(utils.RARE) !== -1) {
      if (uniqueCats.length === 20) {
        const idx = uniqueCats.indexOf(utils.RARE)
        let greyIdx2 = 15
        if (uniqueCats.indexOf('unknown') !== -1) {
          greyIdx2 = 14
        }
        const elem = uniqueCats[greyIdx2]
        uniqueCats[greyIdx2] = utils.RARE
        uniqueCats[idx] = elem
      }
    }

    // make colorScale
    let colorExtent = d3.extent(metas)
    const minScore = colorExtent[0]
    const maxScore = colorExtent[1]
    let colorScale = d3.scale
      .pow()
      .domain([minScore, (minScore + maxScore) / 2, maxScore])
      .range(['#1f77b4', '#ddd', '#d62728'])

    if (meta.name === 'Scores' || meta.name === 'R2_Score') {
      // similarity scores should center at 0
      colorExtent = d3.extent(metas)
      colorScale = d3.scale
        .pow()
        .domain([colorExtent[0], 0, colorExtent[1]])
        .range(['#1f77b4', '#ddd', '#d62728'])
    } else if (dtype === 'boolean') {
      colorScale = d3.scale
        .ordinal()
        .domain([true, false])
        .range(['#cc0000', '#cccccc'])
    } else if (nUniqueCats < 11) {
      colorScale = d3.scale.category10().domain(uniqueCats)
    } else if (nUniqueCats > 10 && nUniqueCats <= 20) {
      colorScale = d3.scale.category20().domain(uniqueCats)
    } else if (nUniqueCats <= 40) {
      const colors40 = [
        '#1b70fc',
        '#faff16',
        '#d50527',
        '#158940',
        '#f898fd',
        '#24c9d7',
        '#cb9b64',
        '#866888',
        '#22e67a',
        '#e509ae',
        '#9dabfa',
        '#437e8a',
        '#b21bff',
        '#ff7b91',
        '#94aa05',
        '#ac5906',
        '#82a68d',
        '#fe6616',
        '#7a7352',
        '#f9bc0f',
        '#b65d66',
        '#07a2e6',
        '#c091ae',
        '#8a91a7',
        '#88fc07',
        '#ea42fe',
        '#9e8010',
        '#10b437',
        '#c281fe',
        '#f92b75',
        '#07c99d',
        '#a946aa',
        '#bfd544',
        '#16977e',
        '#ff6ac8',
        '#a88178',
        '#5776a9',
        '#678007',
        '#fa9316',
        '#85c070',
        '#6aa2a9',
        '#989e5d',
        '#fe9169',
        '#cd714a',
        '#6ed014',
        '#c5639c',
        '#c23271',
        '#698ffc',
        '#678275',
        '#c5a121',
        '#a978ba',
        '#ee534e',
        '#d24506',
        '#59c3fa',
        '#ca7b0a',
        '#6f7385',
        '#9a634a',
        '#48aa6f',
        '#ad9ad0',
        '#d7908c',
        '#6a8a53',
        '#8c46fc',
        '#8f5ab8',
        '#fd1105',
        '#7ea7cf',
        '#d77cd1',
        '#a9804b',
        '#0688b4',
        '#6a9f3e',
        '#ee8fba',
        '#a67389',
        '#9e8cfe',
        '#bd443c',
        '#6d63ff',
        '#d110d5',
        '#798cc3',
        '#df5f83',
        '#b1b853',
        '#bb59d8',
        '#1d960c',
        '#867ba8',
        '#18acc9',
        '#25b3a7',
        '#f3db1d',
        '#938c6d',
        '#936a24',
        '#a964fb',
        '#92e460',
        '#a05787',
        '#9c87a0',
        '#20c773',
        '#8b696d',
        '#78762d',
        '#e154c6',
        '#40835f',
        '#d73656',
        '#1afd5c',
        '#c4f546',
        '#3d88d8',
        '#bd3896',
        '#1397a3',
        '#f940a5',
        '#66aeff',
        '#d097e7',
        '#fe6ef9',
        '#d86507',
        '#8b900a',
        '#d47270',
        '#e8ac48',
        '#cf7c97',
        '#cebb11',
        '#718a90',
        '#e78139',
        '#ff7463',
        '#bea1fd'
      ]
      colorScale = d3.scale
        .ordinal()
        .range(colors40)
        .domain(uniqueCats)
    }

    return colorScale
  }

  calculateShapeScale(metaKey) {
    let symbols = d3.svg.symbolTypes.map(t => d3.svg.symbol().type(t)())

    // make shapeScale for d3.legend
    const meta = _.findWhere(this.metas, { name: metaKey })

    // categorical data
    // get grouped datasets, each group is going to be a cloud
    let scatterDataSubsets = this.groupBy(metaKey)
    let shapeLabels
    let shapeScale = d3.scale
      .ordinal()
      .domain(Object.keys(scatterDataSubsets))
      .range(symbols)

    if (['int', 'float'].indexOf(meta.type) !== -1 && meta.nUnique > 6) {
      // get grouped datasets, each group is going to be a cloud
      scatterDataSubsets = this.binBy(metaKey, 6)
      // Make a threshold scale
      let binnedValues = utils.binValues(_.pluck(this.data, metaKey), 6)

      if (meta.name === 'p-value') {
        // get grouped datasets, each group is going to be a cloud
        const pValueDomain = [0.001, 0.01, 0.05, 0.1, 1]
        scatterDataSubsets = this.binBy2(metaKey, pValueDomain)
        // Make a threshold scale
        binnedValues = utils.binValues2(
          _.pluck(this.data, metaKey),
          pValueDomain
        )
        // overwrite the symbols map to make it having the same length with pValueDomain
        symbols = _.map(
          d3.svg.symbolTypes.slice(0, pValueDomain.length),
          function(t) {
            return d3.svg.symbol().type(t)()
          }
        )
      }

      shapeScale = d3.scale
        .threshold()
        .domain(binnedValues.domain)
        .range(symbols)
      shapeLabels = binnedValues.labels
    }
    return {
      shapeScale: shapeScale,
      shapeLabels: shapeLabels,
      scatterDataSubsets: scatterDataSubsets
    }
  }
}

class Scatter3dView extends React.Component {
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
      showStats: false, // whether to show Stats
      is3d: is3d, // 3d or 2d
      colorScale: this.props.colorScale,
      shapeScale: this.props.shapeScale,
      shapeLabels: this.props.shapeLabels
    }
    // events
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseClick = this.handleMouseClick.bind(this)
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
        onMouseMove={e => this.handleMouseMove(e)}
        onClick={e => this.handleMouseClick(e)}
      />
    )
  }

  setUpStage() {
    // set up THREE.js visualization components
    const { WIDTH, HEIGHT, DPR } = this.state
    const aspectRatio = WIDTH / HEIGHT

    // set up scene, camera, renderer
    const scene = new THREE.Scene()

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
    renderer.domElement.id = 'renderer'
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
        raycaster.params.Points.threshold = this.state.pointSize / 500
      }
    }

    const mouse = new THREE.Vector2()

    // bind three js object to component
    this.scene = scene
    this.renderer = renderer
    this.camera = camera
    this.controls = controls
    this.raycaster = raycaster
    this.mouse = mouse
    // set the id for this object
    this.id = scene.uuid
  }

  handleMouseMove(e) {
    const mouse = this.mouse
    const { WIDTH, HEIGHT } = this.state
    mouse.x = (e.nativeEvent.offsetX / WIDTH) * 2 - 1
    mouse.y = -(e.nativeEvent.offsetY / HEIGHT) * 2 + 1
    this.mouse = mouse
    this.renderScatter()
  }

  handleMouseClick(e) {
    this.stopAnimate()
  }

  makeMaterial() {
    const symbolTypes = [
      'circle',
      'cross',
      'diamond',
      'square',
      'triangle-down',
      'triangle-up'
    ]
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
    const groupSizes = geometries.map(g => g.index.length)
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

      geometry.attributes.color.array[idx * 3] = 0.1
      geometry.attributes.color.array[idx * 3 + 1] = 0.8
      geometry.attributes.color.array[idx * 3 + 2] = 0.1

      // find the position of the point
      const pointPosition = {
        x: geometry.attributes.position.array[idx * 3],
        y: geometry.attributes.position.array[idx * 3 + 1],
        z: geometry.attributes.position.array[idx * 3 + 2]
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

  // highlightSubset (idsToHighlight) {
  //   const dataSubset = this.props.model.getSubset(idsToHighlight)
  //   const highlightCould = this.createHighlightCloud(dataSubset)
  //   highlightCould.setSingleColor('yellow')
  //   highlightCould.name = 'highlight'
  //   this.scene.add(highlightCould)
  //   this.renderScatter()
  // }

  // createHighlightCloud (dataSubset) {
  //   // dataSubset should be a ScatterDataSubset instance
  //   const geometryHighlight = new PointsGeometry(dataSubset)

  //   const material = new THREE.PointsMaterial({
  //     vertexColors: THREE.VertexColors,
  //     size: this.state.pointSize * 5,
  //     sizeAttenuation: false,
  //     map: this.materials[0].map,
  //     transparent: true,
  //     opacity: 0.4
  //   })
  //   const pointsHighlight = new THREE.Points(geometryHighlight, material)
  // }
}

export { ScatterData, Scatter3dView }
