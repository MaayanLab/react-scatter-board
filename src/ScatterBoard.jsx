import React from 'react'
import { Scatter3dView } from './ScatterPlot.jsx'
import { ScatterData } from './ScatterData.js'
import * as scatterWidgets from './ScatterWidgets.jsx'
import PropTypes from 'prop-types'

/**
 * A React implementation of THREE.js 2d/3d scatter plot.
 */
export class ScatterBoard extends React.Component {
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
  }

  componentDidMount() {
    if (this.props.data !== undefined) {
      this.setState({
        data: this.props.data,
        model: new ScatterData(this.props.data),
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.data !== this.props.data) {
      if (this.props.data === undefined) {
        this.setState({
          data: null,
          model: null,
        })
      } else {
        this.setState({
          data: this.props.data,
          model: new ScatterData(this.props.data),
        })
      }
    }
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
          height={height}
          DPR={window.devicePixelRatio}
          colorKey={colorKey}
          shapeKey={shapeKey}
          labelKeys={labelKeys}
          colorScale={colorScale}
          shapeScale={shapeScale}
          shapeLabels={shapeScale}
          is3d={is3d}
          onClick={this.props.onClick}
          onMouseOver={this.props.onMouseOver}
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

ScatterBoard.propTypes = {
  /**
   * ([{x: 0, y: 0, z: 0, ...}]): the json formatted data 
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      z: PropTypes.number,
    })
  ),
  /**
   * (_string_): the key to shape the dots by default.
   */
  shapeKey: PropTypes.string,
  /**
   * (_string_): the key to color the dots by default.
   */
  colorKey: PropTypes.string,
  /**
   * (_Array_ of strings): the ordered list of keys of attributes to display for the dots when mouse hovers.
   */
  labelKeys: PropTypes.arrayOf(PropTypes.string),
  /**
   * (_Array_ of strings): the list of keys of attributes to enable the search functionality to query against. If not provided, the SearchSelectize component will not be rendered.
   */
  searchKeys: PropTypes.arrayOf(PropTypes.string),
  /**
   * (_number_): the width of the component in pixels. Default: 1400.
   */
  width: PropTypes.number,
  /**
   * (_number_): the height of the component in pixels. Default: 800.
   */
  height: PropTypes.number,
  /**
   * (_boolean_): should the scatter plot in 3-D (true) or 2-D (false).
   */
  is3d: PropTypes.bool,
  /**
   * (_function_): a callback function handling when user click a data point. The input of the function is mouse event and the datum object being clicked.
   */
  onClick: PropTypes.func,
  /**
   * (_function_): a callback function handling when user hovers over a data point. The input of the function is the datum object being clicked.
   */
  onMouseOver: PropTypes.func,

  /// DASH

  /**
   * The ID used to identify this component in Dash callbacks.
   */
  id: PropTypes.string,
  /**
   * Dash-assigned callback that should be called to report property changes
   * to Dash, to make them available for callbacks.
   */
  setProps: PropTypes.func,
}
