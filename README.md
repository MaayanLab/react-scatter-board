# react-scatter-board

A React implementation of THREE.js 2d/3d scatter plot. This library was created using the[create-react-library](https://github.com/transitive-bullshit/create-react-library) CLI.

[![NPM](https://img.shields.io/npm/v/react-scatter-board.svg)](https://www.npmjs.com/package/react-scatter-board) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save maayanlab/react-scatter-board
```

## Usage

```jsx
import React, { Component } from "react";

import { ScatterBoard } from "react-scatter-board";
import "./App.css";

export default class App extends Component {
  render() {
    return (
      <ScatterBoard
        url={"http://localhost:8080/GSE48968_tSNE_3.json"}
        shapeKey="strain"
        colorKey="description"
        labelKeys={["sample_id"]}
        is3d={true}
      />
    );
  }
}
```

## License

MIT © [MaayanLab](https://github.com/MaayanLab)
