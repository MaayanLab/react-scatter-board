import React from 'react'
import * as d3ScaleChromatic from 'd3-scale-chromatic'
import * as d3Scale from 'd3-scale'
import { shapes } from '../shapes'

function validColor(c) {
  let s = (new Option()).style
  s.color = c
  return s.color === c
}

export default function useFacets(data) {
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
      if (facet.type === 'bigint' || facet.type === 'number') {
        if (Object.keys(facet.values).length <= d3ScaleChromatic.schemeCategory10.length) {
          // if there are enough colors for the categories, map them to the chromatic scale
          facet.colorScale = d3Scale.scaleOrdinal()
            .domain(Object.keys(facet.values))
            .range(d3ScaleChromatic.schemeCategory10)
        } else {
          // not enough categorical colors -- treat number as linearly interpolated
          const domain = [
            Object.keys(facet.values).reduce((m, v) => Math.min(m, v * 1.0)),
            Object.keys(facet.values).reduce((m, v) => Math.max(m, v * 1.0)),
          ]
          facet.colorScale = d3Scale.scaleLinear()
            .domain(domain)
            .range(['red', 'blue'])
        }
        if (Object.keys(facet.values).length <= Object.keys(shapes).length) {
          // if there are enough shapes for the categories, map them to the shapes
          facet.shapeScale = d3Scale.scaleOrdinal()
            .domain(Object.keys(facet.values))
            .range(Object.keys(shapes))
        }
      }
    }
    return facets
  }, [data])
}