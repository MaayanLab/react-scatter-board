import React from 'react'
import ReactDOM from 'react-dom'
import Suspense from './components/Suspense'

const ReactScatterBoard = React.lazy(() => import('./components/ReactScatterBoard'))
const ReactSelect = React.lazy(() => import('./components/ReactSelect'))

function App() {
  const sources = {
    'React Scatter Board': {
      is3d: true,
      source: require('./examples/react-scatter-board.json?url-loader').default,
    },
    'L1000FWD': {
      is3d: false,
      source: require('./examples/l1000fwd.json?url-loader').default,
    },
    'ARCHS4 Genes': {
      is3d: true,
      source: require('./examples/archs4-genes.json?url-loader').default,
    },
    'ARCHS4 Samples': {
      is3d: true,
      source: require('./examples/archs4-samples.json?url-loader').default,
    },
  }
  const [source, setSource] = React.useState()
  const [data, setData] = React.useState([])
  React.useEffect(async () => {
    if (source === undefined) {
      setData([])
    } else {
      const req = await fetch(sources[source].source)
      const ret = await req.json()
      setData(ret)
    }
  }, [source])
  return (
    <Suspense>
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <ReactSelect
          label="Pick a Dataset"
          facets={sources}
          current={source}
          onChange={({ value }) => setSource(value)}
        />
        <ReactScatterBoard
          is3d={(sources[source]||{}).is3d}
          toggle3d={(sources[source]||{}).is3d}
          data={data}
        />
      </div>
    </Suspense>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root'),
)
