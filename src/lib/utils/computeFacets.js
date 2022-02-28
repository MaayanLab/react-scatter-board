import * as d3ScaleChromatic from 'd3-scale-chromatic'
import * as d3Scale from 'd3-scale'
import objectSort from './objectSort'
import { shapes } from '../shapes'

function validColor(c) {
  let s = (new Option()).style
  s.color = c
  return s.color === c
}

function cmpNaN(a, b) {
  if (isNaN(a * 1.0) && isNaN(b * 1.0)) return 0
  else if (isNaN(a * 1.0)) return 1
  else if (isNaN(b * 1.0)) return -1
  else return (b * 1.0) - (a * 1.0)
}

export default function computeFacets(data) {
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
    if (Object.keys(facet.values).length <= 1) continue
    if (facet.type === 'string') {
      facet.values = objectSort(facet.values, (a, b) => b - a)
      if (Object.keys(facet.values).filter(v => !validColor(v)).length === 0) {
        // if colors are all interpretable as valid colors, passthrough
        facet.colorScale = color => color
      } else if (Object.keys(facet.values).length <= d3ScaleChromatic.schemeCategory10.length) {
        // if there are enough colors for all the catagories, map them to the chromatic scale
        const colorScale = d3Scale.scaleOrdinal()
          .domain(Object.keys(facet.values))
          .range(d3ScaleChromatic.schemeCategory10)
        facet.colorScale = v => colorScale(v+'')
      } else if (Object.keys(facet.values).length <= data.length*0.1) {
        const N = Object.keys(facet.values).length
        const colorScale = d3Scale.scaleOrdinal()
          .domain(Object.keys(facet.values))
          .range(
            Object.keys(facet.values)
              .map((_, ind) => d3ScaleChromatic.interpolateSinebow(ind/(N-1)))
          )
        facet.colorScale = v => colorScale(v+'')
      }
      if (Object.keys(facet.values).filter(k => shapes[k] === undefined).length === 0) {
        // if the shapes are interpretable as valid shapes, passthrough
        facet.shapeScale = shape => shape
      } else if (Object.keys(facet.values).length <= Object.keys(shapes).length) {
        // if there are enough shapes for the categories, map them to the shapes
        const shapeScale = d3Scale.scaleOrdinal()
          .domain(Object.keys(facet.values))
          .range(Object.keys(shapes))
        facet.shapeScale = v => shapeScale(v+'')
      }
    }
    if (facet.type === 'bigint' || facet.type === 'number') {
      if (facet.type === 'bigint' && Object.keys(facet.values).length <= d3ScaleChromatic.schemeCategory10.length) {
        facet.values = objectSort(facet.values, (_a, _b, a, b) => cmpNaN(a, b))
        // if there are enough colors for the categories, map them to the chromatic scale
        const colorScale = d3Scale.scaleOrdinal()
          .domain(Object.keys(facet.values))
          .range(d3ScaleChromatic.schemeCategory10)
        facet.colorScale = v => colorScale(v+'')
      }
      if (Object.keys(facet.values).length <= Object.keys(shapes).length) {
        facet.values = objectSort(facet.values, (_a, _b, a, b) => cmpNaN(a, b))
        // if there are enough shapes for the categories, map them to the shapes
        const shapeScale = d3Scale.scaleOrdinal()
          .domain(Object.keys(facet.values))
          .range(Object.keys(shapes))
        facet.shapeScale = v => shapeScale(v + '')
      } else {
        // not enough categorical colors -- treat number as linearly interpolated
        const domain = [
          Object.keys(facet.values).map(v => v*1.0).reduce((m, v) => isNaN(v) ? m : Math.min(m, v)),
          Object.keys(facet.values).map(v => v*1.0).reduce((m, v) => isNaN(v) ? m : Math.max(m, v)),
        ]
        if (!isNaN(domain[0]) && !isNaN(domain[1])) {
          facet.colorbar = domain
          const colorScale = d3Scale.scaleLinear()
            .domain(domain)
            .range(['grey', 'red'])
          facet.colorScale = v => isNaN(v*1.0) ? 'lightgrey' : colorScale(v*1.0)
        }
      }
    }
  }
  return facets
}