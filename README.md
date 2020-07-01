# react-scatter-board

A React implementation of THREE.js 2d/3d scatter plot. This library was created using the [create-react-library](https://github.com/transitive-bullshit/create-react-library) CLI.

[![NPM](https://img.shields.io/npm/v/react-scatter-board.svg)](https://www.npmjs.com/package/react-scatter-board) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

### Python
```bash
pip install --user --upgrade git+git://github.com/maayanlab/react-scatter-board
```

#### Jupyter

```python
from react_scatter_board.jupyter_compat import ScatterBoard
ScatterBoard(
  id='scatterboard-3d',
  is3d=True,
  data=[
    dict(x=0, y=0, z=0, label='a', shape='s', color='r'),
    dict(x=1, y=1, z=-1, label='b', shape='t', color='g'),
    dict(x=-1, y=-1, z=-1, label='c', shape='c', color='b'),
    dict(x=0, y=0, z=1, label='d', shape='c', color='r'),
    dict(x=0, y=1, z=0, label='e', shape='t', color='g'),
    dict(x=0, y=0, z=-1, label='f', shape='t', color='b'),
  ],
  shapeKey='shape',
  colorKey='color',
  labelKeys=['label'],
  searchKeys=['label', 'shape', 'color'],
  width=600,
  height=400,
)
```

#### Dash
```python
from react_scatter_board import DashScatterBoard

app = dash.Dash(__name__)
app.layout = DashScatterBoard(
  id='scatterboard-2d',
  is3d=False,
  data=[
    dict(x=0, y=0, label='a', shape='s', color='r'),
    dict(x=1, y=1, label='b', shape='t', color='g'),
    dict(x=-1, y=-1, label='c', shape='c', color='b'),
    dict(x=-1, y=0, label='d', shape='c', color='r'),
    dict(x=0, y=1, label='e', shape='t', color='g'),
    dict(x=1, y=0, label='f', shape='t', color='b'),
  ],
  shapeKey='shape',
  colorKey='color',
  labelKeys=['label'],
  searchKeys=['label', 'shape', 'color'],
  width=600,
  height=400,
)
```

### NodeJS
```bash
npm install --save maayanlab/react-scatter-board
```

## Usage

```jsx
import React, { Component } from "react";
import { ScatterBoard, Lazy } from "react-scatter-board";
import "./App.css";

export default class App extends Component {
  render() {
    return (
      <Lazy loading={<div>Loading...</div>}>{() =>
        fetch('http://localhost:8080/GSE48968_tSNE_3.json').then(
          response => response.json()
        ).then(data => (
          <ScatterBoard
            data={data}
            shapeKey="strain"
            colorKey="description"
            labelKeys={["sample_id"]}
            is3d={true}
          />
        ))
      }</Lazy>
    );
  }
}
```

## Examples

Please read the [documentions](https://maayanlab.github.io/react-scatter-board/).

## Development

Local development is broken into two parts (ideally using two tabs).

First, run rollup to watch your `src/` module and automatically recompile it into `dist/` whenever you make changes.

```bash
npm start # runs rollup with watch flag
```

The second part will be running the `example/` create-react-app that's linked to the local version of your module.

```bash
# (in another tab)
cd example
npm start # runs create-react-app dev server
```

Now, anytime you make a change to your library in `src/` or to the example app's `example/src`, `create-react-app` will live-reload your local dev server so you can iterate on your component in real-time.

## Deployment to GitHub Pages

```bash
npm run deploy
```

This creates a production build of the example `create-react-app` that showcases your library and then runs `gh-pages` to deploy the resulting bundle.

## License

MIT © [MaayanLab](https://github.com/MaayanLab)
