# react-scatter-board

A React implementation of THREE.js 2d/3d scatter plot. This is a remake using react-three-fiber.

## Install

### Python
```
pip install --user --upgrade 'git+https://github.com/maayanlab/react-scatter-board@v2'
```

#### Usage

##### Jupyter
```python
from react_scatter_board import ReactScatterBoard
ScatterBoard(
  is3d=True,
  data=[
    dict(x=0, y=0, z=0, label='a', shape='s', color='r'),
    dict(x=1, y=1, z=-1, label='b', shape='t', color='g'),
    dict(x=-1, y=-1, z=-1, label='c', shape='c', color='b'),
    dict(x=0, y=0, z=1, label='d', shape='c', color='r'),
    dict(x=0, y=1, z=0, label='e', shape='t', color='g'),
    dict(x=0, y=0, z=-1, label='f', shape='t', color='b'),
  ],
)
```

### Javascript
```
npm install --save maayanlab/react-scatter-board#v2
```

#### Usage
See `src/demo.jsx` for more info.

```jsx
import ReactScatterBoard from 'react-scatter-board'

function MyApp() {
  const data = [
    {x:0, y: 0, z: 0, attribute: 'a'},
    {x:0, y: 1, z: -1, attribute: 'b'},
    // ...
  ]
  return <ReactScatterBoard data={data} />
}
```

#### Development
```bash
npm start
```

#### Deployment
```bash
npm run build:lib
```
