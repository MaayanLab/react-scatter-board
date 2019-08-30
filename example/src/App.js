import React, { Component } from "react";

import { ScatterBoard } from "react-scatter-board";

// 3d example
const dataUrl = "http://localhost:8080/GSE48968_tSNE_3.json";

export default class App extends Component {
  render() {
    return (
      <ScatterBoard
        url={dataUrl}
        shapeKey="strain"
        colorKey="description"
        labelKeys={["sample_id"]}
        is3d={true}
      />
    );
  }
}

// 2d example
// const dataUrl = "http://localhost:8080/A549-tSNE_layout.csv.json";
// export default class App extends Component {
//   render() {
//     return (
//       <ScatterBoard
//         url={dataUrl}
//         shapeKey="Time"
//         colorKey="MOA"
//         labelKeys={["sig_id"]}
//       />
//     );
//   }
// }
