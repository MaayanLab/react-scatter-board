/*
The widgets for the interactive scatter plot.
*/
import React from 'react'
import d3 from 'd3'
import legend from 'd3-svg-legend/no-extend'
import _ from 'underscore'
import Select from 'react-select'

class Legend extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      width: this.props.width || 300,
      height: this.props.height || 800
    }
  }

  componentDidMount() {
    this.setUpDOMs()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.colorScale !== this.props.colorScale) {
      this.displayColorLegend(this.props.colorScale, this.props.colorKey)
    }
    if (prevProps.shapeScale !== this.props.shapeScale) {
      this.displayShapeLegend(
        this.props.shapeScale,
        this.props.shapeKey,
        this.props.shapeLabels
      )
    }
  }

  render() {
    return (
      <div
        ref={ref => (this.mount = ref)}
        // onMouseMove={e => this.handleMouseMove(e)}
      />
    )
  }

  setUpDOMs() {
    // set up DOMs for the legends
    const { width, height } = this.state
    this.el = d3
      .select(this.mount)
      .append('svg')
      .attr('id', 'legend')
      .attr('width', width)
      .attr('height', height)

    this.g = this.el
      .append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(10, 20)')
    this.g
      .append('g')
      .attr('id', 'legendShape')
      .attr('class', 'legendPanel')
      .attr('transform', 'translate(0, 0)')
    this.g
      .append('g')
      .attr('id', 'legendColor')
      .attr('class', 'legendPanel')
      .attr('transform', 'translate(110, 0)')

    // styles
    this.mount.style.position = 'absolute'
    this.mount.style.zIndex = 10
    this.mount.style.overflow = 'visible'
    this.mount.style.left = 0
    this.mount.style.top = 0
  }

  displayShapeLegend(shapeScale, shapeKey, shapeLabels) {
    const legendShape = legend
      .symbol()
      .scale(shapeScale)
      .orient('vertical')
      .title(shapeKey)
    if (shapeLabels) {
      legendShape.labels(shapeLabels)
    }
    this.g.select('#legendShape').call(legendShape)
  }

  displayColorLegend(colorScale, colorKey) {
    const legendColor = legend
      .color()
      .title(colorKey)
      .shapeWidth(20)
      .cells(5)
      .labelFormat(d3.format('.2f'))
      .scale(colorScale)

    this.g.select('#legendColor').call(legendColor)
  }
}

class SelectDropdown extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      label: this.props.label,
      options: null,
      defaultValue: this.props.defaultValue
    }
    this.handleChange = this.handleChange.bind(this)
  }

  render() {
    return (
      <div ref={ref => (this.mount = ref)}>
        <label>{this.props.label}</label>
        <Select
          defaultValue={this.state.defaultValue}
          options={this.props.options}
          onChange={this.handleChange}
          styles={{
            container: () => ({
              width: this.props.width
            })
          }}
        />
      </div>
    )
  }

  handleChange(value) {
    this.props.onSelectChange(value)
  }
}

class SearchSelectize extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchStr: ''
    }
    this.handleChange = this.handleChange.bind(this)
  }

  render() {
    return (
      <div ref={ref => (this.mount = ref)}>
        <label>{this.props.label}</label>
        <Select
          defaultValue=''
          defaultInputValue=''
          onChange={this.handleChange}
        />
      </div>
    )
  }

  handleChange(value) {
    this.props.onInputChange(value)
  }
}

export { Legend, SelectDropdown, SearchSelectize }
