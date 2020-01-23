# react-scatter-board

A React implementation of THREE.js 2d/3d scatter plot. This library was created using the [create-react-library](https://github.com/transitive-bullshit/create-react-library) CLI.

[![NPM](https://img.shields.io/npm/v/react-scatter-board.svg)](https://www.npmjs.com/package/react-scatter-board) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

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
