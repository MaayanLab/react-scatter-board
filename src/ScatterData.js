import * as d3 from 'd3'
import * as d3Scale from 'd3-scale'
import _ from 'underscore'
import * as utils from './utils'

export class ScatterDataSubset {
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
      positions[(i * 3)] = data[i].x
      positions[(i * 3) + 1] = data[i].y
      positions[(i * 3) + 2] = data[i].z || 0
    }
    return { indices: indices, positions: positions }
  }

  getAttr(metaKey) {
    return this.data.map(record => record[metaKey])
  }
}

export class ScatterData {
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
      positions[(i * 3)] = this.data[i].x
      positions[(i * 3) + 1] = this.data[i].y
      positions[(i * 3) + 2] = this.data[i].z || 0
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
        label += labelKey + ': ' + record[labelKey] + ' \n'
      }
      labels[i] = label
      i++
    }
    return labels
  }

  groupBy(metaKey) {
    // group by a metaKey and return an object of ScatterDataSubset objects keyed by metaKey
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

  getSearchOptions(labelKeys) {
    // labelKeys: array of strings
    // return an array of objects as input for Select.options
    let allLabels = []
    for (const labelKey of labelKeys) {
      let labels = this.getAttr(labelKey)
      // take the unique values
      labels = [...new Set(labels)]
      labels = labels.map(x => {
        return { value: x, label: x, key: labelKey }
      })
      labels = { label: labelKey, options: labels }
      allLabels.push(labels)
    }
    return allLabels
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
    let colorScale = d3Scale
      .scalePow()
      .domain([minScore, (minScore + maxScore) / 2, maxScore])
      .range(['#1f77b4', '#ddd', '#d62728'])

    if (dtype === 'boolean') {
      colorScale = d3Scale
        .scaleOrdinal()
        .domain([true, false])
        .range(['#cc0000', '#cccccc'])
    } else if (nUniqueCats < 11) {
      colorScale = d3Scale.scaleOrdinal(d3.schemeCategory10).domain(uniqueCats)
    } else if (nUniqueCats > 10 && nUniqueCats <= 20) {
      colorScale = d3Scale.scaleOrdinal(d3.schemeCategory10).domain(uniqueCats)
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
      colorScale = d3Scale
        .scaleOrdinal()
        .range(colors40)
        .domain(uniqueCats)
    }

    return colorScale
  }

  calculateShapeScale(metaKey) {
    let symbols = d3.symbols.map(t => d3.symbol().type(t)())

    // make shapeScale for d3.legend
    const meta = _.findWhere(this.metas, { name: metaKey })

    // categorical data
    // get grouped datasets, each group is going to be a cloud
    let scatterDataSubsets = this.groupBy(metaKey)
    let shapeLabels
    let shapeScale = d3Scale
      .scaleOrdinal()
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
          d3.symbols.slice(0, pValueDomain.length),
          function (t) {
            return d3.symbol().type(t)()
          }
        )
      }

      shapeScale = d3Scale
        .scaleThreshold()
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
