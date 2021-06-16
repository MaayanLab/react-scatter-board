import '../font/glyphter-font/css/Glyphter.css'
import React, { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, MapControls, OrbitControls, Html } from '@react-three/drei'
import Select from 'react-select'
import customFont from '../font/glyphter-font/fonts/Glyphter.ttf'
import { PerspectiveCamera } from 'three'

const shapes = {
  circle: 'A',
  cross: 'B',
  diamond: 'C',
  square: 'D',
  star: 'E',
  triangle: 'F',
  wye: 'G',
}

function Point({ position, shape, color, opacity, label, selected, data }) {
  const ref = useRef()
  const size = 0.75
  const fontProps = {
    font: customFont,
    fontWeight: '900',
    fontSize: selected === true ? 2 * size : size,
    lineHeight: size,
  }
  const [hovered, setHovered] = useState(false)
  const over = (e) => (e.stopPropagation(), setHovered(true))
  const out = () => setHovered(false)
  useEffect(() => {
    if (hovered) document.body.style.cursor = 'pointer'
    return () => (document.body.style.cursor = 'auto')
  }, [hovered])
  useFrame(({ camera }) => {
    // Make text face the camera
    ref.current.quaternion.copy(camera.quaternion)
  })
  return (
    <>
      <Text
        ref={ref}
        position={position}
        onPointerOver={over}
        onPointerOut={out}
        color={color}
        fillOpacity={opacity}
        anchorX="center"
        anchorY="middle"
        {...fontProps}
      >{shape}</Text>
      {hovered ? (
        <Html
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
          position={position}
        >{label}</Html>
      ) : null}
    </>
  )
}

function ScatterPlot({ data }) {
  const points = useMemo(() => {
    const _points = []
    for (const d of data) {
      if (!(d.shape in shapes)) console.warn('Invalid shape')
      _points.push({
        position: new THREE.Vector3(d.x, d.y, d.z),
        label: d.label || JSON.stringify(d),
        color: new THREE.Color(d.color || 'grey'),
        shape: shapes[d.shape] || shapes.circle,
        selected: d.selected,
        opacity: d.opacity || 0.8,
        data: d,
      })
    }
    return _points
  }, [data])
  return points.map((props, ind) => <Point key={ind} {...props} />)
}

export function useFacets(data) {
  return useMemo(() => {
    const facets = {}
    for (const { x, y, z, ...d } of data) {
      for (const k in d) {
        if (!(k in facets)) facets[k] = { type: typeof d[k], values: {} }
        if (!(d[k] in facets[k].values)) facets[k].values[d[k]] = 0
        facets[k].values[d[k]] += 1
      }
    }
    return facets
  })
}

export function Legend({ facets }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {Object.keys(facets).map(f => <div key={f}>{f} ({facets[f].type}: {Object.keys(facets[f].values).length})</div>)}
    </div>
  )
}

export function ReactScatterPlot({ is3d, data }) {
  const fov = 45
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
  console.log(span)
  if (is3d === true) {
    return (
      <Canvas dpr={[1, 2]} camera={{
        fov,
        autoRotate: true,
        aspect: span.spanX / span.spanY,
        far: span.maxZ,
        near: span.minZ,
        position: [span.centerX, span.centerY, span.centerZ],
        zoom: 0.1,
      }}>
        <ScatterPlot data={data} />
        <OrbitControls />
      </Canvas>
    )
  } else {
    return (
      <Canvas dpr={[1, 2]} orthographic camera={{
        left: span.minX,
        right: span.maxX,
        top: span.minY,
        bottom: span.maxY,
        near: 0,
        far: Math.max(2000, Math.pow(span.maxSpan, 2)),
        up: [0, 0, 1],
        position: [span.centerX, span.centerY, -span.maxSpan],
        zoom: 100,
      }}>
        <ScatterPlot data={data} />
        <MapControls />
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
        marginBottom: '10px',
        color: 'black',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column'
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
  return (
    <div style={{
      flex: '1 1 auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <ReactScatterPlot
        is3d={is3d}
        data={data.map(datum => ({
          ...datum,
          x: datum.x,
          y: datum.y,
          z: is3d === false ? 0 : datum.z,
          label: (labelKeys||[]).map(labelKey => `${labelKey}: ${datum[labelKey]}`).join('<br />'),
          shape: datum[shapeKey] || 'circle',
          color: datum[colorKey] || 'black',
          selected: selectValue === undefined ? false : datum[selectValue.key] === selectValue.value,
        }))}
      />
      <div style={{
        position: 'absolute',
        left: 0, top: 0, zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {shapeKey !== undefined ? (
            <ReactLegend
              label="Shape"
              facet={facets[shapeKey]}
            >{({ value, count }) =>
              <span>
                <span style={{ fontFamily: 'Glyphter' }}>{shapes[value]}</span>
                &nbsp;
                {value}
                &nbsp;
                ({count})
              </span>}</ReactLegend>
          ) : null}
          {colorKey !== undefined ? (
            <ReactLegend
              label="Color"
              facet={facets[colorKey]}
            >{({ value, count }) => (
              <span>
                <span style={{ fontFamily: 'Glyphter', color: value }}>{shapes.square}</span>
                &nbsp;
                {value}
                &nbsp;
                ({count})
              </span>
            )}</ReactLegend>
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
