import ReactDOM from 'react-dom'
import React from 'react'
import App from './App'

ReactDOM.render(
  <App
    is3d={true}
    searchKeys={["label", 'shape', 'color']}
    labelKeys={["label"]}
    shapeKey="shape"
    colorKey="color"
    data={[
      {
        x: 0, y: 0, z: 0,
        label: 'a',
        shape: 'star',
        color: 'red',
        kind: 'control',
        weight: 0.5
      },
      {
        x: 1, y: 1, z: -1,
        label: 'b',
        shape: 'circle',
        color: 'green',
        kind: 'control',
        weight: 0.5
      },
      {
        x: -1, y: -1, z: -1,
        label: 'c',
        shape: 'square',
        color: 'blue',
        kind: 'control',
        weight: 0.8
      },
      {
        x: 0, y: 0, z: 1,
        label: 'd',
        shape: 'square',
        color: 'red',
        kind: 'case',
        weight: 0.2
      },
      {
        x: 0, y: 1, z: 0,
        label: 'e',
        shape: 'star',
        color: 'green',
        kind: 'case',
        weight: 0.
      },
      {
        x: 0, y: 0, z: -1,
        label: 'f',
        shape: 'circle',
        color: 'blue',
        kind: 'case',
        weight: 1.
      },
    ]}
  />,
  document.getElementById('root'),
)
