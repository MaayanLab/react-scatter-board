import React, { Component } from 'react'
import { Container, Row, Col, Navbar, Jumbotron, Button } from 'react-bootstrap'
import Scrollspy from 'react-scrollspy'
import SyntaxHighlighter from 'react-syntax-highlighter'
import ghcolors from 'react-syntax-highlighter/dist/styles/prism/ghcolors'
import ReactMarkdown from 'react-markdown'

import { ScatterBoard } from '../src'
import { Lazy } from '../src'

// get the Bootstrap column width
const rootElem = document.getElementById('root')
const colWidth = rootElem.clientWidth * 0.66

// navbar with scrollspy
const navbar = (
  <Navbar fixed='top' bg='primary' variant='dark'>
    <Navbar.Brand href='#'>React Scatter Board</Navbar.Brand>
    <Scrollspy
      items={['section-1', 'section-2', 'section-3', 'section-4']}
      offset={-56}
      currentClassName='nav-item active'
      className='navbar-nav'
    >
      <li className='nav-item active'>
        <a className='nav-link' href='#section-1'>
          Getting started
        </a>
      </li>
      <li className='nav-item'>
        <a className='nav-link' href='#section-2'>
          Examples
        </a>
      </li>
      <li className='nav-item'>
        <a className='nav-link' href='#section-3'>
          Props
        </a>
      </li>
      <li className='nav-item'>
        <a className='nav-link' href='#section-4'>
          Developer guide
        </a>
      </li>
    </Scrollspy>
  </Navbar>
)

const usageCode = `import React, { Component } from 'react';
import { ScatterBoard } from 'react-scatter-board;
import './App.css';

export default class App extends Component {
  render() {
    return (
      <Lazy loading={<div>Loading...</div>}>{() =>
        fetch('https://amp.pharm.mssm.edu/scavi/graph/GSE48968/tSNE/3').then(
          response => response.json()
        ).then(data => (
          <ScatterBoard
            data={data}
            shapeKey='strain'
            colorKey='description'
            labelKeys={['sample_id']}
            searchKeys={['sample_id', 'description', 'source_name_ch1']}
            is3d={true}
          />
        ))
      }</Lazy>
    );
  }
}
`
const inputDataDocSting = `
## Input data format
The input data used for rendering the scatter plot should be passed through 
a URL that returns a JSON array of objects. Each object should at least contains 
\`x\`, \`y\` and optionally \`z\` attributes to define their coordinates in the 2d/3d 
space. It is recommended to normalize the ranges of \`x\`, \`y\`, and \`z\` to 
(-10, 10) for the ease of visualization. Objects in the JSON array can also have 
arbitrary continuous and categorical attributes for coloring and shaping. It is also 
recommended to have at least one attribute that uniquely identify each object in the 
JSON array. An example JSON array can be found 
[here](https://amp.pharm.mssm.edu/scavi/graph/GSE48968/tSNE/3).

## Interactivity

- Scatter plot
  + **Zoom**: mouse wheel or touch with two-finger spread or squish.
  + **Pan**: left mouse drag or arrow keys on keyboard.
  + **Rotation (3d only)**: left mouse drag or touch with one-finger move.
  + **Show tooltip**: mouse hover points in scatter plot.
  + **Activate custom point event**: Shift + mouse left click. See [mouseShiftClickCallback](#section-3) for details. 
- Color/Shape dropdowns: click on the dropdown select to update colors/shapes in the scatter plot.
- Search box: type anything to search and highlight for point(s) in the scatter plot.
`

