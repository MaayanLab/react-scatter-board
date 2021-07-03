import React from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import {
  PerspectiveCamera,
  OrthographicCamera,
  OrbitControls,
  MapControls,
  Html,
} from '@react-three/drei'
import * as d3ScaleChromatic from 'd3-scale-chromatic'
import * as d3Scale from 'd3-scale'
import { shapes, useShapeMaterial } from './shapes'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const Select = React.lazy(() => import('react-select'))

function validColor(c) {
  let s = (new Option()).style
  s.color = c
  return s.color === c
}

export function useFacets(data) {
  return React.useMemo(() => {
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
export function ScatterPlot({ is3d, data }) {
  const shapeMaterials = useShapeMaterial()
  const { geometry, material } = React.useMemo(() => {
    const groups = {}
    const color = new THREE.Color()
    const scale = (
      200
      / Math.log(data.length)
      / Math.log(8)
      / (is3d ? 25 : 1)
    )
    for (const d of data) {
      if (!(d.shape in shapes)) console.warn('Invalid shape')
      if (!(d.shape in groups)) groups[d.shape] = {
        n: 0,
        positions: [],
        colors: [],
        sizes: [],
      }
      groups[d.shape].positions.push(d.x)
      groups[d.shape].positions.push(d.y)
      groups[d.shape].positions.push(is3d ? d.z : 0)

      color.set(d.color || '#002288')
      groups[d.shape].colors.push(color.r)
      groups[d.shape].colors.push(color.g)
      groups[d.shape].colors.push(color.b)
      groups[d.shape].colors.push(d.opacity)

      groups[d.shape].sizes.push(scale * (d.size || 1))

      groups[d.shape].n++
    }

    const geometries = []
    const materials = []
    for (const shape in groups) {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(groups[shape].positions, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(groups[shape].colors, 4))
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(groups[shape].sizes, 1))
      geometry.computeBoundingSphere()
      geometries.push(geometry)
      materials.push(shapeMaterials[shape])
    }
    const mergedGeometries = BufferGeometryUtils.mergeBufferGeometries(geometries, true)
    return {geometry: mergedGeometries, material: materials}
  }, [data])
  return <points geometry={geometry} material={material} />
}

export function ReactScatterPlot({ is3d, data }) {
  const { centerX, centerY, centerZ } = React.useMemo(() => {
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
    let spanX, spanY, spanZ
    spanX = maxX - minX
    spanY = maxY - minY
    if (is3d) spanZ = maxZ - minZ
    let centerX, centerY, centerZ
    centerX = ((maxX - minX) / 2)|0
    centerY = ((maxY - minY) / 2)|0
    if (is3d === true) {
      centerZ = ((maxZ - minZ) / 2)|0
    }
    return { centerX, centerY, centerZ }
  }, [is3d, data])
  return (
    <Canvas onPointerMove={null}>
      <ScatterPlot
        is3d={is3d}
        data={data}
      />
      {is3d ? (
        <>
          <PerspectiveCamera
            makeDefault
            fov={90}
            position={[centerX, centerY, centerZ]}
            near={0.01}
            far={100}
            zoom={1}
          />
          <OrbitControls
            enableZoom={true}
            enableDamping={true}
            dampingFactor={0.25}
            screenSpacePanning={true}
          />
        </>
      ) : (
        <>
          <OrthographicCamera
            makeDefault
            position={[centerX, centerY, 1]}
            up={[0,0,1]}
            near={0.01}
            far={100}
            zoom={25}
          />
          <MapControls
            enableZoom={true}
            enableDamping={true}
            dampingFactor={0.25}
            screenSpacePanning={true}
            maxPolarAngle={0}
            minPolarAngle={0}
          />
        </>
      )}
    </Canvas>
  )
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
  const [shapeKey, setShapeKey] = React.useState(initShapeKey)
  const [colorKey, setColorKey] = React.useState(initColorKey)
  const [selectValue, setSelectValue] = React.useState(initSelectValue)
  const dataFixed = React.useMemo(() => data.map(_datum => {
    const datum = { ..._datum }
    if (is3d === false) {
      datum.opacity = 1.0
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
      datum.color = '#002288'
    }
    if (selectValue !== undefined && datum[selectValue.key] === selectValue.value) {
      datum.size = 2.5
    } else {
      datum.size = 1
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
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                  <Shape
                    width={32} height={32}
                  />
                  <span>
                    &nbsp;
                    {value}
                    &nbsp;
                    ({count})
                  </span>
                </div>
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
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                  <Shape
                    width={32} height={32}
                    fill={facets[colorKey].colorScale(value)}
                  />
                  <span>
                    &nbsp;
                    {value}
                    &nbsp;
                    ({count})
                  </span>
                </div>
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
