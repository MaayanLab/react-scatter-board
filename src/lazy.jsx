import React from 'react'

export class Lazy extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      children: null
    }
  }

  componentDidMount() {
    if (typeof this.props.children !== 'function') {
      throw new Error('Lazy component expects an asynchronous function body')
    }
    this.props.children().then(
      (children) => this.setState(
        () => ({ children })
      )
    )
  }

  render() {
    if (this.state.children !== null) {
      return this.state.children
    } else if (this.props.loading === undefined) {
      return null
    } else if (typeof this.props.loading === 'function') {
      return this.props.loading()
    } else { // assuming this is valid rendered react DOM tree
      return this.props.loading
    }
  }
}
