import React from 'react'
import { shapes } from '../shapes'

import useFacets from '../hooks/useFacets'

const ReactScatterPlot = React.lazy(() => import('./ReactScatterPlot'))
const ReactLegend = React.lazy(() => import('./ReactLegend'))
const ReactSelect = React.lazy(() => import('./ReactSelect'))
const ReactSwitch = React.lazy(() => import('./ReactSwitch'))
const ReactGroupSelect = React.lazy(() => import('./ReactGroupSelect'))

export default function ReactScatterBoard({
  data, is3d: init3d, toggle3d,
  shapeKey: initShapeKey, colorKey: initColorKey,
  labelKeys, searchKeys,
  selectValue: initSelectValue,
}) {
  if (toggle3d === undefined) toggle3d = init3d
  const facets = useFacets(data)
  const [is3d, setIs3d] = React.useState(init3d === true)
  const [shapeKey, setShapeKey] = React.useState(initShapeKey)
  const [colorKey, setColorKey] = React.useState(initColorKey)
  const [selectValue, setSelectValue] = React.useState(initSelectValue)
  const meta = React.useMemo(() => data.map(_datum => {
    const datum = {}
    if (is3d === false) {
      datum.opacity = 1.0
    } else {
      datum.opacity = 0.8
    }
    datum.label = (labelKeys || []).map(labelKey => `${labelKey}: ${_datum[labelKey]}`).join('<br />')
    if (shapeKey !== undefined && shapeKey in _datum && shapeKey in facets && 'shapeScale' in facets[shapeKey]) {
      datum.shape = facets[shapeKey].shapeScale(_datum[shapeKey])
    } else {
      datum.shape = 'circle'
    }
    if (colorKey !== undefined && colorKey in _datum && colorKey in facets && 'colorScale' in facets[colorKey]) {
      datum.color = facets[colorKey].colorScale(_datum[colorKey])
    } else {
      datum.color = '#002288'
    }
    if (selectValue !== undefined && _datum[selectValue.key] === selectValue.value) {
      datum.size = 2.5
    } else {
      datum.size = 1
    }
    return datum
  }), [data, is3d, facets, shapeKey, colorKey, selectValue])
  return (
    <div style={{
      flex: '1 1 auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <ReactScatterPlot
        is3d={is3d}
        data={data}
        meta={meta}
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
              facets={searchKeys.reduce((F, searchKey) => {
                if (facets[searchKey] !== undefined) {
                  return {...F, [searchKey]: facets[searchKey] }
                } else {
                  return F
                }
              }, {})}
              current={selectValue}
              onChange={(evt) => setSelectValue(evt)}
            />
          ) : null}
          {toggle3d ? (
            <ReactSwitch
              off="2D"
              on="3D"
              current={is3d}
              onChange={(value) => setIs3d(value)}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
