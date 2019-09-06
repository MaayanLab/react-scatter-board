import _ from 'underscore'
import d3 from 'd3'
/*
 * Utility functions
 */

function getCanvasColor(color) {
  return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')'
}
const RARE = 'other'

function getDataType(value) {
  let type = typeof value
  if (type === 'number') {
    type = 'int'
    if (!Number.isInteger(value)) {
      type = 'float'
    }
  }
  return type
}

function orderArray(arr, indices) {
  // Reorder arr based on indices
  const orderedArr = new Array(arr.length)
  for (let i = 0; i < arr.length; i++) {
    orderedArr[i] = arr[indices[i]]
  }
  return orderedArr
}

function encodeRareCategories(arr, k) {
  // Count occurrences of each unique categories in arr,
  // then keep top k and encode rare categories as 'rares'
  let counts = _.countBy(arr)
  // sort values
  counts = _.sortBy(_.pairs(counts), tuple => -tuple[1])
  // get top k frequent categories
  const frequentCategories = _.map(counts.slice(0, k), tuple => tuple[0])
  for (let i = 0; i < arr.length; i++) {
    if (frequentCategories.indexOf(arr[i]) === -1) {
      arr[i] = RARE
    }
  }
  return arr
}

function binValues(arr, nbins) {
  // Binning continues array of values in to nbins
  var extent = d3.extent(arr)
  var min = parseFloat(extent[0])
  var max = parseFloat(extent[1])
  var interval = (max - min) / nbins // bin width

  var domain = _.range(1, nbins).map(function(i) {
    return i * interval + min
  }) // bin edges
  var labels = [min.toFixed(2) + ' to ' + domain[0].toFixed(2)]

  for (var i = 0; i < nbins - 1; i++) {
    if (i === nbins - 2) {
      // the last bin
      var label = domain[i].toFixed(2) + ' to ' + max.toFixed(2)
    } else {
      var label = domain[i].toFixed(2) + ' to ' + domain[i + 1].toFixed(2)
    }
    labels.push(label)
  }
  return {
    labels: labels,
    domain: domain,
    min: min,
    max: max,
    interval: interval
  }
}

function binValues2(arr, domain) {
  // Binning continues array of values by a given binEdges (domain)
  // domain: [0.001, 0.01, 0.05, 0.1, 1]
  // domain should include the largest (rightest) value
  var extent = d3.extent(arr)
  var min = parseFloat(extent[0])
  var max = parseFloat(extent[1])

  var labels = ['0 to ' + domain[0]]
  var nbins = domain.length

  for (var i = 0; i < nbins - 1; i++) {
    var label = domain[i] + ' to ' + domain[i + 1]
    labels.push(label)
  }
  return { labels: labels, domain: domain.slice(0, -1), min: min, max: max }
}

function binBy(list, key, nbins) {
  // similar to _.groupBy but applying to continues values using `binValues`
  // list: an array of objects
  // key: name of the continues variable
  // nbins: number of bins
  var values = _.pluck(list, key)
  var binnedValues = binValues(values, nbins)
  var labels = binnedValues.labels
  var min = binnedValues.min
  var interval = binnedValues.interval

  var grouped = _.groupBy(list, function(obj) {
    var i = Math.floor((obj[key] - min) / interval)
    if (i === nbins) {
      // the max value
      i = nbins - 1
    }
    return labels[i]
  })
  return grouped
}

function binBy2(list, key, domain) {
  // wrapper for `binValuesBy`
  var values = _.pluck(list, key)
  var binnedValues = binValues2(values, domain)
  var labels = binnedValues.labels

  var grouped = _.groupBy(list, function(obj) {
    var i = _.filter(domain, function(edge) {
      return edge < obj[key]
    }).length
    return labels[i]
  })
  return grouped
}

export {
  RARE,
  getCanvasColor,
  getDataType,
  orderArray,
  encodeRareCategories,
  binValues,
  binValues2,
  binBy,
  binBy2
}
