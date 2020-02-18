import React from 'react'
import { ScatterBoard } from './ScatterBoard.jsx'
import PropTypes from 'prop-types'

/**
 * A Dash-compatible wrapper to the React implementation
 */
export class DashScatterBoard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.onClick = this.onClick.bind(this)
    this.onMouseOver = this.onMouseOver.bind(this)
  }

  onClick(evt, node) {
    const { setProps } = this.props
    if (node !== undefined) {
      console.log('click')
      console.log(node)
      setProps({ clickData: node })
    }
  }

  onMouseOver(node) {
    const { setProps, hoverData } = this.props
    if (node !== hoverData) {
      console.log('hover')
      console.log(node)
      setProps({ hoverData: node })
    }
  }

  render() {
    const {
      id,
      setProps,
      data,
      shapeKey,
      colorKey,
      labelKeys,
      searchKeys,
      width,
      height,
      is3d,
    } = this.props
    return (
      <ScatterBoard
        id={id}
        data={data}
        setProps={setProps}
        shapeKey={shapeKey}
        colorKey={colorKey}
        labelKeys={labelKeys}
        searchKeys={searchKeys}
        width={width}
        height={height}
        is3d={is3d}
        onClick={this.onClick}
        onMouseOver={this.onMouseOver}
      />
    )
  }
}

DashScatterBoard.defaultProps = {
  clickData: null,
  hoverData: null,
}

DashScatterBoard.propTypes = {
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
  /**
   * Click data
   **/
  clickData: PropTypes.object,
  /**
   * Hover data
   **/
  hoverData: PropTypes.object,
}