// 2d example
const board2d = (
  <Lazy loading={<div>Loading...</div>}>{() =>
    fetch('https://amp.pharm.mssm.edu/l1000fwd/graph/A549_kNN_5').then(
      response => response.json()
    ).then(data => (
      <ScatterBoard
        data={data}
        shapeKey='Time'
        colorKey='MOA'
        labelKeys={['sig_id', 'MOA']}
        searchKeys={['MOA', 'Phase']}
        width={colWidth}
        height={colWidth}
        mouseShiftClickCallback={datum => alert(JSON.stringify(datum))}
      />
    ))
  }</Lazy>
)
const codeExample1 = `
<Lazy loading={<div>Loading...</div>}>{() =>
  fetch('https://amp.pharm.mssm.edu/l1000fwd/graph/A549_kNN_5').then(
    response => response.json()
  ).then(data => (
    <ScatterBoard
      data={data}
      shapeKey='Time'
      colorKey='MOA'
      labelKeys={['sig_id', 'MOA']}
      searchKeys={['MOA', 'Phase']}
      width={colWidth}
      height={colWidth}
      mouseShiftClickCallback={datum => alert(JSON.stringify(datum))}
    />
  ))
}</Lazy>
`

// 3d example
const board3d = (
  <Lazy loading={<div>Loading...</div>}>{() =>
    fetch('https://amp.pharm.mssm.edu/scavi/graph/GSE48968/tSNE/3').then(
      response => response.json()
    ).then(data => (
      <ScatterBoard
        data={data}
        shapeKey='strain'
        colorKey='description'
        labelKeys={['sample_id', 'description']}
        searchKeys={['sample_id', 'description', 'source_name_ch1']}
        is3d={true}
        width={colWidth}
        height={colWidth}
      />
    ))
  }</Lazy>
)
const codeExample2 = `
<Lazy loading={<div>Loading...</div>}>{() =>
  fetch('https://amp.pharm.mssm.edu/scavi/graph/GSE48968/tSNE/3').then(
    response => response.json()
  ).then(data => (
    <ScatterBoard
      data={data}
      shapeKey='strain'
      colorKey='description'
      labelKeys={['sample_id', 'description']}
      searchKeys={['sample_id', 'description', 'source_name_ch1']}
      is3d={true}
      width={colWidth}
      height={colWidth}
    />
  ))
}</Lazy>
`

// 3d example (disable search)
const board3dNoSearch = (
  <Lazy loading={<div>Loading...</div>}>{() =>
    fetch('https://amp.pharm.mssm.edu/scavi/graph/GSE48968/tSNE/3').then(
      response => response.json()
    ).then(data => (
      <ScatterBoard
        data={data}
        shapeKey='strain'
        colorKey='molecule_ch1'
        labelKeys={['sample_id', 'description']}
        is3d={true}
        width={colWidth}
        height={colWidth}
      />
    ))
  }</Lazy>
)
const codeExample3 = `
<Lazy loading={<div>Loading...</div>}>{() =>
  fetch('https://amp.pharm.mssm.edu/scavi/graph/GSE48968/tSNE/3').then(
    response => response.json()
  ).then(data => (
    <ScatterBoard
      data={data}
      shapeKey='strain'
      colorKey='molecule_ch1'
      labelKeys={['sample_id', 'description']}
      is3d={true}
      width={colWidth}
      height={colWidth}
    />
  ))
}</Lazy>
`

const propsDocString = `
# Props
- **url** (_string_): a URL to the json formatted data. Be sure to enable Cross-Origin Resource Sharing (CORS) if the URL is from another site. 
- **shapeKey** (_string_): the key to shape the dots by default.
- **colorKey** (_string_): the key to color the dots by default.
- **labelKeys** (_Array_ of strings): the ordered list of keys of attributes to display for the dots when mouse hovers.
- **searchKeys** (_Array_ of strings): the list of keys of attributes to enable the search functionality to query against. If not provided, the SearchSelectize component will not be rendered.
- **width** (_number_): the width of the component in pixels. Default: 1400.
- **height** (_number_): the height of the component in pixels. Default: 800.
- **is3d** (_boolean_): should the scatter plot in 3-D (true) or 2-D (false). 
- **mouseShiftClickCallback** (_function_): a callback function handling when user shift+click a data point. The input of the function is the datum object being clicked.  
`

