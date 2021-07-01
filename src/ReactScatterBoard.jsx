import React, { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { MapControls, OrbitControls, Html } from '@react-three/drei'
import * as d3ScaleChromatic from 'd3-scale-chromatic'
import * as d3Scale from 'd3-scale'
import { shapes, useShapeGeometry } from './shapes'

const Select = React.lazy(() => import('react-select'))

function validColor(c) {
  let s = (new Option()).style
  s.color = c
  return s.color === c
}

export function useFacets(data) {
  return useMemo(() => {
    // identify key/values in data
    const facets = {}
    for (const { x, y, z, ...d } of data) {
      for (const k in d) {
        if (!(k in facets)) facets[k] = { type: typeof d[k], values: {} }
        if (!(d[k] in facets[k].values)) facets[k].values[d[k]] = 0
        facets[k].values[d[k]] += 1
      }
    }
    // produce applicable scales
    for (const key in facets) {
      const facet = facets[key]
      if (facet.type === 'string') {
        if (Object.keys(facet.values).filter(v => !validColor(v)).length === 0) {
          // if colors are all interpretable as valid colors, passthrough
          facet.colorScale = color => color
        } else if (Object.keys(facet.values).length <= d3ScaleChromatic.schemeCategory10.length) {
          // if there are enough colors for all the catagories, map them to the chromatic scale
          facet.colorScale = d3Scale.scaleOrdinal()
            .domain(Object.keys(facet.values))
            .range(d3ScaleChromatic.schemeCategory10)
        }
        if (Object.keys(facet.values).filter(k => shapes[k] === undefined).length === 0) {
          // if the shapes are interpretable as valid shapes, passthrough
          facet.shapeScale = shape => shape
        } else if (Object.keys(facet.values).length <= Object.keys(shapes).length) {
          // if there are enough shapes for the categories, map them to the shapes
          facet.shapeScale = d3Scale.scaleOrdinal()
            .domain(Object.keys(facet.values))
            .range(Object.keys(shapes))
        }
      }
      if (facet.type === 'bigint') {
        if (Object.keys(facet.values).length <= d3ScaleChromatic.schemeCategory10.length) {
          // if there are enough colors for the categories, map them to the chromatic scale
          facet.colorScale = d3Scale.scaleOrdinal()
            .domain(Object.keys(facet.values))
            .range(d3ScaleChromatic.schemeCategory10)
        } else {
          // not enough categorical colors -- treat integer as linearly interpolated
          const domain = [
            Object.keys(facet.values).reduce((m, v) => Math.min(m, v|0)),
            Object.keys(facet.values).reduce((m, v) => Math.max(m, v|0)),
          ]
          facet.colorScale = d3Scale.scaleLinear()
            .domain(domain)
            .range(['red', 'blue'])
        }
        if (Object.keys(facet.values).length <= Object.keys(shapes).length) {
          // if there are enough colors for the categories, map them to the shapes
          facet.shapeScale = d3Scale.scaleOrdinal()
            .domain(Object.keys(facet.values))
            .range(Object.keys(shapes))
        }
      }
      if (facet.type === 'number') {
        const domain = [
          Object.keys(facet.values).reduce((m, v) => Math.min(m, v*1.0)),
          Object.keys(facet.values).reduce((m, v) => Math.max(m, v*1.0)),
        ]
        // linearly interpolate colors on numeric columns
        facet.colorScale = d3Scale.scaleLinear()
          .domain(domain)
          .range(['red', 'blue'])
        // quantize shapes
        facet.shapeScale = d3Scale.scaleQuantile()
          .domain(domain)
          .range(Object.keys(shapes))
      }
    }
    return facets
  })
}

export function Point({ is3d, position, shape, color, opacity, label, selected, data }) {
  const ref = useRef()
  const hovered = false
  if (is3d) {
    useFrame(({ camera }) => {
      // Make text face the camera
      ref.current.quaternion.copy(camera.quaternion)
    })
  }
  return (
    <>
      <mesh
        ref={ref}
        position={position}
        {...shape}
      >
        <meshBasicMaterial
          attach="material"
          color={color}
          transparent={true}
          alphaTest={0.1}
          opacity={opacity}
        />
      </mesh>
      {hovered ? (
        <Html
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
          position={position}
        >{label}</Html>
      ) : null}
    </>
  )
}

export function ScatterPlot({ is3d, data }) {
  const shape_textures = useShapeGeometry()
  const points = useMemo(() => {
    const _points = []
    let i = 0
    let step = 10 / data.length
    for (const d of data) {
      if (!(d.shape in shapes)) console.warn('Invalid shape')
      _points.push({
        position: new THREE.Vector3(d.x, d.y, is3d ? d.z : (i++)*step),
        label: d.label || JSON.stringify(d),
        color: new THREE.Color(d.color || 'grey'),
        shape: shape_textures[d.shape] || shape_textures.circle,
        selected: d.selected,
        opacity: d.opacity || 0.8,
        data: d,
      })
    }
    return _points
  }, [data])
  return points.map((props, ind) => <Point key={ind} is3d={is3d} {...props} />)
}

export function ReactScatterPlot({ is3d, data }) {
  const span = useMemo(() => {
    let minX, minY, minZ,
        maxX, maxY, maxZ
    for (const {x, y, z} of data) {
      minX = minX === undefined ? x : Math.min(minX, x)
      maxX = maxX === undefined ? x : Math.max(maxX, x)
      minY = minY === undefined ? y : Math.min(minY, y)
      maxY = maxY === undefined ? y : Math.max(maxY, y)
      if (is3d === true) {
        minZ = minZ === undefined ? z : Math.min(minZ, z)
        maxZ = maxZ === undefined ? z : Math.max(maxZ, z)
      }
    }
    let spanX, spanY, spanZ, maxSpan
    spanX = maxX - minX
    spanY = maxY - minY
    if (is3d) spanZ = maxZ - minZ
    let centerX, centerY, centerZ
    centerX = ((maxX - minX) / 2)|0
    centerY = ((maxY - minY) / 2)|0
    if (is3d === true) {
      maxSpan = Math.max(Math.max(spanX, spanY), spanZ)
      centerZ = ((maxZ - minZ) / 2)|0
    } else {
      maxSpan = Math.max(spanX, spanY)
    }
    return {
      minX, minY, minZ,
      maxX, maxY, maxZ,
      centerX, centerY, centerZ,
      maxSpan, spanX, spanY, spanZ,
    }
  }, [data])
  if (is3d === true) {
    return (
      <Canvas dpr={[1, 2]}
        gl={{
          logarithmicDepthBuffer: true,
          alpha: true
        }}
        camera={{
          position: [span.centerX, span.centerY, span.centerZ],
          zoom: 100 / Math.max(200, span.maxSpan),
          near: 1,
        }}
        onPointerMove={null}
      >
        <ScatterPlot
          is3d={is3d}
          data={data}
        />
        <OrbitControls
          enableZoom={true}
          enableDamping={true}
          dampingFactor={0.25}
          screenSpacePanning={true}
        />
      </Canvas>
    )
  } else {
    return (
      <Canvas
        orthographic
        camera={{
          position: [span.centerX, span.centerY, span.maxSpan],
          up: [0, 0, 1],
          zoom: 500 / span.maxSpan,
        }}
        onPointerMove={null}
      >
        <ScatterPlot
          is3d={is3d}
          data={data}
        />
        <MapControls
          enableZoom={true}
          enableDamping={true}
          dampingFactor={0.25}
          screenSpacePanning={true}
        />
      </Canvas>
    )
  }
}

export function ReactLegend({ label, facet, children }) {
  const Child = children
  return (
    <div
      style={{
        width: '200px',
        maxHeight: '50%',
        marginBottom: '10px',
        color: 'black',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto'
      }}
    >
      <b>{label}</b>
      {Object.keys(facet.values).map((value) => (
        <Child key={value} value={value} count={facet.values[value]} />
      ))}
    </div>
  )
}
export function ReactSelect({ label, facets, current, onChange }) {
  return (
    <div
      style={{
        width: '200px',
        marginBottom: '10px',
        color: 'black',
        pointerEvents: 'auto',
      }}
    >
      <b>{label}</b>
      <Select
        classNamePrefix="select"
        value={{ value: current, label: current }}
        onChange={evt => {
          if (evt === null) evt = { value: undefined }
          onChange(evt)
        }}
        isClearable={true}
        isSearchable={true}
        options={Object.keys(facets).map(value => ({ value, label: value }))}
      />
    </div>
  )
}

function formatGroupLabel(data) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <span>{data.label}</span>
      <span
        style={{
          display: 'inline-block',
        }}
      >{data.options.length}</span>
    </div>
  )
}

