import React from 'react'
import { Scatter3dView, ScatterData } from './scatterPlot'
import * as scatterWidgets from './scatterWidgets'

class ScatterBoard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: null,
      model: null,
      colorScale: null,
      shapeScale: null,
      shapeLabels: null,
      colorKey: this.props.colorKey,
      shapeKey: this.props.shapeKey,
      labelKeys: this.props.labelKeys,
      searchKeys: this.props.searchKeys,
      is3d: this.props.is3d
    }
    // events
    this.handleColorKeyChange = this.handleColorKeyChange.bind(this)
    this.handleShapeKeyChange = this.handleShapeKeyChange.bind(this)
    this.handleSearchInputChange = this.handleSearchInputChange.bind(this)
    this.handleClearBtnClick = this.handleClearBtnClick.bind(this)

    fetch(this.props.url)
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error('Something went wrong when fetching data ...')
        }
      })
      .then(data => this.setState({ data: data, model: new ScatterData(data) }))
  }

  render() {
    // variables to be passed to children's states
    const { colorKey, shapeKey, labelKeys, searchKeys, is3d } = this.state
    const { colorScale, shapeScale, shapeLabels } = this.state
    const { width, height } = this.props
    let colorOptions = null
    let shapeOptions = null
    let searchOptions = null
    if (this.state.model) {
      colorOptions = this.state.model.getColorOptions()
      shapeOptions = this.state.model.getShapeOptions()
      if (searchKeys) {
        searchOptions = this.state.model.getSearchOptions(searchKeys)
      }
    }
    return (
      <div
        style={{
          position: 'relative',
          padding: 0,
          width: width,
          height: height
        }}
      >
        <Scatter3dView
          data={this.state.data}
          model={this.state.model}
          width={width}
          height={width}
          DPR={window.devicePixelRatio}
          colorKey={colorKey}
          shapeKey={shapeKey}
          labelKeys={labelKeys}
          colorScale={colorScale}
          shapeScale={shapeScale}
          shapeLabels={shapeScale}
          is3d={is3d}
          // create a ref for the parent to refer to the child
          ref={scatter3dView => {
            this.scatter3dView = scatter3dView
          }}
        />
        <scatterWidgets.Legend
          colorScale={colorScale}
          colorKey={colorKey}
          shapeScale={shapeScale}
          shapeKey={shapeKey}
          shapeLabels={shapeLabels}
        />
        <div
          style={{
            zIndex: 10,
            top: 0,
            right: 0,
            width: 200,
            position: 'absolute'
          }}
        >
          {colorOptions && colorOptions.length > 1 && (
            <scatterWidgets.SelectDropdown
              label='Color by:'
              defaultValue={{
                value: colorKey,
                label: colorKey
              }}
              options={colorOptions}
              onSelectChange={this.handleColorKeyChange}
              width={180}
            />
          )}
          {shapeOptions && shapeOptions.length > 1 && (
            <scatterWidgets.SelectDropdown
              label='Shape by:'
              defaultValue={{
                value: shapeKey,
                label: shapeKey
              }}
              options={shapeOptions}
              onSelectChange={this.handleShapeKeyChange}
              width={180}
            />
          )}
          {searchKeys && searchKeys.length > 1 && (
            <scatterWidgets.SearchSelectize
              label='Search:'
              options={searchOptions}
              onInputChange={this.handleSearchInputChange}
              onClearBtnClicked={this.handleClearBtnClick}
              width={180}
            />
          )}
        </div>
      </div>
    )
  }

  handleColorKeyChange(value) {
    // re-coloring the map when colorKey changed
    const colorKey = value.value
    if (colorKey !== this.state.colorKey) {
      const model = this.state.model
      const colorScale = model.calculateColorScale(colorKey)
      this.setState({ colorKey: colorKey, colorScale: colorScale })
    }
  }

  handleShapeKeyChange(value) {
    // re-shaping of the map when shapeKey changed
    const shapeKey = value.value
    if (shapeKey !== this.state.shapeKey) {
      const model = this.state.model
      const { shapeScale, shapeLabels } = model.calculateShapeScale(shapeKey)
      this.setState({
        shapeKey: shapeKey,
        shapeScale: shapeScale,
        shapeLabels: shapeLabels
      })
    }
  }

  handleSearchInputChange(valueObj) {
    // update highlights for new search
    const { key, value } = valueObj
    this.scatter3dView.highlightQuery(key, value)
  }

  handleClearBtnClick() {
    this.scatter3dView.removeHighlightedPoints()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.data === null && prevState.data !== this.state.data) {
      // data has been fetched for the first time
      const { colorKey, shapeKey } = this.state
      const model = this.state.model

      const colorScale = model.calculateColorScale(colorKey)
      const { shapeScale, shapeLabels } = model.calculateShapeScale(shapeKey)
      this.setState({
        colorScale: colorScale,
        shapeScale: shapeScale,
        shapeLabels: shapeLabels
      })
    }
  }
}

export { ScatterBoard }