const developerGuide = (
  <div>
    <h1>Development</h1>
    <h2>Local Development</h2>
    <p>Local development is broken into two parts (ideally using two tabs).</p>
    <p>
      First, run rollup to watch your <code>src/</code> module and automatically
      recompile it into <code>dist/</code> whenever you make changes.
    </p>
    <SyntaxHighlighter language='bash' style={ghcolors}>
      {`npm start # runs rollup with watch flag`}
    </SyntaxHighlighter>
    <p>
      The second part will be running the <code>example/</code> create-react-app
      that's linked to the local version of your module.
    </p>
    <SyntaxHighlighter language='bash' style={ghcolors}>
      {`# (in another tab)
cd example
npm start # runs create-react-app dev server`}
    </SyntaxHighlighter>
    <p>
      Now, anytime you make a change to your library in src/ or to the example
      app's <code>example/src</code>, create-react-app will live-reload your
      local dev server so you can iterate on your component in real-time.
    </p>
    <h2>Deployment to GitHub Pages</h2>
    <SyntaxHighlighter language='bash' style={ghcolors}>
      {`npm run deploy`}
    </SyntaxHighlighter>
    <p>
      This creates a production build of the example{' '}
      <code>create-react-app</code> that showcases your library and then runs{' '}
      <code>gh-pages</code> to deploy the resulting bundle.
    </p>
    <h2>Publishing to npm</h2>
    <SyntaxHighlighter language='bash' style={ghcolors}>
      {`npm publish`}
    </SyntaxHighlighter>
    <p>
      Make sure that any npm modules you want as peer dependencies are properly
      marked as <code>peerDependencies</code> in <code>package.json</code>. The
      rollup config will automatically recognize them as peers and not try to
      bundle them in your module.
    </p>
  </div>
)

export default class App extends Component {
  render() {
    return (
      <div>
        {navbar}
        <Jumbotron fluid>
          <Container>
            <h1>React Scatter Board</h1>
            <p>
              A React implementation of THREE.js 2d/3d scatter plot. This
              library was created using the create-react-library CLI.
            </p>
            <Button
              variant='outline-dark'
              href='https://github.com/MaayanLab/react-scatter-board'
            >
              GitHub repo
            </Button>
          </Container>
        </Jumbotron>

        <Container fluid={true}>
          <Row id='section-1' className='justify-content-md-center'>
            <Col md={10}>
              <h1>Getting started</h1>
              <h2>Install</h2>
              <SyntaxHighlighter language='bash' style={ghcolors}>
                {'npm install --save maayanlab/react-scatter-board'}
              </SyntaxHighlighter>
              <h2>Usage</h2>
              <SyntaxHighlighter language='javascript' style={ghcolors}>
                {usageCode}
              </SyntaxHighlighter>
              <ReactMarkdown source={inputDataDocSting} />
            </Col>
          </Row>
          <div id='section-2'>
            <Row className='justify-content-md-center'>
              <Col md={12}>
                <h1>Examples</h1>
              </Col>
            </Row>
            <Row>
              <Col xs={4}>
                <h2>2d Example:</h2>
                <SyntaxHighlighter
                  language='jsx'
                  style={ghcolors}
                  wrapLines={true}
                >
                  {codeExample1}
                </SyntaxHighlighter>
              </Col>
              <Col xs={8}>{board2d}</Col>
            </Row>
            <Row>
              <Col xs={4}>
                <h2>3d Example:</h2>
                <SyntaxHighlighter
                  language='jsx'
                  style={ghcolors}
                  wrapLines={true}
                >
                  {codeExample2}
                </SyntaxHighlighter>
              </Col>
              <Col xs={8}>{board3d}</Col>
            </Row>
            <Row>
              <Col xs={4}>
                <h2>3d Example: disabling search</h2>
                <SyntaxHighlighter
                  language='jsx'
                  style={ghcolors}
                  wrapLines={true}
                >
                  {codeExample3}
                </SyntaxHighlighter>
              </Col>
              <Col xs={8}>{board3dNoSearch}</Col>
            </Row>
          </div>
          <Row id='section-3' className='justify-content-md-center'>
            <Col md={10}>
              <ReactMarkdown source={propsDocString} />
            </Col>
          </Row>
          <Row id='section-4' className='justify-content-md-center'>
            <Col md={10}>{developerGuide}</Col>
          </Row>
        </Container>
      </div>
    )
  }
}