export function ReactGroupSelect({ label, facets, current, onChange }) {
  return (
    <div
      style={{
        width: '200px',
        marginBottom: '10px',
        color: 'black',
        pointerEvents: 'auto',
      }}
    >
      <b>{label}</b>
      <Select
        classNamePrefix="select"
        value={current}
        onChange={evt => {
          if (evt === null) evt = undefined
          onChange(evt)
        }}
        isClearable={true}
        isSearchable={true}
        options={Object.keys(facets).map(key => ({
          label: key,
          options: Object.keys(facets[key].values).map(value => ({
            key,
            label: value,
            value,
          }))
        }))}
        formatGroupLabel={formatGroupLabel}
      />
    </div>
  )
}

export default function ReactScatterBoard({
  data, is3d,
  shapeKey: initShapeKey, colorKey: initColorKey,
  labelKeys, searchKeys,
  selectValue: initSelectValue,
}) {
  const facets = useFacets(data)
  const [shapeKey, setShapeKey] = useState(initShapeKey)
  const [colorKey, setColorKey] = useState(initColorKey)
  const [selectValue, setSelectValue] = useState(initSelectValue)
  const dataFixed = useMemo(() => data.map(_datum => {
    const datum = { ..._datum }
    if (is3d === false) {
      datum.z = 0
      datum.opacity = 1
    } else {
      datum.opacity = 0.8
    }
    datum.label = (labelKeys || []).map(labelKey => `${labelKey}: ${datum[labelKey]}`).join('<br />')
    if (shapeKey !== undefined && shapeKey in datum && shapeKey in facets && 'shapeScale' in facets[shapeKey]) {
      datum.shape = facets[shapeKey].shapeScale(datum[shapeKey])
    } else {
      datum.shape = 'circle'
    }
    if (colorKey !== undefined && colorKey in datum && colorKey in facets && 'colorScale' in facets[colorKey]) {
      datum.color = facets[colorKey].colorScale(datum[colorKey])
    } else {
      datum.color = 'black'
    }
    if (selectValue !== undefined && datum[selectValue.key] === selectValue.value) {
      datum.selected = true
    } else {
      datum.selected = false
    }
    return datum
  }), [data, facets, shapeKey, colorKey, selectValue])
  return (
    <div style={{
      flex: '1 1 auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <ReactScatterPlot
        is3d={is3d}
        data={dataFixed}
      />
      <div style={{
        position: 'absolute',
        left: 0, top: 0, zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {shapeKey !== undefined && shapeKey in facets && 'shapeScale' in facets[shapeKey] ? (
            <ReactLegend
              label="Shape"
              facet={facets[shapeKey]}
            >{({ value, count }) => {
              const Shape = shapes[facets[shapeKey].shapeScale(value)]
              return (
                <span>
                  <Shape />
                  &nbsp;
                  {value}
                  &nbsp;
                  ({count})
                </span>
              )
            }}</ReactLegend>
          ) : null}
          {colorKey !== undefined && colorKey in facets && 'colorScale' in facets[colorKey] ? (
            <ReactLegend
              label="Color"
              facet={facets[colorKey]}
            >{({ value, count }) => {
              const Shape = shapes.square
              return (
                <span>
                  <Shape fill={facets[colorKey].colorScale(value)} />
                  &nbsp;
                  {value}
                  &nbsp;
                  ({count})
                </span>
              )
            }}</ReactLegend>
          ) : null}
        </div>
        <div style={{ flex: '1 1 auto' }}>&nbsp;</div>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <ReactSelect
            label="Shape By..."
            facets={facets}
            current={shapeKey}
            onChange={({ value }) => setShapeKey(value)}
          />
          <ReactSelect
            label="Color By..."
            facets={facets}
            current={colorKey}
            onChange={({ value }) => setColorKey(value)}
          />
          {searchKeys ? (
            <ReactGroupSelect
              label="Search..."
              facets={searchKeys.reduce((F, searchKey) => ({...F, [searchKey]: facets[searchKey] }), {})}
              current={selectValue}
              onChange={(evt) => setSelectValue(evt)}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
