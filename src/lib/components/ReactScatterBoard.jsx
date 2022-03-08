import React from 'react'
import Suspense from './Suspense'
import { shapes } from '../shapes'

import computeFacets from '../utils/computeFacets'
import objectFilter from '../utils/objectFilter'
import html2canvas from 'html2canvas'

const ReactScatterPlot = React.lazy(() => import('./ReactScatterPlot'))
const ReactColorbar = React.lazy(() => import('./ReactColorbar'))
const ReactLegend = React.lazy(() => import('./ReactLegend'))
const ReactSelect = React.lazy(() => import('./ReactSelect'))
const ReactSwitch = React.lazy(() => import('./ReactSwitch'))
const ReactGroupSelect = React.lazy(() => import('./ReactGroupSelect'))

export default function ReactScatterBoard({
  data, is3d: init3d, toggle3d,
  facets: initFacets,
  shapeKey: initShapeKey, shapeKeys,
  colorKey: initColorKey, colorKeys,
  labelKeys: initLabelKeys,
  searchKeys: initSearchKeys,
  selectValue: initSelectValue, scale,
  defaultColor = '#002288'
}) {
  const threeRef = React.useRef()
  const scatterboardRef = React.useRef()
  if (toggle3d === undefined) toggle3d = init3d
  const [facets, setFacets] = React.useState(initFacets || {})
  React.useEffect(() => {
    if (initFacets === undefined) setFacets(computeFacets(data))
    else setFacets(initFacets)
  }, [data, initFacets])
  const [is3d, setIs3d] = React.useState(init3d === true)
  React.useEffect(() => {
    if (init3d === undefined) setIs3d(false)
    else setIs3d(init3d)
  }, [init3d])
  const [shapeKey, setShapeKey] = React.useState(initShapeKey)
  const shapeFacets = React.useMemo(() =>
    objectFilter(facets, (facet, k) => facet.shapeScale !== undefined && (shapeKeys === undefined || shapeKeys.indexOf(k) !== -1)),
    [facets, shapeKeys]
  )
  const [colorKey, setColorKey] = React.useState(initColorKey)
  const colorFacets = React.useMemo(() =>
    objectFilter(facets, (facet, k) => facet.colorScale !== undefined && (colorKeys === undefined || colorKeys.indexOf(k) !== -1)),
    [facets, colorKeys]
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
        .filter(facet =>
          Object.keys(facets[facet].values).length > 1
          && Object.keys(facets[facet].values).length <= 10)
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
    if (_datum.opacity !== undefined) {
      datum.opacity = _datum.opacity
    } else if (is3d === false) {
      datum.opacity = 1.0
    } else {
      datum.opacity = 0.8
    }
    datum.label = (labelKeys || [])
      .filter(labelKey =>
        _datum[labelKey] !== undefined
        && _datum[labelKey] !== null
        && (typeof _datum[labelKey] !== 'number' || !isNaN(_datum[labelKey]))
      )
      .map(labelKey => `${labelKey}: ${_datum[labelKey]}`).join('\n')
    if (shapeKey !== undefined && shapeKey in _datum && shapeKey in facets && 'shapeScale' in facets[shapeKey]) {
      datum.shape = facets[shapeKey].shapeScale(_datum[shapeKey])
    } else {
      datum.shape = 'circle'
    }
    if (colorKey !== undefined && colorKey in _datum && colorKey in facets && 'colorScale' in facets[colorKey]) {
      datum.color = facets[colorKey].colorScale(_datum[colorKey])
    } else {
      datum.color = defaultColor
    }
    if (datum.size === undefined) {
      datum.size = 1.
    }
    if (selectValue !== undefined && _datum[selectValue.key] == selectValue.value) {
      datum.size = 2.5
    } else if (_datum[colorKey] !== undefined) {
      datum.size = 2
    }else {
      datum.size = 0.5
    }
    return datum
  }), [data, is3d, facets, shapeKey, colorKey, selectValue, labelKeys])
  return (
    <div
      ref={scatterboardRef}
      style={{
        flex: '1 1 auto',
        position: 'relative',
        overflow: 'hidden',
      }}>
      <Suspense>
        <ReactScatterPlot
          ref={threeRef}
          is3d={is3d}
          scale={scale}
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
              {'colorbar' in colorFacets[colorKey] ? (
                <ReactColorbar
                  label="Color"
                  facet={colorFacets[colorKey]}
                />
              ) : (
                <ReactLegend
                  label="Color"
                  facet={colorFacets[colorKey]}
                >{({ value, count }) => {
                  return (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <div style={{
                        width: 16, height: 16,
                        backgroundColor: colorFacets[colorKey].colorScale(value),
                      }}>&nbsp;</div>
                      &nbsp;
                      <span>
                        {value}
                        &nbsp;
                        ({count})
                      </span>
                    </div>
                  )
                }}</ReactLegend>
              )}
            </Suspense>
          ) : null}
        </div>
        <div style={{ flex: '1 1 auto' }}>&nbsp;</div>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <Suspense>
            {Object.keys(shapeFacets).length > 0 ? (
              <ReactSelect
                label="Shape By..."
                facets={shapeFacets}
                current={shapeKey in shapeFacets ? shapeKey : undefined}
                onChange={({ value }) => setShapeKey(value)}
              />
            ) : null}
            {Object.keys(colorFacets).length > 0 ? (
              <ReactSelect
                label="Color By..."
                facets={colorFacets}
                current={colorKey in colorFacets ? colorKey : undefined}
                onChange={({ value }) => setColorKey(value)}
              />
            ) : null}
            {searchKeys.length > 0 ? (
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
            {data && data.length > 0 ? (
              <div style={{
                margin: 10,
                textAlign: 'center',
              }}>
                <button
                  style={{
                    border: 0,
                    backgroundColor: 'inherit',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    color: '#0088aa',
                  }}
                  onClick={() => {
                    threeRef.current.gl.domElement.getContext('webgl', { preserveDrawingBuffer: true })
                    threeRef.current.gl.render(threeRef.current.scene, threeRef.current.camera)
                    html2canvas(scatterboardRef.current)
                      .then(canvas => {
                        var a = document.createElement('a');
                        a.href = canvas.toDataURL();
                        a.download = 'canvas.png';
                        a.click();
                      }, 'image/png', 1.0
                    )
                    threeRef.current.gl.domElement.getContext('webgl', { preserveDrawingBuffer: false })
                  }}
                >
                  Download as PNG
                </button>
              </div>
            ) : null}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
