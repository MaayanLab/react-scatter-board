import React from 'react'
import Suspense from './Suspense'
import { shapes } from '../shapes'

import useFacets from '../hooks/useFacets'
import objectFilter from '../utils/objectFilter'

const ReactScatterPlot = React.lazy(() => import('./ReactScatterPlot'))
const ReactLegend = React.lazy(() => import('./ReactLegend'))
const ReactSelect = React.lazy(() => import('./ReactSelect'))
const ReactSwitch = React.lazy(() => import('./ReactSwitch'))
const ReactGroupSelect = React.lazy(() => import('./ReactGroupSelect'))

export default function ReactScatterBoard({
  data, is3d: init3d, toggle3d,
  shapeKey: initShapeKey, colorKey: initColorKey,
  labelKeys: initLabelKeys, searchKeys: initSearchKeys,
  selectValue: initSelectValue,
}) {
  if (toggle3d === undefined) toggle3d = init3d
  const facets = useFacets(data)
  const [is3d, setIs3d] = React.useState(init3d === true)
  const [shapeKey, setShapeKey] = React.useState(initShapeKey)
  const shapeFacets = React.useMemo(() =>
    objectFilter(facets, (facet, _k) => facet.shapeScale !== undefined),
    [facets]
  )
  const [colorKey, setColorKey] = React.useState(initColorKey)
  const colorFacets = React.useMemo(() =>
    objectFilter(facets, (facet, _k) => facet.colorScale !== undefined),
    [facets]
  )
  const [labelKeys, setLabelKeys] = React.useState([])
  React.useEffect(() => {
    if (initLabelKeys === undefined) setLabelKeys(Object.keys(facets))
    else setLabelKeys(initLabelKeys)
  }, [initLabelKeys, facets])
  const [selectValue, setSelectValue] = React.useState(initSelectValue)
  const [searchKeys, setSearchKeys] = React.useState([])
  React.useEffect(() => {
    if (initSearchKeys === undefined) setSearchKeys(
      Object.keys(facets)
        .filter(facet => Object.keys(facets[facet].values).length <= 10)
    )
    else setSearchKeys(initSearchKeys)
  }, [initSearchKeys, facets])
  const searchFacets = React.useMemo(() =>
    (searchKeys || []).reduce(
      (F, searchKey) =>
        (facets[searchKey] !== undefined)
          ? { ...F, [searchKey]: facets[searchKey] }
          : F
      , {}),
    [facets, searchKeys]
  )
  const meta = React.useMemo(() => data.map(_datum => {
    const datum = {}
    if (is3d === false) {
      datum.opacity = 1.0
    } else {
      datum.opacity = 0.8
    }
    datum.label = (labelKeys || []).map(labelKey => `${labelKey}: ${_datum[labelKey]}`).join('\n')
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
  }), [data, is3d, facets, shapeKey, colorKey, selectValue, labelKeys])

  return (
    <div style={{
      flex: '1 1 auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Suspense>
        <ReactScatterPlot
          is3d={is3d}
          data={data}
          meta={meta}
        />
      </Suspense>
      <div style={{
        position: 'absolute',
        left: 0, top: 0, zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {shapeKey !== undefined && shapeKey in shapeFacets ? (
            <Suspense>
              <ReactLegend
                label="Shape"
                facet={shapeFacets[shapeKey]}
              >{({ value, count }) => {
                const Shape = shapes[shapeFacets[shapeKey].shapeScale(value)]
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
            </Suspense>
          ) : null}
          {colorKey !== undefined && colorKey in colorFacets ? (
            <Suspense>
              <ReactLegend
                label="Color"
                facet={colorFacets[colorKey]}
              >{({ value, count }) => {
                const Shape = shapes.square
                return (
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                    <Shape
                      width={32} height={32}
                      fill={colorFacets[colorKey].colorScale(value)}
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
            </Suspense>
          ) : null}
        </div>
        <div style={{ flex: '1 1 auto' }}>&nbsp;</div>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <Suspense>
            <ReactSelect
              label="Shape By..."
              facets={shapeFacets}
              current={shapeKey in shapeFacets ? shapeKey : undefined}
              onChange={({ value }) => setShapeKey(value)}
            />
            <ReactSelect
              label="Color By..."
              facets={colorFacets}
              current={colorKey in colorFacets ? colorKey : undefined}
              onChange={({ value }) => setColorKey(value)}
            />
            {searchKeys ? (
              <ReactGroupSelect
                label="Search..."
                facets={searchFacets}
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
          </Suspense>
        </div>
      </div>
    </div>
  )
}
